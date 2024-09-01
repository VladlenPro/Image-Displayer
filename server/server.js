const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5501;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const cache = {};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Route for searching images
app.get('/api/search', async (req, res) => {
  const { query, page } = req.query;
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
        per_page: 200, // Max per page to reduce requests
        page: page,
      },
    });

    const totalPages = Math.ceil(response.data.totalHits / 200); 
    const result = {
      hits: response.data.hits,
      totalHits: response.data.totalHits,
      totalPages: totalPages
    };

    cache[cacheKey] = result;

    res.json(result);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Error fetching images from Pixabay.' });
  }
});

app.get('/api/random', async (req, res) => {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_API_KEY,
        q: '',
        image_type: 'photo',
        per_page: 20,
        order: 'popular',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching random images:', error);
    res.status(500).json({ error: 'Error fetching random images from Pixabay.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});