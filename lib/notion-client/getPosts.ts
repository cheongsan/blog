import { CONFIG } from "@/site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "@/lib/notion/getAllPageIds"
import getPageProperties from "@/lib/notion/getPageProperties"
import { TPosts } from "@/types"

function normalizeSection(data: Record<string, any>) {
  if (!data) return
  for (const key of Object.keys(data)) {
    const entry = data[key]
    if (entry?.value?.value && entry.value.role !== undefined) {
      data[key] = { value: entry.value.value, role: entry.value.role }
    }
  }
}

export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  const api = new NotionAPI()

  const response = await api.getPage(id)

  // Normalize double-wrapped entries
  for (const section of ['block', 'collection', 'collection_view', 'notion_user'] as const) {
    normalizeSection((response as any)[section])
  }

  id = idToUuid(id)
  const collection = Object.values(response.collection)[0]?.value
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = block[id].value

  if (
    rawMetadata?.type !== "collection_view_page" &&
    rawMetadata?.type !== "collection_view"
  ) {
    return []
  } else {
    const pageIds = getAllPageIds(response)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const properties = (await getPageProperties(id, block, schema)) || null
      properties.createdTime = new Date(
        block[id].value?.created_time
      ).toString()
      properties.fullWidth =
        (block[id].value?.format as any)?.page_full_width ?? false

      data.push(properties)
    }

    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    const posts = data as TPosts
    return posts
  }
}
