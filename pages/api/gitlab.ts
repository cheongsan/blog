import { NextApiRequest, NextApiResponse } from 'next';

interface ContributionDay {
  date: Date;
  contributionCount: number;
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

  const endpoint = `https://gitlab.com/api/v4/users/${username}/events`;
  const token = process.env.GITLAB_TOKEN;

  if (!token) {
    res.status(500).json({ error: 'GITLAB_TOKEN is not set in environment variables' });
    return;
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitLab contributions');
    }

    const data = await response.json();

    const contributions: Record<string, number> = {};
    data.forEach((event: any) => {
      const eventDate = new Date(event.created_at).toISOString().split('T')[0]; // YYYY-MM-DD 형식
      contributions[eventDate] = (contributions[eventDate] || 0) + 1;
    });

    const result: ContributionDay[] = Object.entries(contributions).map(([date, contributionCount]) => ({
      date: new Date(date),
      contributionCount,
    }));

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching GitLab contributions:', error);
    res.status(500).json({ error: error.message });
  }
}
