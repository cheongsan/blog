import { GraphQLClient } from 'graphql-request';
import { NextApiRequest, NextApiResponse } from 'next';

interface ContributionDay {
  date: Date;
  contributionCount: number;
}

interface ContributionsResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: {
            date: string;
            contributionCount: number;
          }[];
        }[];
      };
    };
  };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
  const { username } = req.query;

  if (typeof username !== 'string') {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const endpoint = 'https://api.github.com/graphql';
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    res.status(500).json({ error: 'GITHUB_TOKEN is not set in environment variables' });
    return;
  }

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const variables = { login: username };

  try {
    const data: ContributionsResponse = await graphQLClient.request(query, variables);

    const formattedData: ContributionDay[] = data.user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
        week.contributionDays.map((day) => ({
          date: new Date(day.date),
          contributionCount: day.contributionCount,
        }))
    );

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('GraphQL request failed:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub contributions' });
  }
}