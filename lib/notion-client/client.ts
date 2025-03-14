import { NotionAPI } from "notion-client"
import { Client } from "@notionhq/client"
import { CONFIG } from "@/site.config"

export const notionClient = new NotionAPI({
  authToken: CONFIG.notionConfig.accessToken,
})

export const notionHQClient = new Client({
  auth: CONFIG.notionConfig.accessToken,
}) 