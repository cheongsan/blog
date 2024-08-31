import styled from "@emotion/styled"
import React from "react"
import { CONFIG } from "site.config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Gravatar from "@/components/Gravatar"
import { CardHotLink } from "@/components/CardHotLink"
import { TbBrandGravatar } from "react-icons/tb"
import ContactCard from "./ContactCard"
import ContributionsCard from "./ContributionsCard"

type Props = {}

const ProfileCard: React.FC<Props> = () => {
  return (
    <StyledWrapper className="card">
      <div className="grid grid-cols-12 row-auto gap-4">
        <div className="col-span-12 sm:col-span-5 md:col-span-4 lg:col-span-3 top">
          <Gravatar size={150} />
        </div>
        <div className="col-span-12 sm:col-span-7 md:col-span-8 lg:col-span-9 mid">
          <div className="name">
            {CONFIG.profile.name}
              <CardHotLink
                href={`https://www.gravatar.com/${CONFIG.profile.gravatar}`}
                target="_blank"
              >
                <TbBrandGravatar color="gray" size={15} className="me-1" />
                <span className="hidden lg:block">View on&nbsp;</span>Gravatar
              </CardHotLink>
          </div>
          <div className="role">{CONFIG.profile.role}</div>
          <Tabs defaultValue="contact">
            <StyledTabsList>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="contribution">Contribution</TabsTrigger>
            </StyledTabsList>
            <TabsContent value="contact">
              <ContactCard />
            </TabsContent>
            <TabsContent value="contribution">
              <ContributionsCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StyledWrapper>
  )
}

export default ProfileCard

const StyledWrapper = styled.div`
    .top {
        position: relative;

        .react-gravatar {
            display: block;
            margin: 0 auto;
            border-radius: 50%;
        }
    }

    .mid {
        .name {
            position: relative;
            font-size: 1.25rem;
            line-height: 1.75rem;
            font-style: normal;
            font-weight: 700;

            .card-hot-link {
              position: absolute;
              top: 0;
              right: 0;
            }
        }

        .role {
            margin-bottom: 1rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            color: var(--gray-11);
        }
    }
`

const StyledTabsList = styled(TabsList)`
  .dark & {
    background: var(--card-link);
    button {
      background: var(--card-link);
      color: var(--gray-10);

      &[data-state="active"] {
        background: black;
        color: white;
      }
    }
  }
`
