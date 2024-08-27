import { useState } from "react"

import styled from "@emotion/styled"
import ProfileCard from "./ProfileCard"
import ServiceCard from "./ServiceCard"
import RecentPosts from "./RecentPosts"
import PinnedPosts from "./PinnedPosts"

const HEADER_HEIGHT = 73

type Props = {}

const Feed: React.FC<Props> = () => {
  const [q, setQ] = useState("")

  return (
    <StyledWrapper className="container-fulid">
      <div className="row row-deck">
        <div className="col-12 col-md-8">
          <ProfileCard />
        </div>
        <div className="col-12 col-md-4">
          <ServiceCard />
        </div>
        <div className="col-12">
          <PinnedPosts />
        </div>
        <div className="col-12">
          <RecentPosts />
        </div>
      </div>
    </StyledWrapper>
  )
}

export default Feed

const StyledWrapper = styled.div`
  @media (max-width: 768px) {
    display: block;
  }

  > .row-deck>.col, .row-deck>[class*=col-] {
    display: flex;
    align-items: stretch;
  }

  > .row-deck>.col .card, .row-deck>[class*=col-] .card{
    flex: 1 1 auto;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  > .lt {
    display: none;
    overflow: scroll;
    position: sticky;
    grid-column: span 2 / span 2;
    top: ${HEADER_HEIGHT - 10}px;

    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 1024px) {
      display: block;
    }
  }

  > .mid {
    grid-column: span 12 / span 12;

    @media (min-width: 1024px) {
      grid-column: span 7 / span 7;
    }

    > .tags {
      display: block;

      @media (min-width: 1024px) {
        display: none;
      }
    }

    > .footer {
      padding-bottom: 2rem;
      @media (min-width: 1024px) {
        display: none;
      }
    }
  }

  > .rt {
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }

    display: none;
    overflow: scroll;
    position: sticky;
    top: ${HEADER_HEIGHT - 10}px;

    @media (min-width: 1024px) {
      display: block;
      grid-column: span 3 / span 3;
    }

    .footer {
      padding-top: 1rem;
    }
  }
`
