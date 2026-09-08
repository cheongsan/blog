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

// A notFound result is cached with no expiry unless it carries a revalidate,
// so a post that only failed to fetch would 404 until the next deploy. Keep
// that window short: the post exists, we just could not reach Notion.
const TRANSIENT_FAILURE_REVALIDATE = 60

export const getStaticPaths = async () => {
  try {
    const posts = await fetchDetailPosts()
    return {
      paths: posts.map((row) => `/${row.slug}`),
      fallback: "blocking",
    }
  } catch (e) {
    // Pre-generating nothing is survivable because fallback is "blocking",
    // but it must not pass silently — it means the whole build lost Notion.
    console.error("Failed to list post paths, pre-generating none:", e)
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
      // Genuinely absent from the database — 404 is the right answer, but
      // recheck later so publishing it in Notion is enough to make it appear.
      return { notFound: true, revalidate: CONFIG.revalidateTime }
    }

    const recordMap = await getRecordMap(postDetail.id.replace(/-/g, ''))
    if (!recordMap) {
      console.error(`Could not fetch recordMap for ${slug}, serving a temporary 404`)
      return { notFound: true, revalidate: TRANSIENT_FAILURE_REVALIDATE }
    }

    await queryClient.prefetchQuery(queryKey.post(`${slug}`), () => ({
      ...postDetail,
      recordMap,
    }))
  } catch (e) {
    console.error("Failed to fetch post data:", e)
    return { notFound: true, revalidate: TRANSIENT_FAILURE_REVALIDATE }
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

  // Thumbnails now resolve through a relative proxy path, and crawlers need an
  // absolute og:image.
  const image = post.thumbnail
    ? post.thumbnail.startsWith("/")
      ? `${CONFIG.link}${post.thumbnail}`
      : post.thumbnail
    : `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(post.title)}.png`

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
