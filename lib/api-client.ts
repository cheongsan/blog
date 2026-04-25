import { TPosts } from "@/types"

const BASE_URL =
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
  process.env.FASTAPI_URL || "http://localhost:3000"

async function fetchPosts(status: string, type: string): Promise<TPosts> {
  const params = new URLSearchParams({ status, type })
  const res = await fetch(`${BASE_URL}/api/py/posts?${params}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchAllPosts(): Promise<TPosts> {
  return fetchPosts("Public,Pinned,Archived", "Post")
}

export async function fetchDetailPosts(): Promise<TPosts> {
  return fetchPosts("Public,PublicOnDetail,Pinned,Archived", "Paper,Post,Page")
}
