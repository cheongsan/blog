import { TPosts } from "@/types"

const FASTAPI_URL =
  process.env.FASTAPI_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8000")

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${FASTAPI_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`)
  return res.json()
}

async function fetchPosts(status: string, type: string): Promise<TPosts> {
  const params = new URLSearchParams({ status, type })
  return fetchAPI<TPosts>(`/py-api/posts?${params}`)
}

export async function fetchAllPosts(): Promise<TPosts> {
  return fetchPosts("Public,Pinned,Archived", "Post")
}

export async function fetchDetailPosts(): Promise<TPosts> {
  return fetchPosts("Public,PublicOnDetail,Pinned,Archived", "Paper,Post,Page")
}
