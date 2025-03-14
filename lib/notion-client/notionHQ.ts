import { notionHQClient } from "./client"
import { withRetry, handleNotionError } from "./utils"

export const getNotionPage = async (pageId: string) => {
  try {
    return await withRetry(async () => {
      return await notionHQClient.pages.retrieve({ page_id: pageId })
    })
  } catch (error) {
    handleNotionError(error)
  }
}

export const getNotionDatabase = async (databaseId: string) => {
  try {
    return await withRetry(async () => {
      return await notionHQClient.databases.retrieve({ database_id: databaseId })
    })
  } catch (error) {
    handleNotionError(error)
  }
}

export const queryNotionDatabase = async (databaseId: string, filter?: any) => {
  try {
    return await withRetry(async () => {
      return await notionHQClient.databases.query({
        database_id: databaseId,
        filter,
      })
    })
  } catch (error) {
    handleNotionError(error)
  }
}

export const getNotionBlock = async (blockId: string) => {
  try {
    return await withRetry(async () => {
      return await notionHQClient.blocks.retrieve({ block_id: blockId })
    })
  } catch (error) {
    handleNotionError(error)
  }
}

export const getNotionBlockChildren = async (blockId: string) => {
  try {
    return await withRetry(async () => {
      return await notionHQClient.blocks.children.list({ block_id: blockId })
    })
  } catch (error) {
    handleNotionError(error)
  }
} 