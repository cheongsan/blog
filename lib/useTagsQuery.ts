import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "@/lib/notion"

export const useTagsQuery = () => {
  const posts = usePostsQuery()
  const tags = getAllSelectItemsFromPosts("tags", posts)

  return tags
}
