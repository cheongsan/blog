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
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const parsedData: Contributions = JSON.parse(cachedData)
        setContributions(parsedData)
        setFilteredContributions(combineContributions(parsedData))
        setLoading(false)
      } else {
        fetchContributions()
      }
    } catch (error) {
      console.warn("Failed to access localStorage or parse cached data:", error)
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
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(allContributions))
      } catch (storageError) {
        console.warn("Failed to save data in localStorage:", storageError)
      }
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
                              const githubCount = contributions.github[weekIndex]?.[dayIndex]?.count || 0;
                              const gitlabCount = contributions.gitlab[weekIndex]?.[dayIndex]?.count || 0;
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
  // 데이터 파싱 및 필터링 (현재 연도만 포함)
  const currentYear = new Date().getFullYear();
  const contributions = Array.from({ length: 53 }, () =>
      Array.from({ length: 7 }, () => ({
        date: null,
        count: 0,
        color: getColor(0),
      }))
  );

  data.forEach((week: any, weekIndex: number) => {
    week.contributionDays.forEach((day: any, dayIndex: number) => {
      const date = new Date(day.date);
      if (date.getFullYear() === currentYear) {
        contributions[weekIndex][dayIndex] = {
          date: date.toISOString().split("T")[0],
          count: day.contributionCount,
          color: getColor(day.contributionCount),
        };
      }
    });
  });

  return filterCurrentYear(contributions);
}

function parseGitLabData(data: any): Contribution[][] {
  const currentYear = new Date().getFullYear();

  // 기본 캘린더 데이터 생성
  const contributions = Array.from({ length: 53 }, (_, weekIndex) =>
      Array.from({ length: 7 }, (_, dayIndex) => {
        const date = getDateByIndex(weekIndex, dayIndex);
        if (date.getFullYear() === currentYear) {
          return {
            date: date.toISOString().split("T")[0],
            count: 0,
            color: getColor(0),
          };
        }
        return { date: null, count: 0, color: getColor(0) };
      })
  );

  data.forEach((event: any) => {
    const date = new Date(event.created_at.split("T")[0]);
    if (date.getFullYear() === currentYear) {
      const { weekIndex, dayIndex } = getWeekAndDayIndex(date);
      if (contributions[weekIndex] && contributions[weekIndex][dayIndex]) {
        contributions[weekIndex][dayIndex].count += 1;
        contributions[weekIndex][dayIndex].color = getColor(
            contributions[weekIndex][dayIndex].count
        );
      }
    }
  });

  return filterCurrentYear(contributions);
}

// 날짜 계산 유틸리티 함수
function getWeekAndDayIndex(date: Date): { weekIndex: number; dayIndex: number } {
  const startOfYear = new Date(date.getFullYear(), 0, 1); // 1월 1일
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000); // 연도 기준 일차
  const weekIndex = Math.floor(dayOfYear / 7); // 주차 계산
  const dayIndex = date.getDay(); // 요일 계산 (0: 일요일, 6: 토요일)
  return { weekIndex, dayIndex };
}

function getDateByIndex(weekIndex: number, dayIndex: number): Date {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1); // 1월 1일
  const dayOffset = weekIndex * 7 + dayIndex; // 주차 및 요일 기준 일차 계산
  return new Date(startOfYear.getTime() + dayOffset * 86400000); // 결과 날짜 반환
}

// 병합 로직 수정
function combineContributions(contributions: Contributions): Contribution[][] {
  const combined = Array.from({ length: 53 }, (_, weekIndex) =>
      Array.from({ length: 7 }, (_, dayIndex) => {
        const date = getDateByIndex(weekIndex, dayIndex);
        if (date.getFullYear() === new Date().getFullYear()) {
          return {
            date: date.toISOString().split("T")[0], // ISO 형식 문자열로 변환
            count: 0,
            color: "#ebedf0",
          };
        }
        return { date: null, count: 0, color: "#ebedf0" }; // 현재 연도가 아닌 데이터는 제외
      })
  );

  ["github", "gitlab"].forEach((platform) => {
    contributions[platform as keyof Contributions].forEach(
        (week, weekIndex) => {
          week.forEach((day, dayIndex) => {
            if (day.date) {
              const { weekIndex: combinedWeek, dayIndex: combinedDay } = getWeekAndDayIndex(new Date(day.date));
              if (combined[combinedWeek] && combined[combinedWeek][combinedDay]) {
                combined[combinedWeek][combinedDay].count += day.count;
                if (day.color !== "#ebedf0") {
                  combined[combinedWeek][combinedDay].color = day.color;
                }
              }
            }
          });
        }
    );
  });

  return filterCurrentYear(combined);
}

// 현재 연도 데이터만 필터링
function filterCurrentYear(contributions: Contribution[][]): Contribution[][] {
  const currentYear = new Date().getFullYear();
  return contributions.map((week) =>
      week.map((day) => {
        if (!day.date) return { ...day, date: null }; // 날짜가 없는 경우 무시
        const date = new Date(day.date);
        return date.getFullYear() === currentYear
            ? day
            : { ...day, date: null, count: 0, color: "#ebedf0" };
      })
  );
}

function getColor(contributionCount: number): string {
  if (contributionCount === 0) return "#ebedf0"
  if (contributionCount <= 2) return "#c6e48b"
  if (contributionCount <= 4) return "#7bc96f"
  if (contributionCount <= 6) return "#239a3b"
  return "#216e39"
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