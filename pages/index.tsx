import Home from "@/pages/home"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "types"
import MetaConfig from "lib/meta-config"
import { queryClient } from "lib/react-query"
import { queryKey } from "@/constants"
import { GetStaticProps } from "next"
import { dehydrate } from "@tanstack/react-query"
import { fetchAllPosts } from "@/lib/api-client"

export const getStaticProps: GetStaticProps = async () => {
  try {
    const posts = await fetchAllPosts()
    await queryClient.prefetchQuery(queryKey.posts(), () => posts)
  } catch (e) {
    console.error("Failed to fetch posts from FastAPI:", e)
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const HomePage: NextPageWithLayout = () => {
  const meta = {
    title: CONFIG.blog.title,
    description: CONFIG.blog.description,
    type: "website",
    url: CONFIG.link,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Home />
    </>
  )
}

export default HomePage
