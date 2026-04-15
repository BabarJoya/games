// Vercel Serverless Function — fetches a player's season stats
// Endpoint: /api/pubg-stats?shard=steam&accountId=account.xxx&seasonId=division.bro.official.pc-2018-01

const PUBG_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3MzU2Y2FjMC0xYWU4LTAxM2YtMGEyOC00MjgyNzQzZTBmOTMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNzc2MjUwOTIwLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImdhbWUtdWMifQ.sO3DiHSh5-jD2RsSDac7wiKxja5CBl9sZyQF4xF7AY8';

export default async function handler(req, res) {
  const { shard, accountId, seasonId } = req.query;

  if (!shard || !accountId || !seasonId) {
    return res.status(400).json({ error: 'Missing shard, accountId, or seasonId' });
  }

  try {
    const response = await fetch(
      `https://api.pubg.com/shards/${shard}/players/${encodeURIComponent(accountId)}/seasons/${encodeURIComponent(seasonId)}`,
      {
        headers: {
          'Authorization': `Bearer ${PUBG_TOKEN}`,
          'Accept': 'application/vnd.api+json',
        },
      }
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach PUBG API', detail: err.message });
  }
}
