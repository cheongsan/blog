import type { NextApiRequest, NextApiResponse } from "next"

const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || ""

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { blockId } = req.query
  if (!blockId || typeof blockId !== "string") {
    return res.status(400).end()
  }

  try {
    // Fetch fresh signed URL from Notion API
    const notionRes = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    })
    if (!notionRes.ok) return res.status(notionRes.status).end()

    const block = await notionRes.json()
    const data = block[block.type] || {}
    const url =
      data.file?.url || data.external?.url ||
      data.icon?.file?.url || data.icon?.external?.url ||
      block.icon?.file?.url || block.icon?.external?.url

    if (!url) return res.status(404).end()

    // Download image
    const imgRes = await fetch(url)
    if (!imgRes.ok) return res.status(imgRes.status).end()

    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const contentType = imgRes.headers.get("content-type") || "image/png"

    res.setHeader("Content-Type", contentType)
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
    res.send(buffer)
  } catch {
    res.status(500).end()
  }
}
