const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || ""
const NOTION_HEADERS = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
}

// Streams the upstream body straight through, so a large original isn't
// buffered into the 4.5MB serverless response cap.
export const config = { runtime: "edge" }

type Kind = "auto" | "cover" | "icon" | "property"

const KINDS: Kind[] = ["auto", "cover", "icon", "property"]

// Notion ids are 32 hex chars, optionally dash separated. Validated before
// being interpolated into an API path so a crafted id can't walk out of
// /v1/blocks or /v1/pages and reach another endpoint.
const isNotionId = (id: string) => /^[0-9a-f]{32}$/.test(id.replace(/-/g, ""))

// Notion only hands back URLs on these hosts. Checked before fetching so this
// route can't be turned into a proxy for arbitrary origins.
const isAllowedHost = (host: string) =>
  host === "www.notion.so" ||
  host === "images.unsplash.com" ||
  host.endsWith(".amazonaws.com")

const fileUrl = (file: any): string | null =>
  file?.file?.url || file?.external?.url || null

const fail = (status: number) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store" } })

async function notionJson(path: string) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    headers: NOTION_HEADERS,
  })
  if (!res.ok) return null
  return res.json()
}

function resolveFromBlock(block: any): string | null {
  const data = block?.[block?.type] || {}
  return fileUrl(data) || fileUrl(data.icon) || fileUrl(block?.icon)
}

function resolveFromPage(
  page: any,
  kind: Kind,
  property: string
): string | null {
  if (kind === "cover") return fileUrl(page?.cover)
  if (kind === "icon") return fileUrl(page?.icon)

  const files = property ? page?.properties?.[property]?.files : undefined
  const fromProperty = Array.isArray(files) ? fileUrl(files[0]) : null
  if (fromProperty) return fromProperty
  if (kind === "property") return null

  return fileUrl(page?.cover) || fileUrl(page?.icon)
}

/**
 * Re-signs a Notion asset on every request.
 *
 * Notion-hosted files are served from S3 behind a signature that expires after
 * an hour, so a URL captured at build time is already dead by the time an
 * ISR-cached page is served. Pages point at this stable route instead, and it
 * asks Notion for a fresh URL and streams the bytes back.
 */
export default async function handler(req: Request) {
  const params = new URL(req.url).searchParams
  const pageId = params.get("pageId") || ""
  const blockId = params.get("blockId") || ""
  const property = params.get("property") || ""
  const requestedKind = (params.get("kind") || "") as Kind
  const kind: Kind = KINDS.includes(requestedKind) ? requestedKind : "auto"

  const id = pageId || blockId
  if (!id || !isNotionId(id) || property.length > 100) return fail(400)

  try {
    let url: string | null = null

    // Covers only ever live on a page, so skip the block lookup for them.
    if (!pageId && kind !== "cover") {
      const block = await notionJson(`blocks/${id}`)
      url = block ? resolveFromBlock(block) : null
    }

    // A page id passed as blockId comes back from /v1/blocks as a bare
    // child_page, which carries no asset — fall through to the page itself.
    if (!url) {
      const page = await notionJson(`pages/${id}`)
      url = page ? resolveFromPage(page, kind, property) : null
    }

    if (!url) return fail(404)
    if (!isAllowedHost(new URL(url).hostname)) return fail(502)

    const imgRes = await fetch(url)
    if (!imgRes.ok) return fail(imgRes.status)

    const headers = new Headers({
      "Content-Type": imgRes.headers.get("content-type") || "image/png",
      // The proxy URL is stable, so the bytes can be cached hard at the edge.
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    })
    const length = imgRes.headers.get("content-length")
    if (length) headers.set("Content-Length", length)

    if (req.method === "HEAD") return new Response(null, { headers })
    return new Response(imgRes.body, { headers })
  } catch {
    return fail(500)
  }
}
