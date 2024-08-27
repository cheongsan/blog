export const queryKey = {
  scheme: () => ["scheme"],
  posts: () => ["posts"],
  tags: () => ["tags"],
  categories: () => ["categories"],
  status: () => ["status"],
  post: (slug: string) => ["post", slug],
}
