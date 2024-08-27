export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const endpoint = `https://api.bitbucket.org/2.0/repositories/${username}`;
  const token = process.env.BITBUCKET_TOKEN; // .env.local에 BITBUCKET_TOKEN을 저장하세요.

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Bitbucket contributions');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
