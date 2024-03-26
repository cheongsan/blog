import styled from "@emotion/styled"
import Image from "next/image"
import React from "react"
import Gravatar from 'react-gravatar';
import { CONFIG } from "site.config"
import { Emoji } from "src/components/Emoji"
import { IconBrandGravatar } from '@tabler/icons-react';
import Link from "next/link";

type Props = {}

const ProfileCard: React.FC<Props> = () => {
  return (
    <StyledWrapper>
      <div className="title">
        <Emoji>💻</Emoji> Profile
      </div>
      <div className="content"> 
        <div className="top">
          <Gravatar email={CONFIG.profile.email} size={200} rating="pg" default="identicon" />
        </div>
        <div className="mid">
          <Link href="https://www.gravatar.com/cheongsando" target="_blank" className="name">
            <IconBrandGravatar color="gray" size={15} />
            &nbsp;
            {CONFIG.profile.name}
          </Link>
          <div className="role">{CONFIG.profile.role}</div>
          <div className="text-sm mb-2">{CONFIG.profile.bio}</div>
        </div>
      </div>
    </StyledWrapper>
  )
}

export default ProfileCard

const StyledWrapper = styled.div`
  > .title {
    padding: 0.25rem;
    margin-bottom: 0.75rem;
  }
  > .content {
    margin-bottom: 2.25rem;
    border-radius: 1rem;
    width: 100%;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "white" : theme.colors.card};
    @media (min-width: 768px) {
      padding: 1rem;
    }
    @media (min-width: 1024px) {
      padding: 1rem;
    }
    .top {
      position: relative;
      width: 100%;
      .react-gravatar {
        display: block;
        border-radius: 50%;
      }
    }
    .mid {
      display: flex;
      padding: 0.5rem;
      flex-direction: column;
      align-items: center;
      .name {
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-style: normal;
        font-weight: 700;
      }
      .role {
        margin-bottom: 1rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: ${({ theme }) => theme.colors.gray11};
      }
      .bio {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
    }
  }
`
