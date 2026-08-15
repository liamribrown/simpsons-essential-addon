const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
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
  version: '1.0.1',
  name: 'The Simpsons: The Essential Cut',
  description: 'Curated golden-era run of 150 essential episodes of The Simpsons (Seasons 1-14).',
  types: ['series'],
  catalogs: [
    {
      type: 'series',
      id: 'simpsons_essential_catalog',
      name: 'The Simpsons: Essential Cut',
      extra: [
        { name: 'search', isRequired: false },
        { name: 'skip', isRequired: false }
      ]
    }
  ],
  resources: ['catalog', 'meta'],
  idPrefixes: ['tt0096697_essential', 'tt0096697'],
  logo: 'https://images.metahub.space/logo/medium/tt0096697/img',
  background: 'https://images.metahub.space/background/medium/tt0096697/img'
};

const builder = new addonBuilder(manifest);

const SERIES_METADATA = {
  id: 'tt0096697_essential',
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

// Catalog Handler
builder.defineCatalogHandler((args) => {
  if (args.type === 'series' && args.id === 'simpsons_essential_catalog') {
    // If search filter is used
    if (args.extra && args.extra.search) {
      const q = args.extra.search.toLowerCase();
      if ('the simpsons essential cut'.includes(q) || 'simpsons'.includes(q) || 'essential'.includes(q)) {
        return Promise.resolve({ metas: [SERIES_METADATA] });
      }
      return Promise.resolve({ metas: [] });
    }
    return Promise.resolve({
      metas: [SERIES_METADATA]
    });
  }
  return Promise.resolve({ metas: [] });
});

// Meta Handler
builder.defineMetaHandler((args) => {
  if (args.type === 'series' && (args.id === 'tt0096697_essential' || args.id === 'tt0096697')) {
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

const PORT = parseInt(process.env.PORT, 10) || 7000;

serveHTTP(builder.getInterface(), { port: PORT })
  .then((server) => {
    console.log(`Add-on HTTP server running on port ${PORT}`);
    console.log(`Manifest URL: ${server.url || `http://127.0.0.1:${PORT}/`}manifest.json`);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });
