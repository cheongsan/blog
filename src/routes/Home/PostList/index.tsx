import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import styled from "@emotion/styled"
import PostCard from "./PostCard"
import { DEFAULT_CATEGORY } from "src/constants"
import usePostsQuery from "src/hooks/usePostsQuery"
import { CardLink } from "src/components/CardLink"
import { IconChevronRight } from "@tabler/icons-react"

type Props = {
  q?: string
}

const PostList: React.FC<Props> = ({ q }) => {
  const router = useRouter()
  const data = usePostsQuery()
  const [filteredPosts, setFilteredPosts] = useState(data)

  const currentTag = `${router.query.tag || ``}` || undefined
  const currentCategory = `${router.query.category || ``}` || DEFAULT_CATEGORY
  const currentOrder = `${router.query.order || ``}` || "desc"

  useEffect(() => {
    setFilteredPosts(() => {
      let newFilteredPosts = data
      // order
      if (currentOrder !== "desc") {
        newFilteredPosts = newFilteredPosts.reverse()
      }

      return newFilteredPosts
    })
  }, [q, currentTag, currentCategory, currentOrder, setFilteredPosts])

  return (
    <>
      <StyledWrapper className="my-2">
        <StyledTitle>
          Recent Posts
        </StyledTitle>
        {!filteredPosts.length && (
          <p className="text-gray-500 dark:text-gray-300">Nothing! 😺</p>
        )}
        {filteredPosts.slice(0, 10).map((post) => (
          <PostCard key={post.id} data={post} />
        ))}
        <hr />
        <CardLink href="archive" className="d-flex justify-content-center">
          <div className="archive-link d-flex align-items-center">
            블로그 게시글 더보기&nbsp;<IconChevronRight size="30" />
          </div>
        </CardLink>
      </StyledWrapper>
    </>
  )
}

export default PostList

const StyledTitle = styled.h3`
  padding: 0.25rem;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors.gray11};
`

const StyledWrapper = styled.div`
  margin-bottom: 2.25rem;
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.card};

  >.card-link {
    margin: 0.75rem auto;
    padding: 0.5rem;
    text-align: center;
    color: ${({ theme }) => theme.colors.gray10};
    border-radius: 0.95rem;
  }
`