import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { CONFIG } from "site.config";

import { FaLayerGroup, FaGithubAlt, FaGitlab } from "react-icons/fa6";
import { TbExternalLink } from "react-icons/tb";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Contribution {
  date: string | null;
  count: number;
  color: string;
}

interface Contributions {
  github: Contribution[][];
  gitlab: Contribution[][];
}

const CACHE_KEY = "contributionsCache";

export default function Home() {
  const defaultContributions: Contributions = {
    github: Array(53).fill(Array(7).fill({ date: null, count: 0, color: "#ebedf0" })),
    gitlab: Array(53).fill(Array(7).fill({ date: null, count: 0, color: "#ebedf0" })),
  };

  const [contributions, setContributions] = useState<Contributions>(defaultContributions);
  const [filteredContributions, setFilteredContributions] = useState<Contribution[][]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedData: Contributions = JSON.parse(cachedData);
        setContributions(parsedData);
        setFilteredContributions(combineContributions(parsedData));
        setLoading(false);
      } else {
        fetchContributions();
      }
    } catch (error) {
      console.warn("Failed to access localStorage or parse cached data:", error);
      fetchContributions();
    }
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredContributions(combineContributions(contributions));
    } else {
      setFilteredContributions(contributions[filter as keyof Contributions] || []);
    }
  }, [filter, contributions]);

  const fetchContributions = async () => {
    try {
      const githubRes = await fetch(`/api/github?username=${CONFIG.profile.github}`);
      const gitlabRes = await fetch(`/api/gitlab?username=${CONFIG.profile.gitlab}`);

      const githubData = await githubRes.json();
      const gitlabData = await gitlabRes.json();

      const allContributions: Contributions = {
        github: Array.isArray(githubData) ? parseGitHubData(githubData) : [],
        gitlab: Array.isArray(gitlabData) ? parseGitLabData(gitlabData) : [],
      };

      setContributions(allContributions);
      setFilteredContributions(combineContributions(allContributions));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(allContributions));
      } catch (storageError) {
        console.warn("Failed to save data in localStorage:", storageError);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch contributions:", error);
      setLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  return (
      <TooltipProvider>
        <div>
          <Tabs defaultValue="all" value={filter} onValueChange={handleFilterChange}>
            <StyledTabsList className="space-x-2 bg-body">
              <TabsTrigger value="all" className="px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-black focus:outline-none data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-800">
                <FaLayerGroup className="me-1" /> All
              </TabsTrigger>
              <TabsTrigger value="github" className="px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-black focus:outline-none data-[state=active]:bg-black data-[state=active]:text-white">
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
              <TabsTrigger value="gitlab" className="px-4 py-2 rounded-full hover:bg-orange-300 dark:hover:bg-orange-900 focus:outline-none data-[state=active]:bg-orange-600 data-[state=active]:text-white">
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
                  <ScrollArea className="p-2 rounded-md border">
                    <div style={{ overflowX: "auto", width: "100%" }}>
                      <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(53, 11px)`,
                            gridTemplateRows: `repeat(7, 11px)`,
                            gap: "3px 3px"
                          }}
                      >
                        {filteredContributions.length > 0 ? (
                            filteredContributions.map((week, weekIndex) =>
                                Array.isArray(week)
                                    ? week.map((day, dayIndex) => (
                                        <Tooltip key={`${weekIndex}-${dayIndex}`}>
                                          <TooltipTrigger asChild>
                                            <div
                                                style={{
                                                  gridColumnStart: weekIndex + 1,
                                                  gridRowStart: dayIndex + 1,
                                                  width: "10px",
                                                  height: "10px",
                                                  backgroundColor: day?.color || "#ebedf0",
                                                  borderRadius: "3px",
                                                }}
                                            ></div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{day?.date || "No date"}</p>
                                            {day?.count > 0 ? (
                                                <p>{day.count} contributions</p>
                                            ) : (
                                                <p>No contributions</p>
                                            )}
                                          </TooltipContent>
                                        </Tooltip>
                                    ))
                                    : null
                            )
                        ) : (
                            <p>No contributions available</p>
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
  );
}

// Helper functions
function parseGitHubData(data: any): Contribution[][] {
  return normalizeData(data);
}

function parseGitLabData(data: any): Contribution[][] {
  return normalizeData(data);
}

function normalizeData(data: any): Contribution[][] {
  const contributions = Array(53)
      .fill(null)
      .map(() => Array(7).fill({ date: null, count: 0, color: "#ebedf0" }));

  data.forEach((entry: any) => {
    const date = new Date(entry.date);
    const { weekIndex, dayIndex } = getWeekAndDayIndex(date);
    contributions[weekIndex][dayIndex] = {
      date: entry.date,
      count: entry.count || 0,
      color: entry.color || "#ebedf0",
    };
  });

  return contributions;
}

function getWeekAndDayIndex(date: Date): { weekIndex: number; dayIndex: number } {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const weekIndex = Math.floor(dayOfYear / 7);
  const dayIndex = date.getDay();
  return { weekIndex, dayIndex };
}

function combineContributions(contributions: Contributions): Contribution[][] {
  const combined = Array(53)
      .fill(null)
      .map(() => Array(7).fill({ date: null, count: 0, color: "#ebedf0" }));

  ["github", "gitlab"].forEach((platform) => {
    contributions[platform as keyof Contributions].forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        if (day.date) {
          const date = new Date(day.date);
          const { weekIndex: combinedWeek, dayIndex: combinedDay } = getWeekAndDayIndex(date);
          const existing = combined[combinedWeek][combinedDay];
          combined[combinedWeek][combinedDay] = {
            date: day.date,
            count: existing.count + day.count,
            color: day.color !== "#ebedf0" ? day.color : existing.color,
          };
        }
      });
    });
  });

  return combined;
}

const StyledTabsList = styled(TabsList)`
  button {
    :first-child {
      &[data-state="active"] {
        background: var(--card-link);
      }
    }
  }
`;
