const express = require('express');
const { OpenFeature } = require('@openfeature/server-sdk');
const { FlagdProvider } = require('@openfeature/flagd-provider');
const otel = require('./tracing');

const app = express();
const port = process.env.RECOMMENDATION_PORT || 8080;

// Initialize OpenFeature
const flagdProvider = new FlagdProvider({
  host: process.env.FLAGD_HOST || 'flagd',
  port: parseInt(process.env.FLAGD_PORT) || 8013,
});
OpenFeature.setProvider(flagdProvider);
const client = OpenFeature.getClient();

app.use(express.json());

// Dummy product database
const products = [
  { id: '0PU716880G', name: 'Vintage Typewriter', category: 'Astronomy' },
  { id: '1YR636780C', name: 'Vintage Camera', category: 'Astronomy' },
  { id: '2ZN512345D', name: 'Stars & Galaxies Poster', category: 'Decor' },
  { id: '3AB987654X', name: 'Moon Lamp', category: 'Decor' },
  { id: '66V9W07S70', name: 'Solar System Kit', category: 'Education' },
  { id: '6E9ZZE0106', name: 'Telescope 101 Book', category: 'Education' },
  { id: '9SI_SWS_XG', name: 'Galactic Hoodie', category: 'Apparel' },
  { id: 'L9ECAV7KIM', name: 'Space Suit Replica', category: 'Apparel' },
];

// Logic for canary vs default algorithm
async function getRecommendations(productId) {
  const useCanary = await client.getBooleanValue('recommendationCanary', false);
  
  if (useCanary) {
    console.log(`Using canary recommendation algorithm for product: ${productId}`);
    // Canary: recommend products from the same category
    const currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return products.slice(0, 3);
    return products.filter(p => p.category === currentProduct.category && p.id !== productId).slice(0, 3);
  } else {
    console.log(`Using default recommendation algorithm for product: ${productId}`);
    // Default: just shuffle and return 3
    return products.filter(p => p.id !== productId).sort(() => 0.5 - Math.random()).slice(0, 3);
  }
}

app.get('/list-recommendations', async (req, res) => {
  const { product_id } = req.query;
  
  if (!product_id) {
    return res.status(400).json({ error: 'Missing product_id parameter' });
  }

  try {
    const recommendations = await getRecommendations(product_id);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Recommendation service listening at http://localhost:${port}`);
});
