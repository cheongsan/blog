import React, { useEffect, useState } from "react"
import styled from "@emotion/styled"
import PostCard from "./PostCard"
import { DEFAULT_CATEGORY } from "@/constants"
import usePostsQuery from "@/lib/usePostsQuery"
import { CardLink } from "@/components/CardLink"
import { TbChevronRight, TbRotateClockwise2 } from "react-icons/tb"

type Props = {
  q?: string
}

const RecentPosts: React.FC<Props> = ({ q }) => {
  const data = usePostsQuery()
  const [filteredPosts, setFilteredPosts] = useState(data)

  const currentTag = undefined
  const currentCategory = DEFAULT_CATEGORY
  const currentStatus = "Public"
  const currentOrder = "desc"

  useEffect(() => {
    setFilteredPosts(() => {
      let newFilteredPosts = data.filter(
          (post) =>
              post && post.status && post.status.includes(currentStatus)
      )

      return newFilteredPosts
    })
  }, [q, currentTag, currentCategory, currentStatus, currentOrder, setFilteredPosts])

  return (
    <>
      <StyledWrapper className="card my-2">
        <StyledTitle>
          < TbRotateClockwise2 size="24" /> {filteredPosts.length > 1 ? "Recent Posts" : "Recent Post"}
        </StyledTitle>
        {!filteredPosts.length && (
          <p className="text-gray-500 dark:text-gray-300">Nothing! 😺</p>
        )}
        {filteredPosts.slice(0, 10).map((post) => (
          <PostCard key={post.id} data={post} />
        ))}
        <hr />
        <CardLink href="/archive" className="flex justify-center">
          <div className="archive-link flex">
            View Archive&nbsp;<TbChevronRight size="30" />
          </div>
        </CardLink>
      </StyledWrapper>
    </>
  )
}

export default RecentPosts

const StyledTitle = styled.h3`
    display: flex;
    padding: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 1.17em;
    color: var(--gray-11);
    >svg{
        margin-right: 0.5rem;
    }
`

const StyledWrapper = styled.div`
  >.card-link {
    margin: 0.75rem auto;
    padding: 0.5rem;
    text-align: center;
    color: var(--gray-10);
    border-radius: 0.95rem;
  }
`