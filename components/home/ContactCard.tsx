import styled from "@emotion/styled"
import React from "react"
import {
  AiFillLinkedin,
  AiOutlineGithub,
  AiOutlineInstagram,
  AiOutlineMail,
} from "react-icons/ai"
import { CONFIG } from "@/site.config"
import { CardLink } from "@/components/CardLink"

const ContactCard: React.FC = () => {
  return (
    <>
      <StyledWrapper>
        {CONFIG.profile.github && (
          <CardLink
            href={`https://github.com/${CONFIG.profile.github}`}
            rel="noreferrer"
            target="_blank"
          >
            <AiOutlineGithub className="icon" />
            <div className="contact-name">{CONFIG.profile.github}</div>
          </CardLink>
        )}
        {CONFIG.profile.instagram && (
          <CardLink
            href={`https://www.instagram.com/${CONFIG.profile.instagram}`}
            rel="noreferrer"
            target="_blank"
          >
            <AiOutlineInstagram className="icon" />
            <div className="contact-name">@{CONFIG.profile.instagram}</div>
          </CardLink>
        )}
        {CONFIG.profile.email && (
          <CardLink
            href={`mailto:${CONFIG.profile.email}`}
            rel="noreferrer"
            target="_blank"
            css={{ overflow: "hidden" }}
          >
            <AiOutlineMail className="icon" />
            <div className="contact-name">{CONFIG.profile.email}</div>
          </CardLink>
        )}
        {CONFIG.profile.linkedin && (
          <CardLink
            href={`https://www.linkedin.com/in/${CONFIG.profile.linkedin}`}
            rel="noreferrer"
            target="_blank"
          >
            <AiFillLinkedin className="icon" />
            <div className="contact-name">{CONFIG.profile.linkedin}</div>
          </CardLink>
        )}
      </StyledWrapper>
    </>
  )
}

export default ContactCard

const StyledTitle = styled.div`
  padding: 0.25rem;
  margin-bottom: 0.75rem;
`
const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  background-color: var(--card);
  a {
    display: flex;
    padding: 0.5rem 0.65rem;
    gap: 0.75rem;
    align-items: center;
    border-radius: 0.95rem;
    color: var(--gray-11);
    cursor: pointer;

    :hover {
      color: var(--gray-12);
    }
    .icon {
      font-size: 1.5rem;
      line-height: 2rem;
    }
    .contact-name {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }
`
