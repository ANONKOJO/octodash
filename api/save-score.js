import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, score } = req.body;

    if (!username || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Retrieve current leaderboard
    const leaderboard = (await redis.get('leaderboard')) || [];

    // Update or insert user score
    const existingIndex = leaderboard.findIndex(
      (entry) => entry.username.toLowerCase() === username.toLowerCase()
    );

    if (existingIndex !== -1) {
      if (score > leaderboard[existingIndex].score) {
        leaderboard[existingIndex].score = score;
        leaderboard[existingIndex].date = new Date().toISOString();
      }
    } else {
      leaderboard.push({ username, score, date: new Date().toISOString() });
    }

    // Sort and limit to top 50
    leaderboard.sort((a, b) => b.score - a.score);
    const top50 = leaderboard.slice(0, 50);

    // Save back to Redis
    await redis.set('leaderboard', top50);

    return res.status(200).json({ success: true, leaderboard: top50 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}
