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

  // Valideer de gebruikersnaam
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required and must be a string' });
  }

  // Check cache first
  const cachedData = cache.get(username);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    // Haal gebruikersgegevens op van de Roblox API
    const response = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
    
    // Controleer of de response OK is
    if (!response.ok) {
      throw new Error(`Roblox API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Controleer of de gebruiker bestaat
    if (!data.Id) {
      throw new Error('User not found');
    }

    // Cache de gegevens
    cache.set(username, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Roblox data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// Start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
