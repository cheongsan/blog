import { DEFAULT_CATEGORY } from "constants"
import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "libs/utils/notion"

export const useCategoriesQuery = () => {
  const posts = usePostsQuery()
  const categories = getAllSelectItemsFromPosts("category", posts)

  return {
    [DEFAULT_CATEGORY]: posts.length,
    ...categories,
  }
}
