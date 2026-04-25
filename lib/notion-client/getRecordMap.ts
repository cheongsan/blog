import { notionClient } from "./client"
import { withRetry, handleNotionError } from "./utils"
import { ExtendedRecordMap } from "notion-types"
import { getBlockCollectionId, getPageContentBlockIds } from "notion-utils"
import { NotionAPI } from "notion-client"

/**
 * Normalize double-wrapped recordMap entries.
 * Notion API now returns { spaceId, value: { value: {...}, role } }
 * but react-notion-x expects { value: {...}, role }.
 */
function normalizeSection(data: Record<string, any>) {
  if (!data) return
  for (const key of Object.keys(data)) {
    const entry = data[key]
    if (entry?.value?.value && entry.value.role !== undefined) {
      data[key] = { value: entry.value.value, role: entry.value.role }
    }
  }
}

function normalizeRecordMap(rm: ExtendedRecordMap): ExtendedRecordMap {
  for (const section of ['block', 'collection', 'collection_view', 'notion_user'] as const) {
    normalizeSection((rm as any)[section])
  }
  return rm
}

/**
 * After normalization, re-fetch collection data and missing blocks
 * that notion-client couldn't fetch due to double-wrapping.
 */
async function patchRecordMap(rm: ExtendedRecordMap, api: NotionAPI): Promise<ExtendedRecordMap> {
  // 1. Fetch missing blocks
  const contentBlockIds = getPageContentBlockIds(rm)
  const missingBlockIds = contentBlockIds.filter(id => !rm.block[id])

  if (missingBlockIds.length > 0) {
    const raw = await (api as any).getBlocks(missingBlockIds)
    const newBlocks = raw.recordMap?.block || {}
    normalizeSection(newBlocks)
    rm.block = { ...rm.block, ...newBlocks }
  }

  // 2. Fetch collection data for collection_view blocks
  const allBlockIds = getPageContentBlockIds(rm)
  for (const blockId of allBlockIds) {
    const block = rm.block[blockId]?.value as any
    if (!block) continue
    if (block.type !== 'collection_view' && block.type !== 'collection_view_page') continue

    const collectionId = getBlockCollectionId(block, rm as any)
    if (!collectionId) continue

    const viewIds: string[] = block.view_ids || []
    for (const viewId of viewIds) {
      if (rm.collection_query?.[collectionId]?.[viewId]) continue

      try {
        const collectionView = (rm.collection_view as any)[viewId]?.value
        const colData = await (api as any).getCollectionData(collectionId, viewId, collectionView)

        if (colData.recordMap?.block) {
          normalizeSection(colData.recordMap.block)
          rm.block = { ...rm.block, ...colData.recordMap.block }
        }
        if (colData.recordMap?.collection) {
          normalizeSection(colData.recordMap.collection)
          rm.collection = { ...rm.collection, ...colData.recordMap.collection }
        }
        if (colData.recordMap?.collection_view) {
          normalizeSection(colData.recordMap.collection_view)
          rm.collection_view = { ...rm.collection_view, ...colData.recordMap.collection_view }
        }

        if (!rm.collection_query) rm.collection_query = {} as any
        if (!rm.collection_query[collectionId]) rm.collection_query[collectionId] = {} as any
        rm.collection_query[collectionId][viewId] = colData.result?.reducerResults
      } catch (e) {
        console.warn('Failed to fetch collection data:', collectionId, viewId, e)
      }
    }
  }

  return rm
}

export const getRecordMap = async (pageId: string) => {
  try {
    const recordMap = await withRetry(async () => {
      return await notionClient.getPage(pageId)
    })
    if (!recordMap) return undefined

    normalizeRecordMap(recordMap)
    return await patchRecordMap(recordMap, notionClient)
  } catch (error) {
    handleNotionError(error)
  }
}
