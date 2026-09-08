import { ExtendedRecordMap } from "notion-types"
import { notionFetch } from "./notionFetch"

const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || ""
const NOTION_HEADERS = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
}

/**
 * Convert Notion official API block data to react-notion-x ExtendedRecordMap format.
 */
function blocksToRecordMap(pageId: string, page: any, blocks: any[]): ExtendedRecordMap {
  const blockMap: Record<string, any> = {}
  const cleanId = pageId.replace(/-/g, "")
  const uuidId = cleanId.length === 32
    ? `${cleanId.slice(0,8)}-${cleanId.slice(8,12)}-${cleanId.slice(12,16)}-${cleanId.slice(16,20)}-${cleanId.slice(20)}`
    : pageId

  // Build root page block
  const childIds = blocks.map((b: any) => b.id)
  blockMap[uuidId] = {
    value: {
      id: uuidId,
      type: "page",
      version: 1,
      properties: {
        title: [[page.properties?.title?.title?.[0]?.plain_text || page.properties?.Name?.title?.[0]?.plain_text || ""]],
      },
      content: childIds,
      created_time: new Date(page.created_time).getTime(),
      last_edited_time: new Date(page.last_edited_time).getTime(),
      parent_id: page.parent?.database_id || page.parent?.page_id || "",
      parent_table: "collection",
      alive: true,
      format: {
        page_full_width: page.properties?.fullWidth?.checkbox || false,
        page_cover: page.cover?.external?.url || page.cover?.file?.url || undefined,
        page_icon: page.icon?.emoji || page.icon?.external?.url || page.icon?.file?.url,
      },
    },
    role: "reader",
  }

  // Convert each block
  function addBlock(block: any, parentId: string) {
    const blockId = block.id
    const type = mapBlockType(block.type)
    const children = block.children || []
    const childContentIds = children.map((c: any) => c.id)

    const value: any = {
      id: blockId,
      type,
      version: 1,
      parent_id: parentId,
      parent_table: "block",
      alive: true,
      created_time: new Date(block.created_time).getTime(),
      last_edited_time: new Date(block.last_edited_time).getTime(),
      properties: {},
      format: {},
    }

    if (childContentIds.length > 0) {
      value.content = childContentIds
    }

    // Extract text content
    const data = block[block.type]
    if (data) {
      if (data.rich_text) {
        value.properties.title = richTextToNotionFormat(data.rich_text)
      }
      if (data.caption) {
        value.properties.caption = richTextToNotionFormat(data.caption)
      }
      if (data.language) {
        value.properties.language = [[data.language]]
      }
      if (data.url) {
        value.properties.source = [[data.url]]
        value.format.display_source = data.url
      }
      if (data.checked !== undefined) {
        value.properties.checked = [[data.checked ? "Yes" : "No"]]
      }
      if (data.color && data.color !== "default") {
        value.format.block_color = data.color
      }
      if (data.is_toggleable) {
        value.format.toggleable = true
      }

      // Image/file/video - keep original URL, mapImageUrl will proxy at render
      const mediaUrl =
        (data.type === "external" && data.external?.url) ||
        (data.type === "file" && data.file?.url) || null
      if (mediaUrl) {
        value.properties.source = [[mediaUrl]]
        value.format.display_source = mediaUrl
      }

      // Icon for callout
      if (data.icon) {
        // Icon
        const iconUrl = data.icon?.external?.url || data.icon?.file?.url
        if (data.icon?.emoji) {
          value.format.page_icon = data.icon.emoji
        } else if (data.icon?.type === "icon" && data.icon?.icon) {
          value.format.page_icon = `/icons/${data.icon.icon.name}_${data.icon.icon.color}.svg`
        } else if (iconUrl) {
          // Keep original URL - mapImageUrl will proxy S3 URLs at render time
          value.format.page_icon = iconUrl
        }
      }

      // Table
      if (block.type === "table") {
        value.format.table_block_column_order = []
        value.format.table_block_column_header = data.has_column_header
        value.format.table_block_row_header = data.has_row_header
      }
      if (block.type === "table_row") {
        const cells = data.cells || []
        cells.forEach((cell: any, i: number) => {
          const key = `col_${i}`
          value.properties[key] = richTextToNotionFormat(cell)
          if (!blockMap[parentId]?.value?.format?.table_block_column_order) {
            // will be set by parent
          }
        })
      }
    }

    blockMap[blockId] = { value, role: "reader" }

    // Recurse children
    for (const child of children) {
      addBlock(child, blockId)
    }
  }

  for (const block of blocks) {
    addBlock(block, uuidId)
  }

  return {
    block: blockMap,
    collection: {},
    collection_view: {},
    notion_user: {},
    collection_query: {},
    signed_urls: {},
  } as any
}

