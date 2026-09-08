import { TPosts, TPost } from "@/types"
import { notionFetch } from "@/lib/notion-client/notionFetch"

const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || ""
const NOTION_DB_ID = process.env.NOTION_PAGE_ID || ""

const HEADERS = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
}

async function queryAllPages(): Promise<any[]> {
  const results: any[] = []
  let cursor: string | undefined
  while (true) {
    const body: any = { sorts: [{ property: "date", direction: "descending" }], page_size: 100 }
    if (cursor) body.start_cursor = cursor
    const res = await notionFetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: "POST", headers: HEADERS, body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Notion API error: ${res.status}`)
    const data = await res.json()
    results.push(...data.results)
    if (!data.has_more) break
    cursor = data.next_cursor
  }
  return results
}

function parsePage(page: any): TPost {
  const props = page.properties
  const getText = (p: any) =>
    p?.title?.map((t: any) => t.plain_text).join("") ||
    p?.rich_text?.map((t: any) => t.plain_text).join("") || ""
  const getSelect = (p: any) => {
    if (p?.select) return [p.select.name]
    if (p?.multi_select) return p.multi_select.map((s: any) => s.name)
    if (p?.status) return [p.status.name]
    return []
  }
  const getFile = (p: any, property: string) => {
    const f = p?.files?.[0]
    if (!f) return null
    // External files keep a permanent URL, but Notion-hosted ones come back as
    // S3 URLs signed for an hour. Baking one into an ISR page cached for a day
    // leaves a dead link, so point at the proxy route, which re-signs per
    // request.
    if (f.external?.url) return f.external.url
    if (f.file?.url) {
      return `/api/notion/image?pageId=${encodeURIComponent(
        page.id
      )}&property=${encodeURIComponent(property)}&kind=property`
    }
    return null
  }
  const titleKey = Object.keys(props).find((k) => props[k].type === "title") || "Name"

  return {
    id: page.id,
    title: getText(props[titleKey]),
    slug: getText(props.slug),
    status: getSelect(props.status),
    type: getSelect(props.type),
    date: props.date?.date ? { start_date: props.date.date.start } : { start_date: "" },
    tags: props.tags?.multi_select?.map((s: any) => s.name) || [],
    category: getSelect(props.category),
    summary: getText(props.summary),
    thumbnail: getFile(props.thumbnail, "thumbnail"),
    createdTime: page.created_time,
    fullWidth: false,
  }
}

// Every post page calls both fetchAllPosts() and fetchDetailPosts(), so a
// build of N posts issued 2N full database queries and rate-limited itself.
// One query per window serves them all; the content revalidates daily, so a
// few minutes of staleness costs nothing.
const QUERY_CACHE_TTL_MS = 5 * 60 * 1000
let queryCache: { at: number; pages: Promise<any[]> } | null = null

function queryAllPagesCached(): Promise<any[]> {
  const now = Date.now()
  if (queryCache && now - queryCache.at < QUERY_CACHE_TTL_MS) {
    return queryCache.pages
  }
  // Cache the promise, not the result, so concurrent callers share one request.
  // Drop it on failure so a rate-limited query isn't remembered as the answer.
  const pages = queryAllPages().catch((e) => {
    queryCache = null
    throw e
  })
  queryCache = { at: now, pages }
  return pages
}

async function fetchFilteredPosts(acceptStatus: string[], acceptType: string[]): Promise<TPosts> {
  const pages = await queryAllPagesCached()
  const posts = pages.map(parsePage).filter(
    (p) => p.title && p.slug && acceptStatus.includes(p.status?.[0]) && acceptType.includes(p.type?.[0])
  )
  return JSON.parse(JSON.stringify(posts))
}

export async function fetchAllPosts(): Promise<TPosts> {
  return fetchFilteredPosts(["Public", "Pinned", "Archived"], ["Post"])
}

export async function fetchDetailPosts(): Promise<TPosts> {
  return fetchFilteredPosts(
    ["Public", "PublicOnDetail", "Pinned", "Archived"],
    ["Paper", "Post", "Page"]
  )
}
