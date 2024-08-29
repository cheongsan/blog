import Home from "@/pages/home"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "types"
import { getPosts } from "lib/notion-client"
import MetaConfig from "lib/meta-config"
import { queryClient } from "lib/react-query"
import { queryKey } from "@/constants"
import { GetStaticProps } from "next"
import { dehydrate } from "@tanstack/react-query"
import { filterPosts } from "lib/notion"

export const getStaticProps: GetStaticProps = async () => {
  const posts = filterPosts(await getPosts())
  await queryClient.prefetchQuery(queryKey.posts(), () => posts)

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
