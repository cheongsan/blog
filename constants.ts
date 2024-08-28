export const DEFAULT_CATEGORY: string = "📂 All";

export const queryKey = {
  scheme: (): string[] => ["scheme"],
  posts: (): string[] => ["posts"],
  tags: (): string[] => ["tags"],
  categories: (): string[] => ["categories"],
  status: (): string[] => ["status"],
  post: (slug: string): [string, string] => ["post", slug],
};