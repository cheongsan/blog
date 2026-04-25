import { TPosts } from "@/types"
import { getPosts } from "@/lib/notion-client"
import { filterPosts } from "@/lib/notion"

const FASTAPI_URL =
  process.env.FASTAPI_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8000")

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${FASTAPI_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`)
  return res.json()
}

async function fetchPostsFromAPI(
  status?: string,
  type?: string
): Promise<TPosts> {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (type) params.set("type", type)
  const qs = params.toString()
  return fetchAPI<TPosts>(`/py-api/posts${qs ? `?${qs}` : ""}`)
}

/** Fallback: fetch from notion-client directly if FastAPI is unavailable */
async function fallbackPosts(
  acceptStatus: string[],
  acceptType: string[]
): Promise<TPosts> {
  const posts = await getPosts()
  return filterPosts(posts, { acceptStatus: acceptStatus as any, acceptType: acceptType as any })
}

export async function fetchAllPosts(): Promise<TPosts> {
  try {
    return await fetchPostsFromAPI("Public,Pinned,Archived", "Post")
  } catch {
    return fallbackPosts(["Public", "Pinned", "Archived"], ["Post"])
  }
}

export async function fetchDetailPosts(): Promise<TPosts> {
  try {
    return await fetchPostsFromAPI("Public,PublicOnDetail,Pinned,Archived", "Paper,Post,Page")
  } catch {
    return fallbackPosts(
      ["Public", "PublicOnDetail", "Pinned", "Archived"],
      ["Paper", "Post", "Page"]
    )
  }
}