function mapBlockType(type: string): string {
  const map: Record<string, string> = {
    paragraph: "text",
    heading_1: "header",
    heading_2: "sub_header",
    heading_3: "sub_sub_header",
    bulleted_list_item: "bulleted_list",
    numbered_list_item: "numbered_list",
    to_do: "to_do",
    toggle: "toggle",
    code: "code",
    quote: "quote",
    callout: "callout",
    divider: "divider",
    image: "image",
    video: "video",
    audio: "audio",
    file: "file",
    pdf: "pdf",
    bookmark: "bookmark",
    embed: "embed",
    equation: "equation",
    table: "table",
    table_row: "table_row",
    column_list: "column_list",
    column: "column",
    synced_block: "transclusion_container",
    child_page: "page",
    child_database: "collection_view",
    table_of_contents: "table_of_contents",
    breadcrumb: "breadcrumb",
    link_to_page: "alias",
  }
  return map[type] || type
}

function richTextToNotionFormat(richText: any[]): any[][] {
  if (!richText || richText.length === 0) return [[""]]
  return richText.map((rt: any) => {
    const text = rt.plain_text || ""
    const annotations = rt.annotations || {}
    const decorations: any[] = []

    if (annotations.bold) decorations.push(["b"])
    if (annotations.italic) decorations.push(["i"])
    if (annotations.strikethrough) decorations.push(["s"])
    if (annotations.underline) decorations.push(["_"])
    if (annotations.code) decorations.push(["c"])
    if (annotations.color && annotations.color !== "default") {
      decorations.push(["h", annotations.color])
    }
    if (rt.href) decorations.push(["a", rt.href])

    return decorations.length > 0 ? [text, decorations] : [text]
  })
}

async function fetchAllBlockChildren(blockId: string): Promise<any[]> {
  const all: any[] = []
  let cursor: string | undefined
  while (true) {
    const qs = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100"
    // notionFetch throws once rate-limit retries are exhausted, so a 429 can
    // no longer silently drop the rest of a page's blocks: the caller sees the
    // failure instead of publishing a half-rendered post.
    const res = await notionFetch(`https://api.notion.com/v1/blocks/${blockId}/children${qs}`, {
      headers: NOTION_HEADERS,
    })
    if (!res.ok) {
      console.warn(
        `Notion API ${res.status} listing children of ${blockId} — omitting the rest of this block`
      )
      break
    }
    const data = await res.json()
    all.push(...data.results)
    if (!data.has_more) break
    cursor = data.next_cursor
  }
  for (const block of all) {
    if (block.has_children) {
      block.children = await fetchAllBlockChildren(block.id)
    }
  }
  return all
}

export const getRecordMap = async (pageId: string): Promise<ExtendedRecordMap | undefined> => {
  try {
    const res = await notionFetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: NOTION_HEADERS,
    })
    if (!res.ok) throw new Error(`Notion API error: ${res.status}`)
    const page = await res.json()
    const blocks = await fetchAllBlockChildren(pageId)
    return JSON.parse(JSON.stringify(blocksToRecordMap(pageId, page, blocks)))
  } catch (e) {
    console.error("Failed to fetch recordMap:", e)
    return undefined
  }
}
