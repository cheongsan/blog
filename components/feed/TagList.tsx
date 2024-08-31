import React, { useState } from "react"
import styled from "@emotion/styled"
import { useRouter } from "next/router"
import { useTagsQuery } from "lib/useTagsQuery"
import { FaHashtag, FaPlus, FaCirclePlus, FaCircleMinus } from "react-icons/fa6"
import { Badge } from "@/components/ui/badge"

type Props = {}

const TagList: React.FC<Props> = () => {
  const router = useRouter()
  const currentTag = router.query.tag || undefined
  const data = useTagsQuery()
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)

  const handleClickTag = (value: any) => {
    // delete
    if (currentTag === value) {
      router.push({
        query: {
          ...router.query,
          tag: undefined,
        },
      })
    }
    // add
    else {
      router.push({
        query: {
          ...router.query,
          tag: value,
        },
      })
    }
  }

  return (
    <StyledWrapper>
      <div className="tags">
        <div className="list lg:flex-wrap">
          {Object.keys(data).map((key) => (
            <StyledBadge
              key={key}
              variant="outline"
              data-active={key === currentTag}
              onClick={() => handleClickTag(key)}
              onMouseEnter={() => setHoveredTag(key)}
              onMouseLeave={() => setHoveredTag(null)}
              className="flex rounded-full hover:bg-stone-300 text-stone-500 border-stone-300 dark:border-stone-800
                  data-[active=true]:bg-stone-500 dark:data-[active=true]:bg-stone-700 data-[active=true]:hover:bg-stone-400 data-[active=true]:text-white"
            >
              {key === currentTag ? (
                hoveredTag === key ? (
                  <FaCircleMinus className="me-1" /> // 현재 선택된 태그이고, hover 상태일 때 아이콘
                ) : (
                  <FaCirclePlus className="me-1" /> // 현재 선택된 태그이고, 기본 아이콘
                )
              ) : hoveredTag === key ? (
                <FaPlus className="me-1" /> // hover 상태일 때, 선택되지 않은 태그의 아이콘
              ) : (
                <FaHashtag className="me-1" /> // 선택되지 않았고, hover되지 않은 기본 아이콘
              )}
              {key}
            </StyledBadge>
          ))}
        </div>
      </div>
    </StyledWrapper>
  )
}

export default TagList

const StyledWrapper = styled.div`
  .list {
    display: flex;
    margin-bottom: 1.5rem;
    gap: 0.25rem;
    overflow: scroll;

    scrollbar-width: none;
    -ms-overflow-style: none;

    ::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    @media (min-width: 1024px) {
      display: inline-flex;
    }
  }
`

const StyledBadge = styled(Badge)`
  flex-shrink: 0;
  padding: 0.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  cursor: pointer;

  :hover {
    background-color: var(--card);
  }
`
