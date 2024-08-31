import { useState } from "react"

import styled from "@emotion/styled"
import ProfileCard from "@/components/home/ProfileCard"
import ServiceCard from "@/components/home/ServiceCard"
import RecentPosts from "@/components/home/RecentPosts"
import PinnedPosts from "@/components/home/PinnedPosts"

const HEADER_HEIGHT = 73

type Props = {}

const Feed: React.FC<Props> = () => {
  const [q, setQ] = useState("")

  return (
    <StyledWrapper className="container-fulid">
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 md:col-span-8 justify-self-stretch">
          <ProfileCard />
        </div>
        <div className="col-span-12 md:col-span-4 justify-self-stretch">
          <ServiceCard />
        </div>
      </div>
      <div className="mb-6">
        <PinnedPosts />
      </div>
      <div className="">
        <RecentPosts />
      </div>
    </StyledWrapper>
  )
}

export default Feed

const StyledWrapper = styled.div`
  @media (max-width: 768px) {
    display: block;
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
