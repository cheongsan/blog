import { CONFIG } from "site.config"
import { NextPageWithLayout } from "types"
import { getPosts } from "lib/notion-client"
import MetaConfig from "lib/meta-config"
import { queryClient } from "lib/react-query"
import { queryKey } from "@/constants"
import { GetStaticProps } from "next"
import { dehydrate } from "@tanstack/react-query"
import { filterPosts } from "lib/notion"
import SearchInput from "@/components/feed/SearchInput"
import TagList from "@/components/feed/TagList"
import {
  TbSearch,
  TbTags,
  TbBooks,
  TbConfetti
} from "react-icons/tb"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import React, {useState} from "react";
import {FeedHeader} from "@/components/feed/header";
import PostList from "@/components/feed/list";

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

const FeedPage: NextPageWithLayout = () => {
  const meta = {
    title: CONFIG.blog.title,
    description: CONFIG.blog.description,
    type: "website",
    url: CONFIG.link,
  }
  const [q, setQ] = useState("")

  return (
      <>
        <MetaConfig {...meta} />
        <div className="d-flex mb-3">
          < TbSearch size="23" className="me-1" /> Search
        </div>
        <Tabs defaultValue="tag">
          <div className="d-flex align-self-stretch">
            <div className="flex-grow-1">
              <SearchInput value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
              <TabsList className="flex space-x-2">
                <TabsTrigger
                    value="tag"
                    className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
                >
                  < TbTags size="23"/> Tags
                </TabsTrigger>
                <TabsTrigger
                    value="book"
                    className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
                >
                  < TbBooks size="23"/> Books
                </TabsTrigger>
                <TabsTrigger
                    value="event"
                    className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
                >
                  < TbConfetti size="23"/> Events
                </TabsTrigger>
              </TabsList>
          </div>
          <div className="">
              <TabsContent value="tag">
                <TagList/>
              </TabsContent>
              <TabsContent value="book"></TabsContent>
              <TabsContent value="event"></TabsContent>
          </div>
        </Tabs>
        <div className="container max-w-screen-md">
          <FeedHeader />

          <PostList q={q} />
        </div>
</>
)
}

export default FeedPage
