import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "libs/utils/notion"

export const useTagsQuery = () => {
  const posts = usePostsQuery()
  const tags = getAllSelectItemsFromPosts("tags", posts)

  return tags
}
