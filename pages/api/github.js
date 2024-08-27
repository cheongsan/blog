import { GraphQLClient } from 'graphql-request';
import { CONFIG } from "site.config"

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const endpoint = 'https://api.github.com/graphql';
  const token = process.env.GITHUB_TOKEN; // .env.local에 GITHUB_TOKEN을 저장하세요.

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
                color
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    login: username,
  };

  try {
    const data = await graphQLClient.request(query, variables);
    res.status(200).json(data.user.contributionsCollection.contributionCalendar.weeks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GitHub contributions' });
  }
}
