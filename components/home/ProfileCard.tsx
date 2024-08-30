import styled from "@emotion/styled"
import React from "react"
import { CONFIG } from "@/site.config"
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
      <div className="row">
        <div className="col-12 col-md-5 col-lg-4 col-xl-3 top">
          <Gravatar size={150} />
        </div>
        <div className="col-12 col-md-7 col-lg-8 col-xl-9 mid">
          <div className="name row">
            <div className="col-12 col-lg-7">{CONFIG.profile.name}</div>
            <div className="col-12 col-lg-5">
              <CardHotLink
                href={`https://www.gravatar.com/${CONFIG.profile.gravatar}`}
                target="_blank"
              >
                <TbBrandGravatar color="gray" size={15} />
                &nbsp;View on Gravatar
              </CardHotLink>
            </div>
          </div>
          <div className="role">{CONFIG.profile.role}</div>
          <Tabs defaultValue="contact">
            <TabsList>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="contribution">Contribution</TabsTrigger>
            </TabsList>
            <TabsContent value="contact">
              <ContactCard />
            </TabsContent>
            <TabsContent value="contribution" style={{ maxWidth: "500px" }}>
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
    border-radius: 1rem;
    margin-bottom: 2.25rem;
    padding: 1rem;
    width: 100%;

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
            padding-left: 0.75rem;
            font-size: 1.25rem;
            line-height: 1.75rem;
            font-style: normal;
            font-weight: 700;

            .card-hot-link {
                @media (min-width: 1024px) {
                    position: absolute;
                    right: 0.5rem;
                }
            }
        }

        .role {
            padding-left: 0.75rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            color: var(--gray-11);
        }
    }
`
