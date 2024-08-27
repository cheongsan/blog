import Link from "next/link"
import { CONFIG } from "site.config"
import { formatDate } from "lib/utils"
import Tag from "../../components/Tag"
import { TPost } from "../../types"
import Image from "next/image"
import Category from "../../components/Category"
import styled from "@emotion/styled"
import { TbChevronRight } from "react-icons/tb"

type Props = {
  data: TPost
}

const PostCard: React.FC<Props> = ({ data }) => {
  const category = (data.category && data.category?.[0]) || undefined

  return (
    <StyledWrapper href={`/${data.slug}`}>
      <article className="d-flex">
        {data.thumbnail && (
          <div className="thumbnail">
            <Image
              src={data.thumbnail}
              fill
              alt={data.title}
              css={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div data-thumb={!!data.thumbnail} data-category={!!category} className="content">
          {category && (
            <div className="category">
              <Category>{category}</Category>
            </div>
          )}
          <header className="top">
            <h2>{data.title}</h2>
          </header>
          <div className="date">
            <div className="content">
              {formatDate(
                data?.date?.start_date || data.createdTime,
                CONFIG.lang
              )}
            </div>
          </div>
          <div className="summary">
            <p>{data.summary}</p>
          </div>
          <div className="tags">
            {data.tags &&
              data.tags.map((tag: string, idx: number) => (
                <Tag key={idx}>{tag}</Tag>
              ))}
          </div>
        </div>
        <div className="read-more ms-auto">
            <TbChevronRight size="30" />
          </div>
      </article>
    </StyledWrapper>
  )
}

export default PostCard

const StyledWrapper = styled(Link)`
  article {
    overflow: hidden;
    position: relative;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    border-radius: 1rem;
    background-color: ${({ theme }) => theme.colors.card};
    transition-property: scale;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;

    @media (min-width: 768px) {
      margin-bottom: 2rem;
    }

    :hover {
      scale: 0.97;
      background-color: ${({ theme }) => theme.colors.card_click};
    }
    > .category {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 10;
    }

    > .thumbnail {
      position: relative;
      flex-basis: 100%;
      background-color: ${({ theme }) => theme.colors.gray2};
      padding-bottom: 50%;

      @media (min-width: 1024px) {
        flex-basis: 35%;
        padding-bottom: 20%;
      }
    }

    > .content {
      padding: 1rem;
      flex-basis: 90%;

      &[data-thumb="true"] {
        @media (min-width: 1024px) {
          flex-basis: 60%;
        }
      }
      
      &[data-category="false"] {
        padding-top: 1.5rem;
      }
      > .top {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        @media (min-width: 768px) {
          flex-direction: row;
          align-items: baseline;
        }
        h2 {
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
          line-height: 1.75rem;
          font-weight: 500;

          cursor: pointer;

          @media (min-width: 768px) {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }
        }
      }
      > .date {
        display: flex;
        margin-bottom: 1rem;
        gap: 0.5rem;
        align-items: center;
        .content {
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: ${({ theme }) => theme.colors.gray10};
          @media (min-width: 768px) {
            margin-left: 0;
          }
        }
      }
      > .summary {
        margin-bottom: 1rem;
        p {
          display: none;
          line-height: 2rem;
          color: ${({ theme }) => theme.colors.gray11};

          @media (min-width: 768px) {
            display: block;
          }
        }
      }
      > .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }

    > .read-more {
      align-self: center;
      color: ${({ theme }) => theme.colors.card_read_more};
    }
  }
`