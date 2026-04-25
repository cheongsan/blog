import type { NextApiRequest, NextApiResponse } from "next"
import { getRecordMap } from "@/lib/notion-client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { pageId } = req.query
  if (!pageId || typeof pageId !== "string") {
    return res.status(400).json({ error: "pageId is required" })
  }

  try {
    const recordMap = await getRecordMap(String(pageId).replace(/-/g, ''))
    res.status(200).json(recordMap)
  } catch {
    res.status(500).json({ error: "Failed to fetch record map" })
  }
}
