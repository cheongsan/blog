import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import styled from "@emotion/styled"
import PostCard from "./PostCard"
import { DEFAULT_CATEGORY } from "src/constants"
import usePostsQuery from "src/hooks/usePostsQuery"
import { TbPin } from "react-icons/tb"

type Props = {
  q?: string
}

const PinnedPosts: React.FC<Props> = ({ q }) => {
  const router = useRouter()
  const data = usePostsQuery()
  const [filteredPosts, setFilteredPosts] = useState(data)

  const currentTag = undefined
  const currentCategory = DEFAULT_CATEGORY
  const currentStatus = "Pinned"
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

  if (filteredPosts.length === 0) {
    return null
  }

  return (
    <>
      <StyledWrapper className="my-2">
        <StyledTitle>
          < TbPin size="24" /> {filteredPosts.length > 1 ? "Pinned Posts" : "Pinned Post"}
        </StyledTitle>
        {!filteredPosts.length && (
          <p className="text-gray-500 dark:text-gray-300">Nothing! 😺</p>
        )}
        {filteredPosts.slice(0, 10).map((post) => (
          <PostCard key={post.id} data={post} />
        ))}
      </StyledWrapper>
    </>
  )
}

export default PinnedPosts

const StyledTitle = styled.h3`
    display: flex;
    padding: 0.25rem;
    margin-bottom: 0.75rem;
    color: ${({ theme }) => theme.colors.gray11};
    >svg{
        margin-right: 0.5rem;
    }
`

const StyledWrapper = styled.div`
    padding: 1rem;
    padding-bottom: 0;
    border-radius: 1rem;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.card};
`