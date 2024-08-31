const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5500;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const cache = {};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client'))); // Serve static files from the 'client' folder

// Route to serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Route for searching images
app.get('/api/search', async (req, res) => {
  const { query, page = 1 } = req.query;
  const cacheKey = `${query}-${page}`;

  // Check cache first
  if (cache[cacheKey]) {
    return res.json(cache[cacheKey]);
  }

  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: 'photo',
        per_page: 300, // Max per page to reduce requests
        page: page,
      },
    });

    // Cache the response
    cache[cacheKey] = response.data;

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Error fetching images from Pixabay.' });
  }
});

// Route for random images when no search phrase is entered
app.get('/api/random', async (req, res) => {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_API_KEY,
        q: '',
        image_type: 'photo',
        per_page: 30, // Show initial set of random images
        order: 'popular',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching random images:', error);
    res.status(500).json({ error: 'Error fetching random images from Pixabay.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});