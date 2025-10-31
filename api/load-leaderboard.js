import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const leaderboard = (await redis.get('leaderboard')) || [];
    return res.status(200).json({ leaderboard });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load leaderboard' });
  }
}
