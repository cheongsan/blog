import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "lib/utils/notion"

export const useCategoriesQuery = () => {
  const posts = usePostsQuery()
  const DEFAULT_CATEGORY = "📂 All" as string
  const categories = getAllSelectItemsFromPosts("category", posts)

  return {
    [DEFAULT_CATEGORY]: posts.length,
    ...categories,
  }
}
