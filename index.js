const express = require('express');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const app = express();
const cache = new NodeCache({ stdTTL: 86400 }); // Cache avatars voor 24 uur

// CORS middleware toevoegen
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Sta alle domeinen toe
  res.header('Access-Control-Allow-Methods', 'GET'); // Sta alleen GET-requests toe
  res.header('Access-Control-Allow-Headers', 'Content-Type'); // Sta deze headers toe
  next();
});

app.use(express.json());

// Endpoint om Roblox-gebruikersgegevens op te halen
app.get('/get-by-username', async (req, res) => {
  const { username } = req.query;

  // Check cache first
  const cachedData = cache.get(username);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
    const data = await response.json();
    cache.set(username, data); // Cache the data
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
