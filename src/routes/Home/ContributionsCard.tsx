import React, { useEffect, useState } from 'react';
import { CONFIG } from "site.config";

export default function Home() {
  const [contributions, setContributions] = useState({ github: [], gitlab: [], bitbucket: [] });
  const [filteredContributions, setFilteredContributions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const githubRes = await fetch(`/api/github?username=${CONFIG.profile.github}`);
        const gitlabRes = await fetch(`/api/gitlab?username=${CONFIG.profile.gitlab}`);
        const bitbucketRes = await fetch(`/api/bitbucket?username=${CONFIG.profile.bitbucket}`);

        const githubData = await githubRes.json();
        const gitlabData = await gitlabRes.json();
        const bitbucketData = await bitbucketRes.json();

        const allContributions = {
          github: Array.isArray(githubData) ? parseGitHubData(githubData) : [],
          gitlab: Array.isArray(gitlabData) ? parseGitLabData(gitlabData) : [],
          bitbucket: bitbucketData.values ? parseBitbucketData(bitbucketData) : [],
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
      setFilteredContributions(contributions[filter] || []);
    }
  }, [filter, contributions]);

  const handleFilterChange = (event) => {
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
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(53, 14px)`, // 53주는 가로로 배치
            gridTemplateRows: `repeat(7, 14px)`,    // 7일은 세로로 배치
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
                  width: '14px',
                  height: '14px',
                  backgroundColor: day.color || '#ebedf0',
                  borderRadius: '3px',
                }}
              ></div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 각 플랫폼에서 가져온 데이터를 일관된 형식으로 변환하는 함수들
function parseGitHubData(data) {
  return data.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      contributionCount: day.contributionCount,
      color: day.color,
    }))
  );
}

function parseGitLabData(data) {
  const contributions = Array.from({ length: 53 }, () => Array(7).fill({ date: null, contributionCount: 0, color: '#ebedf0' }));
  data.forEach((event) => {
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

function parseBitbucketData(data) {
  const contributions = Array.from({ length: 53 }, () => Array(7).fill({ date: null, contributionCount: 0, color: '#ebedf0' }));
  data.forEach((commit) => {
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
function combineContributions(contributions) {
  const combined = Array.from({ length: 53 }, () => Array(7).fill({ date: null, contributionCount: 0, color: '#ebedf0' }));
  ['github', 'gitlab', 'bitbucket'].forEach((platform) => {
    if (contributions[platform]) {
      contributions[platform].forEach((week, weekIndex) => {
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
function getWeekNumber(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - startOfYear) / 86400000;
  return Math.floor((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}
