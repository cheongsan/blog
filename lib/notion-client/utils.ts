import { Client } from "@notionhq/client"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1초

export const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

export const handleNotionError = (error: any) => {
  if (error.code === 'ERR_NON_2XX_3XX_RESPONSE') {
    console.error('Notion API 응답 오류:', error.message)
    throw new Error('Notion API와의 통신에 실패했습니다. 잠시 후 다시 시도해주세요.')
  }
  throw error
}