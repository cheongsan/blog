import React, { useEffect, useState } from 'react';
import { CONFIG } from 'site.config';

import {
  FaLayerGroup,
  FaGithubAlt,
  FaGitlab,
} from "react-icons/fa6";
import { TbExternalLink } from "react-icons/tb";
import {
  ScrollArea,
  ScrollBar
} from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ContributionDay {
  date: string | null;
  contributionCount: number;
  color: string;
}

interface Contributions {
  github: ContributionDay[][];
  gitlab: ContributionDay[][];
}

const CACHE_KEY = 'contributionsCache';

export default function Home() {
  const [contributions, setContributions] = useState<Contributions>({
    github: [],
    gitlab: [],
  });

  const [filteredContributions, setFilteredContributions] = useState<ContributionDay[][]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      setContributions(parsedData);
      setFilteredContributions(combineContributions(parsedData));
      setLoading(false);
    } else {
      fetchContributions();
    }
  }, []);

  useEffect(() => {
    if (filter === 'all') {
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
      localStorage.setItem(CACHE_KEY, JSON.stringify(allContributions));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  if (loading) {
    return (
        <div className="w-96 h-32">
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
    );
  }

  return (
      <div>
        {/* 필터 Tabs */}
        <Tabs
            defaultValue="all"
            value={filter}
            onValueChange={handleFilterChange}
        >
          <TabsList className="space-x-2 bg-body">
            <TabsTrigger
                value="all"
                className="px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-900 focus:outline-none data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-none"
            >
              <FaLayerGroup className="me-1" /> All
            </TabsTrigger>
            <TabsTrigger
                value="github"
                className="px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-900 focus:outline-none data-[state=active]:bg-black data-[state=active]:text-white"
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
          </TabsList>
          <TabsContent value={filter}>
            {/* 기여도 그리드 */}
            <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
              <div style={{ overflowX: "auto", width: "100%" }}>
                <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(53, 11px)`, // 53주는 가로로 배치
                      gridTemplateRows: `repeat(7, 11px)`, // 7일은 세로로 배치
                      gap: "4px",
                      minWidth: "750px", // 최소 너비 설정
                    }}
                >
                  {filteredContributions.map((week, weekIndex) =>
                      week.map((day, dayIndex) => (
                          <div
                              key={`${weekIndex}-${dayIndex}`}
                              title={`${day.date || ""}: ${
                                  day.contributionCount || 0
                              } contributions`}
                              style={{
                                gridColumnStart: weekIndex + 1, // 주는 가로로 배치
                                gridRowStart: dayIndex + 1, // 요일은 세로로 배치
                                width: "10px",
                                height: "10px",
                                backgroundColor: day.color || "#ebedf0",
                                borderRadius: "3px",
                              }}
                          ></div>
                      ))
                  )}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
  )
}

// 각 플랫폼에서 가져온 데이터를 일관된 형식으로 변환하는 함수들
function parseGitHubData(data: any): ContributionDay[][] {
  return data.map((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        contributionCount: day.contributionCount,
        color: day.color,
      }))
  );
}

function parseGitLabData(data: any): ContributionDay[][] {
  const contributions = Array.from({ length: 53 }, () => Array(7).fill({ date: null, contributionCount: 0, color: '#ebedf0' }));
  data.forEach((event: any) => {
    const date = event.created_at.split('T')[0];
    const dayOfWeek = new Date(date).getDay();
    const weekNumber = getWeekNumber(new Date(date));

    contributions[weekNumber][dayOfWeek] = {
      date: date,
      contributionCount: (contributions[weekNumber][dayOfWeek].contributionCount || 0) + 1,
      color: '#216e39',
    };
  });
  return contributions;
}

// 각 플랫폼의 기여도를 병합하는 함수
function combineContributions(contributions: Contributions): ContributionDay[][] {
  const combined = Array.from({ length: 53 }, () => Array(7).fill({ date: null, contributionCount: 0, color: '#ebedf0' }));
  ['github', 'gitlab'].forEach((platform) => {
    if (contributions[platform as keyof Contributions]) {
      contributions[platform as keyof Contributions].forEach((week, weekIndex) => {
        week.forEach((day, dayIndex) => {
          if (day.contributionCount > 0) {
            combined[weekIndex][dayIndex].contributionCount += day.contributionCount;
            combined[weekIndex][dayIndex].color = day.color;
            combined[weekIndex][dayIndex].date = day.date;
          }
        });
      });
    }
  });
  return combined;
}

// 주 번호를 계산하는 함수
function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.floor((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}
