// Vercel Serverless Function — proxies PUBG API to avoid CORS
// Endpoint: /api/pubg?shard=steam&playerName=Salute

export default async function handler(req, res) {
  const { shard, playerName } = req.query;

  if (!shard || !playerName) {
    return res.status(400).json({ error: 'Missing shard or playerName' });
  }

  try {
    const response = await fetch(
      `https://api.pubg.com/shards/${shard}/players?filter[playerNames]=${encodeURIComponent(playerName)}`,
      {
        headers: {
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3MzU2Y2FjMC0xYWU4LTAxM2YtMGEyOC00MjgyNzQzZTBmOTMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNzc2MjUwOTIwLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImdhbWUtdWMifQ.sO3DiHSh5-jD2RsSDac7wiKxja5CBl9sZyQF4xF7AY8',
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
