import type { NextApiRequest, NextApiResponse } from "next"

const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || ""
const NOTION_DB_ID = process.env.NOTION_PAGE_ID || ""
const NOTION_BASE = "https://api.notion.com/v1"
const HEADERS = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
}

async function notionFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${NOTION_BASE}${path}`, { ...options, headers: HEADERS })
  if (!res.ok) throw new Error(`Notion API ${res.status}`)
  return res.json()
}

async function queryAllPages() {
  const results: any[] = []
  let cursor: string | undefined
  while (true) {
    const body: any = { sorts: [{ property: "date", direction: "descending" }], page_size: 100 }
    if (cursor) body.start_cursor = cursor
    const data = await notionFetch(`/databases/${NOTION_DB_ID}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    })
    results.push(...data.results)
    if (!data.has_more) break
    cursor = data.next_cursor
  }
  return results
}

function parsePage(page: any) {
  const props = page.properties
  const getText = (p: any) =>
    p?.title?.map((t: any) => t.plain_text).join("") ||
    p?.rich_text?.map((t: any) => t.plain_text).join("") || ""
  const getSelect = (p: any) =>
    p?.select ? [p.select.name] : p?.multi_select?.map((s: any) => s.name) || p?.status ? [p.status.name] : []
  const getDate = (p: any) => p?.date ? { start_date: p.date.start } : { start_date: "" }
  const getFile = (p: any) => {
    const f = p?.files?.[0]
    return f?.external?.url || f?.file?.url || null
  }

  const titleKey = Object.keys(props).find((k) => props[k].type === "title") || "Name"

  return {
    id: page.id,
    title: getText(props[titleKey]),
    slug: getText(props.slug),
    status: getSelect(props.status),
    type: getSelect(props.type),
    date: getDate(props.date),
    tags: props.tags?.multi_select?.map((s: any) => s.name) || [],
    category: props.category?.multi_select?.map((s: any) => s.name) || props.category?.select ? [props.category.select.name] : [],
    summary: getText(props.summary),
    thumbnail: getFile(props.thumbnail),
    createdTime: page.created_time,
    fullWidth: false,
  }
}

async function getAllBlockChildren(blockId: string): Promise<any[]> {
  const all: any[] = []
  let cursor: string | undefined
  while (true) {
    const qs = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100"
    const data = await notionFetch(`/blocks/${blockId}/children${qs}`)
    all.push(...data.results)
    if (!data.has_more) break
    cursor = data.next_cursor
  }
  for (const block of all) {
    if (block.has_children) {
      block.children = await getAllBlockChildren(block.id)
    }
  }
  return all
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query
  const segments = Array.isArray(path) ? path : [path]
  const route = segments.join("/")

  try {
    // GET /api/py/posts
    if (route === "posts" && req.method === "GET") {
      const statusFilter = (req.query.status as string || "Public,Pinned,Archived").split(",")
      const typeFilter = (req.query.type as string || "Post").split(",")

      const pages = await queryAllPages()
      const posts = pages.map(parsePage).filter(
        (p: any) => p.title && p.slug && statusFilter.includes(p.status?.[0]) && typeFilter.includes(p.type?.[0])
      )
      return res.json(JSON.parse(JSON.stringify(posts)))
    }

    // GET /api/py/pages/:id/blocks
    if (segments[0] === "pages" && segments[2] === "blocks") {
      const pageId = segments[1] as string
      const page = await notionFetch(`/pages/${pageId}`)
      const blocks = await getAllBlockChildren(pageId)
      return res.json({ page, blocks })
    }

    // GET /api/py/tags
    if (route === "tags") {
      const pages = await queryAllPages()
      const posts = pages.map(parsePage).filter((p: any) => p.title && p.slug)
      const tags: Record<string, number> = {}
      posts.forEach((p: any) => p.tags?.forEach((t: string) => { tags[t] = (tags[t] || 0) + 1 }))
      return res.json(tags)
    }

    // GET /api/py/contributions
    if (route === "contributions") {
      const github = req.query.github as string || ""
      const gitlab = req.query.gitlab as string || ""
      const merged: Record<string, any> = {}

      if (github) {
        try {
          const ghRes = await fetch(`https://github.com/users/${github}/contributions`)
          if (ghRes.ok) {
            const html = await ghRes.text()
            const re = /data-ix="(\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="contribution-day-component-\d+-\d+"[^>]*data-level="(\d)"/g
            let m
            const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
            while ((m = re.exec(html))) {
              const [, ix, date, level] = m
              merged[date] = { date, count: parseInt(level), color: colors[parseInt(level)] || colors[0], weekIndex: parseInt(ix) }
            }
          }
        } catch {}
      }

      if (gitlab) {
        try {
          const glRes = await fetch(`https://gitlab.com/users/${gitlab}/calendar.json`)
          if (glRes.ok) {
            const data = await glRes.json()
            const colors = ["#ebedf0", "#acd5f2", "#7fa8c9", "#527ba0", "#254e77"]
            for (const [date, count] of Object.entries(data) as [string, number][]) {
              if (merged[date]) {
                merged[date].count += count
              } else {
                const c = count <= 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4
                merged[date] = { date, count, color: colors[c], weekIndex: null }
              }
            }
          }
        } catch {}
      }

      const combined = Object.values(merged).map((v: any) => {
        const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
        const c = v.count <= 0 ? 0 : v.count <= 2 ? 1 : v.count <= 5 ? 2 : v.count <= 9 ? 3 : 4
        return { ...v, color: colors[c] }
      })
      return res.json(combined)
    }

    res.status(404).json({ error: "Not found" })
  } catch (e: any) {
    console.error("API error:", e.message)
    res.status(500).json({ error: e.message })
  }
}
