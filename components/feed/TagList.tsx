import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React from "react"
import { useTagsQuery } from "@/lib/useTagsQuery"

type Props = {}

const TagList: React.FC<Props> = () => {
  const router = useRouter()
  const currentTag = router.query.tag || undefined
  const data = useTagsQuery()

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
              <a
                  key={key}
                  data-active={key === currentTag}
                  onClick={() => handleClickTag(key)}
              >
                {key}
              </a>
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

    a {
      display: block;
      padding: 0.25rem;
      padding-left: 1rem;
      padding-right: 1rem;
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--gray-10);
      flex-shrink: 0;
      cursor: pointer;

      :hover {
        background-color: var(--card);
      }
      &[data-active="true"] {
        color: var(--gray-12);
        background-color: var(--card);

        :hover {
          background-color: var(--card);
        }
      }
    }
  }
`
