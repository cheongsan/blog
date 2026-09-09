import { NotionAPI } from "notion-client"
import { Client } from "@notionhq/client"
import { CONFIG } from "@/site.config"

// notion-client (unofficial API) - no auth needed for published pages
export const notionClient = new NotionAPI()

// @notionhq/client (official API) - uses integration token
export const notionHQClient = new Client({
  auth: CONFIG.notionConfig.accessToken,
})
