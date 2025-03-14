import { notionClient } from "./client"
import { CONFIG } from "@/site.config"
import { withRetry, handleNotionError } from "./utils"

export const getRecordMap = async (pageId: string) => {
  try {
    const recordMap = await withRetry(async () => {
      return await notionClient.getPage(pageId)
    })
    return recordMap
  } catch (error) {
    handleNotionError(error)
  }
}
