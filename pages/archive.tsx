import { GetStaticProps } from "next"
import React, { useState } from "react"
import styled from "@emotion/styled"

import { CONFIG } from "site.config"
import { queryKey } from "@/constants"
import { NextPageWithLayout } from "types"

import MetaConfig from "lib/meta-config"
import { filterPosts } from "lib/notion"
import { getPosts } from "lib/notion-client"

import { queryClient } from "lib/react-query"
import { dehydrate } from "@tanstack/react-query"

import SearchInput from "@/components/feed/SearchInput"
import TagList from "@/components/feed/TagList"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedHeader } from "@/components/feed/header"
import PostList from "@/components/feed/list"

import { TbSearch, TbTags, TbBooks, TbConfetti } from "react-icons/tb"

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
      <div className="flex mb-3">
        <TbSearch size="23" className="me-1" /> Search
      </div>
      <Tabs defaultValue="tag" className="mb-6">
        <div className="flex flex-wrap md:flex-nowrap align-self-stretch">
          <div className="grow">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <StyledTabsList className="flex space-x-2 md:ms-2 p-0 bg-body">
            <TabsTrigger
              value="tag"
              className="sm:px-4 sm:py-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
            >
              <TbTags size="23" /> Tags
            </TabsTrigger>
            <TabsTrigger
              value="book"
              className="sm:px-4 sm:py-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
            >
              <TbBooks size="23" /> Books
            </TabsTrigger>
            <TabsTrigger
              value="event"
              className="sm:px-4 sm:py-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
            >
              <TbConfetti size="23" /> Events
            </TabsTrigger>
          </StyledTabsList>
        </div>
        <TabsContent value="tag"><TagList /></TabsContent>
        <TabsContent value="book"></TabsContent>
        <TabsContent value="event"></TabsContent>
      </Tabs>
      <div className="container-fluid md:container md:max-w-screen-md">
        <FeedHeader />
        <PostList q={q} />
      </div>
    </>
  )
}

export default FeedPage

const StyledTabsList = styled(TabsList)`
  .dark & {
    button {
      background: var(--card);
      color: var(--gray-10);

      &[data-state="active"] {
        background: black;
        color: white;
      }
    }
  }
`
