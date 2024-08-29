import { Noto_Color_Emoji } from "next/font/google"

export const notocoloremoji = Noto_Color_Emoji({
  weight: ["400"],
  subsets: ["emoji"],
  fallback: ["Apple Color Emoji"],
})

export const DEFAULT_CATEGORY: string = "📂 All";

export const queryKey = {
  scheme: (): string[] => ["scheme"],
  posts: (): string[] => ["posts"],
  tags: (): string[] => ["tags"],
  categories: (): string[] => ["categories"],
  status: (): string[] => ["status"],
  post: (slug: string): [string, string] => ["post", slug],
};
