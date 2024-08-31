import React, { useEffect, useState } from "react"
import styled from "@emotion/styled"
import { CONFIG } from "site.config"

import { FaLayerGroup, FaGithubAlt, FaGitlab } from "react-icons/fa6"
import { TbExternalLink } from "react-icons/tb"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface Contribution {
  date: string | null
  count: number
  color: string
}

interface Contributions {
  github: Contribution[][]
  gitlab: Contribution[][]
}

const CACHE_KEY = "contributionsCache"

export default function Home() {
  const [contributions, setContributions] = useState<Contributions>({
    github: [],
    gitlab: [],
  })

  const [filteredContributions, setFilteredContributions] = useState<Contribution[][]>([])
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY)
    if (cachedData) {
      const parsedData: Contributions = JSON.parse(cachedData)
      setContributions(parsedData)
      setFilteredContributions(combineContributions(parsedData))
      setLoading(false)
    } else {
      fetchContributions()
    }
  }, [])

  useEffect(() => {
    if (filter === "all") {
      setFilteredContributions(combineContributions(contributions))
    } else {
      setFilteredContributions(
          contributions[filter as keyof Contributions] || []
      )
    }
  }, [filter, contributions])

  const fetchContributions = async () => {
    try {
      const githubRes = await fetch(
          `/api/github?username=${CONFIG.profile.github}`
      )
      const gitlabRes = await fetch(
          `/api/gitlab?username=${CONFIG.profile.gitlab}`
      )

      const githubData = await githubRes.json()
      const gitlabData = await gitlabRes.json()

      const allContributions: Contributions = {
        github: Array.isArray(githubData) ? parseGitHubData(githubData) : [],
        gitlab: Array.isArray(gitlabData) ? parseGitLabData(gitlabData) : [],
      }

      setContributions(allContributions)
      setFilteredContributions(combineContributions(allContributions))
      localStorage.setItem(CACHE_KEY, JSON.stringify(allContributions))
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch contributions:", error)
      setLoading(false)
    }
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
  }

  return (
      <TooltipProvider>
        <div>
          <Tabs
              defaultValue="all"
              value={filter}
              onValueChange={handleFilterChange}
          >
            <StyledTabsList className="space-x-2 bg-body">
              <TabsTrigger
                  value="all"
                  className="px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-black focus:outline-none data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-none"
              >
                <FaLayerGroup className="me-1" /> All
              </TabsTrigger>
              <TabsTrigger
                  value="github"
                  className="px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-black focus:outline-none data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <FaGithubAlt className="me-1" /> GitHub
                <a
                    href={`https://github.com/${CONFIG.profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                >
                  <TbExternalLink />
                </a>
              </TabsTrigger>
              <TabsTrigger
                  value="gitlab"
                  className="px-4 py-2 rounded-full hover:bg-orange-300 dark:hover:bg-orange-900 focus:outline-none data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <FaGitlab className="me-1" /> GitLab
                <a
                    href={`https://gitlab.com/${CONFIG.profile.gitlab}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                >
                  <TbExternalLink />
                </a>
              </TabsTrigger>
            </StyledTabsList>
            <TabsContent value={filter}>
              {loading ? (
                  <ScrollArea className="w-96 h-32">
                    <div className="h-32 w-full rounded-md bg-gray-200 animate-pulse"></div>
                  </ScrollArea>
              ) : (
                  <ScrollArea className="p-2 whitespace-nowrap rounded-md border">
                    <div style={{ overflowX: "auto", width: "100%" }}>
                      <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(53, 11px)`,
                            gridTemplateRows: `repeat(7, 11px)`,
                            gap: "4px",
                            minWidth: "750px",
                          }}
                      >
                        {filteredContributions.map((week, weekIndex) =>
                            week.map((day, dayIndex) => {
                              const githubCount = contributions.github[weekIndex][dayIndex].count;
                              const gitlabCount = contributions.gitlab[weekIndex][dayIndex].count;
                              return (
                                  <Tooltip key={`${weekIndex}-${dayIndex}`}>
                                    <TooltipTrigger asChild>
                                      <div
                                          style={{
                                            gridColumnStart: weekIndex + 1,
                                            gridRowStart: dayIndex + 1,
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: day.color || "#ebedf0",
                                            borderRadius: "3px",
                                          }}
                                      ></div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{day.date}</p>
                                      {githubCount > 0 && <p>GitHub: {githubCount} contribution{githubCount > 1 ? 's' : ''}</p>}
                                      {gitlabCount > 0 && <p>GitLab: {gitlabCount} contribution{gitlabCount > 1 ? 's' : ''}</p>}
                                      {githubCount === 0 && gitlabCount === 0 && <p>0 contribution</p>}
                                    </TooltipContent>
                                  </Tooltip>
                              )
                            })
                        )}
                      </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
  )
}

// 각 플랫폼에서 가져온 데이터를 일관된 형식으로 변환하는 함수들
function parseGitHubData(data: any): Contribution[][] {
  return data.map((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        color: day.color,
      }))
  )
}

function parseGitLabData(data: any): Contribution[][] {
  const contributions = Array.from({ length: 53 }, (_, weekIndex) =>
      Array.from({ length: 7 }, (_, dayIndex) => {
        const date = getDateByWeekAndDay(weekIndex, dayIndex)
        return {
          date: date.toISOString().split("T")[0],
          count: 0,
          color: "#ebedf0",
        }
      })
  )

  data.forEach((event: any) => {
    const date = new Date(event.created_at.split("T")[0])
    const dayOfWeek = date.getDay()
    const weekNumber = getWeekNumber(date)

    contributions[weekNumber][dayOfWeek] = {
      ...contributions[weekNumber][dayOfWeek],
      count: contributions[weekNumber][dayOfWeek].count + 1,
      color: "#216e39",
    }
  })

  return contributions
}

// 각 플랫폼의 기여도를 병합하는 함수
function combineContributions(
    contributions: Contributions
): Contribution[][] {
  const combined = Array.from({ length: 53 }, (_, weekIndex) =>
          Array.from({ length: 7 }, (_, dayIndex) => {
            const date = getDateByWeekAndDay(weekIndex, dayIndex)
            return {
              date: date.toISOString().split("T")[0],
              count: 0,
              color: "#ebedf0",
            }
          })
      )

  ;["github", "gitlab"].forEach((platform) => {
    contributions[platform as keyof Contributions].forEach(
        (week, weekIndex) => {
          week.forEach((day, dayIndex) => {
            combined[weekIndex][dayIndex].count += day.count
            if (day.color !== "#ebedf0") {
              combined[weekIndex][dayIndex].color = day.color
            }
          })
        }
    )
  })

  return combined
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
  return Math.floor((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
}

function getDateByWeekAndDay(weekNumber: number, dayIndex: number): Date {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1)
  return new Date(
      startOfYear.getTime() + weekNumber * 7 * 86400000 + dayIndex * 86400000
  )
}

const StyledTabsList = styled(TabsList)`
  button {
    :first-child {
      &[data-state="active"] {
        background: var(--card-link);
      }
    }
  }
`