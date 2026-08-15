const express = require('express');
const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const landingTemplate = require('stremio-addon-sdk/src/landingTemplate');
const path = require('path');
const fs = require('fs');

// Load curated dataset
const datasetPath = path.join(__dirname, 'dataset.json');
let dataset = [];

try {
  const data = fs.readFileSync(datasetPath, 'utf-8');
  dataset = JSON.parse(data);
  console.log(`Successfully loaded ${dataset.length} essential episodes from dataset.json`);
} catch (err) {
  console.error(`Error loading dataset.json: ${err.message}`);
  console.warn('Run "npm run build:dataset" to generate dataset.json.');
}

const manifest = {
  id: 'community.simpsons.essentialcut',
  version: '1.0.3',
  name: 'The Simpsons: The Essential Cut',
  description: 'Curated golden-era run of 150 essential episodes of The Simpsons (Seasons 1-14).',
  types: ['series'],
  catalogs: [
    {
      type: 'series',
      id: 'simpsons_essential_catalog',
      name: 'The Simpsons: Essential Cut',
      extra: [
        { name: 'genre', options: ['All', 'Animation', 'Comedy'], isRequired: false },
        { name: 'search', isRequired: false },
        { name: 'skip', isRequired: false }
      ]
    }
  ],
  resources: ['catalog', 'meta'],
  idPrefixes: ['tt0096697', 'tt0096697_essential', 'tt'],
  logo: 'https://images.metahub.space/logo/medium/tt0096697/img',
  background: 'https://images.metahub.space/background/medium/tt0096697/img'
};

const builder = new addonBuilder(manifest);

const SERIES_METADATA = {
  id: 'tt0096697',
  type: 'series',
  name: 'The Simpsons (The Essential Cut)',
  genres: ['Animation', 'Comedy'],
  poster: 'https://images.metahub.space/poster/small/tt0096697/img',
  posterShape: 'regular',
  background: 'https://images.metahub.space/background/medium/tt0096697/img',
  logo: 'https://images.metahub.space/logo/medium/tt0096697/img',
  description: 'Curated 150 essential episodes of The Simpsons across the golden era (Seasons 1 to 14). Skip the filler, enjoy the absolute classics with full IMDb stream compatibility.',
  releaseInfo: '1989–2003',
  imdbRating: '8.6',
  runtime: '22-24 min'
};

// Catalog Handler - Always returns the essential cut series metadata
builder.defineCatalogHandler((args) => {
  if (args.type === 'series' && args.id === 'simpsons_essential_catalog') {
    if (args.extra && args.extra.search) {
      const q = args.extra.search.toLowerCase();
      if ('the simpsons essential cut'.includes(q) || 'simpsons'.includes(q) || 'essential'.includes(q)) {
        return Promise.resolve({ metas: [SERIES_METADATA] });
      }
      return Promise.resolve({ metas: [] });
    }
    // Return the series item for default views, genre filters, skip=0, etc.
    return Promise.resolve({
      metas: [SERIES_METADATA]
    });
  }
  return Promise.resolve({ metas: [] });
});

// Meta Handler - Serves the 150 curated episodes
builder.defineMetaHandler((args) => {
  if (args.type === 'series' && (args.id === 'tt0096697' || args.id === 'tt0096697_essential')) {
    return Promise.resolve({
      meta: {
        ...SERIES_METADATA,
        id: args.id,
        videos: dataset
      }
    });
  }
  return Promise.resolve({ meta: null });
});

const app = express();

// Enable universal CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Stremio official router
app.use(getRouter(builder.getInterface()));

// Intelligent Root handler: serves JSON manifest to Stremio / API clients, and HTML to browsers
app.get('/', (req, res) => {
  const accept = req.headers['accept'] || '';
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  // If a browser explicitly visits without API / JSON accept header
  if (accept.includes('text/html') && !accept.includes('application/json') && !userAgent.includes('stremio')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(landingTemplate(manifest));
  }

  // Otherwise return JSON manifest directly so Stremio never fails even if installed from root URL
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.json(manifest);
});

const PORT = parseInt(process.env.PORT, 10) || 7000;

app.listen(PORT, () => {
  console.log(`Add-on HTTP server listening on port ${PORT}`);
  console.log(`Manifest URL: http://127.0.0.1:${PORT}/manifest.json`);
});
