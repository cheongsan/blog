import React, { useEffect, useState } from 'react';
import { CONFIG } from '@/site.config';

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface ContributionDay {
  date: string | null;
  contributionCount: number;
  color: string;
}

interface Contributions {
  github: ContributionDay[][];
  gitlab: ContributionDay[][];
  bitbucket: ContributionDay[][];
}

export default function Home() {
  const [contributions, setContributions] = useState<Contributions>({
    github: [],
    gitlab: [],
    bitbucket: [],
  });

  const [filteredContributions, setFilteredContributions] = useState<ContributionDay[][]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const githubRes = await fetch(`/api/github?username=${CONFIG.profile.github}`);
        const gitlabRes = await fetch(`/api/gitlab?username=${CONFIG.profile.gitlab}`);
        const bitbucketRes = await fetch(`/api/bitbucket?username=${CONFIG.profile.bitbucket}`);

        const githubData = await githubRes.json();
        const gitlabData = await gitlabRes.json();
        const bitbucketData = await bitbucketRes.json();

        const allContributions: Contributions = {
          github: Array.isArray(githubData) ? parseGitHubData(githubData) : [],
          gitlab: Array.isArray(gitlabData) ? parseGitLabData(gitlabData) : [],
          bitbucket: bitbucketData.values ? parseBitbucketData(bitbucketData.values) : [],
        };

        setContributions(allContributions);
        setFilteredContributions(combineContributions(allContributions)); // 초기 상태: 전체 표시
      } catch (error) {
        console.error('Failed to fetch contributions:', error);
      }
    };

    fetchContributions();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredContributions(combineContributions(contributions));
    } else {
      setFilteredContributions(contributions[filter as keyof Contributions] || []);
    }
  }, [filter, contributions]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  return (
    <div>
      {/* 필터 라디오 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="radio"
            value="all"
            checked={filter === 'all'}
            onChange={handleFilterChange}
          />
          All
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="github"
            checked={filter === 'github'}
            onChange={handleFilterChange}
          />
          GitHub
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="gitlab"
            checked={filter === 'gitlab'}
            onChange={handleFilterChange}
          />
          GitLab
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="bitbucket"
            checked={filter === 'bitbucket'}
            onChange={handleFilterChange}
          />
          Bitbucket
        </label>
      </div>

      {/* 기여도 그리드 */}
      <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(53, 11px)`, // 53주는 가로로 배치
              gridTemplateRows: `repeat(7, 11px)`,    // 7일은 세로로 배치
              gap: '4px',
              minWidth: '750px', // 최소 너비 설정
            }}
          >
            {filteredContributions.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  title={`${day.date || ''}: ${day.contributionCount || 0} contributions`}
                  style={{
                    gridColumnStart: weekIndex + 1, // 주는 가로로 배치
                    gridRowStart: dayIndex + 1,    // 요일은 세로로 배치
                    width: '10px',
                    height: '10px',
                    backgroundColor: day.color || '#ebedf0',
                    borderRadius: '3px',
                  }}
                ></div>
              ))
            )}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
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

function parseBitbucketData(data: any): ContributionDay[][] {
  const contributions = Array.from({ length: 53 }, () => Array(7).fill({ date: null, contributionCount: 0, color: '#ebedf0' }));
  data.forEach((commit: any) => {
    const date = commit.date.split('T')[0];
    const dayOfWeek = new Date(date).getDay();
    const weekNumber = getWeekNumber(new Date(date));

    contributions[weekNumber][dayOfWeek] = {
      date: date,
      contributionCount: (contributions[weekNumber][dayOfWeek].contributionCount || 0) + 1,
      color: '#40c463',
    };
  });
  return contributions;
}

// 각 플랫폼의 기여도를 병합하는 함수
function combineContributions(contributions: Contributions): ContributionDay[][] {
  const combined = Array.from({ length: 53 }, () => Array(7).fill({ date: null, contributionCount: 0, color: '#ebedf0' }));
  ['github', 'gitlab', 'bitbucket'].forEach((platform) => {
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
