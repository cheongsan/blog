import { TPosts, TPost } from "@/types"

const FASTAPI_URL =
  process.env.FASTAPI_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8000")

const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || ""
const NOTION_DB_ID = process.env.NOTION_PAGE_ID || ""

async function fetchFromFastAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${FASTAPI_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`)
  return res.json()
}

/** Fallback: query Notion official API directly */
async function fetchPostsFromNotion(): Promise<TPosts> {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        sorts: [{ property: "date", direction: "descending" }],
      }),
    }
  )
  if (!res.ok) throw new Error(`Notion API error: ${res.status}`)
  const data = await res.json()

  const result = data.results.map((page: any): TPost => {
    const props = page.properties
    const getText = (p: any) =>
      p?.title?.map((t: any) => t.plain_text).join("") ||
      p?.rich_text?.map((t: any) => t.plain_text).join("") || ""
    const getSelect = (p: any) =>
      p?.select ? [p.select.name] : p?.multi_select?.map((s: any) => s.name) || []
    const getDate = (p: any) =>
      p?.date ? { start_date: p.date.start } : { start_date: "" }
    const getFile = (p: any) => {
      const f = p?.files?.[0]
      return f?.external?.url || f?.file?.url || undefined
    }

    // Find title field (could be "Name", "이름", etc.)
    const titleKey = Object.keys(props).find(
      (k) => props[k].type === "title"
    ) || "Name"

    return {
      id: page.id,
      title: getText(props[titleKey]),
      slug: getText(props.slug),
      status: getSelect(props.status),
      type: getSelect(props.type),
      date: getDate(props.date),
      tags: getSelect(props.tags),
      category: getSelect(props.category),
      summary: getText(props.summary),
      thumbnail: getFile(props.thumbnail) || null,
      createdTime: page.created_time,
      fullWidth: false,
    }
  }).filter((p: TPost) => p.title && p.slug)

  // Sanitize: replace undefined with null for Next.js serialization
  return JSON.parse(JSON.stringify(result))
}

function filterByStatusAndType(
  posts: TPosts,
  acceptStatus: string[],
  acceptType: string[]
): TPosts {
  return posts.filter((p) => {
    const s = p.status?.[0]
    const t = p.type?.[0]
    return s && acceptStatus.includes(s) && t && acceptType.includes(t)
  })
}

async function fetchPostsWithFallback(
  status: string,
  type: string,
  acceptStatus: string[],
  acceptType: string[]
): Promise<TPosts> {
  try {
    const params = new URLSearchParams({ status, type })
    return await fetchFromFastAPI<TPosts>(`/py-api/posts?${params}`)
  } catch {
    const posts = await fetchPostsFromNotion()
    return filterByStatusAndType(posts, acceptStatus, acceptType)
  }
}

export async function fetchAllPosts(): Promise<TPosts> {
  return fetchPostsWithFallback(
    "Public,Pinned,Archived", "Post",
    ["Public", "Pinned", "Archived"], ["Post"]
  )
}

export async function fetchDetailPosts(): Promise<TPosts> {
  return fetchPostsWithFallback(
    "Public,PublicOnDetail,Pinned,Archived", "Paper,Post,Page",
    ["Public", "PublicOnDetail", "Pinned", "Archived"], ["Paper", "Post", "Page"]
  )
}
