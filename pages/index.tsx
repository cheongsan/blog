import Home from "routes/Home"
import { CONFIG } from "../site.config"
import { NextPageWithLayout } from "../types"
import { getPosts } from "../libs/apis"
import MetaConfig from "components/MetaConfig"
import { queryClient } from "libs/react-query"
import { queryKey } from "constants/queryKey"
import { GetStaticProps } from "next"
import { dehydrate } from "@tanstack/react-query"
import { filterPosts } from "libs/utils/notion"

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
