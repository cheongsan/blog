import Detail from "components/detail"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "types"
import CustomError from "@/pages/error"
import { getRecordMap } from "lib/notion-client"
import MetaConfig from "lib/meta-config"
import { GetStaticProps } from "next"
import { queryClient } from "lib/react-query"
import { queryKey } from "@/constants"
import { dehydrate } from "@tanstack/react-query"
import usePostQuery from "@/lib/usePostQuery"
import { fetchAllPosts, fetchDetailPosts } from "@/lib/api-client"

export const getStaticPaths = async () => {
  try {
    const posts = await fetchDetailPosts()
    return {
      paths: posts.map((row) => `/${row.slug}`),
      fallback: "blocking",
    }
  } catch {
    return { paths: [], fallback: "blocking" }
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug

  try {
    const [feedPosts, detailPosts] = await Promise.all([
      fetchAllPosts(),
      fetchDetailPosts(),
    ])

    await queryClient.prefetchQuery(queryKey.posts(), () => feedPosts)

    const postDetail = detailPosts.find((t: any) => t.slug === slug)
    if (!postDetail) {
      return { notFound: true }
    }

    const recordMap = await getRecordMap(postDetail.id.replace(/-/g, ''))
    if (!recordMap) {
      return { notFound: true }
    }

    await queryClient.prefetchQuery(queryKey.post(`${slug}`), () => ({
      ...postDetail,
      recordMap,
    }))
  } catch (e) {
    console.error("Failed to fetch post data:", e)
    return { notFound: true }
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const DetailPage: NextPageWithLayout = () => {
  const post = usePostQuery()

  if (!post) return <CustomError />

  const image =
    post.thumbnail ??
    CONFIG.ogImageGenerateURL ??
    `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(post.title)}.png`

  const date = post.date?.start_date || post.createdTime || ""

  const meta = {
    title: post.title,
    date: new Date(date).toISOString(),
    image: image,
    description: post.summary || "",
    type: post.type[0],
    url: `${CONFIG.link}/${post.slug}`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Detail />
    </>
  )
}

DetailPage.getLayout = (page) => {
  return <>{page}</>
}

export default DetailPage
