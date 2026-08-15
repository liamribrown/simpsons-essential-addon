const http = require('http');
const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const express = require('express');
const dataset = require('./dataset.json');

const manifest = {
  id: 'community.simpsons.essentialcut',
  version: '1.0.0',
  name: 'The Simpsons: The Essential Cut',
  description: 'Curated golden-era run of 150 essential episodes of The Simpsons (Seasons 1-14).',
  types: ['series'],
  catalogs: [
    {
      type: 'series',
      id: 'simpsons_essential_catalog',
      name: 'The Simpsons: Essential Cut'
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
  description: 'Curated 150 essential episodes of The Simpsons across the golden era (Seasons 1 to 14).',
  releaseInfo: '1989–2003',
  imdbRating: '8.6',
  runtime: '22-24 min'
};

builder.defineCatalogHandler((args) => {
  if (args.type === 'series' && args.id === 'simpsons_essential_catalog') {
    return Promise.resolve({ metas: [SERIES_METADATA] });
  }
  return Promise.resolve({ metas: [] });
});

builder.defineMetaHandler((args) => {
  if (args.type === 'series' && (args.id === 'tt0096697_essential' || args.id === 'tt0096697')) {
    return Promise.resolve({
      meta: {
        ...SERIES_METADATA,
        videos: dataset
      }
    });
  }
  return Promise.resolve({ meta: null });
});

const app = express();
app.use(getRouter(builder.getInterface()));

const server = app.listen(7099, async () => {
  console.log('Test server started on 7099');

  function getJSON(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:7099${path}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  try {
    const manifestRes = await getJSON('/manifest.json');
    console.log('Manifest status:', manifestRes.status);
    console.log('Manifest ID:', manifestRes.data.id);
    console.log('Manifest Name:', manifestRes.data.name);

    const catalogRes = await getJSON('/catalog/series/simpsons_essential_catalog.json');
    console.log('Catalog status:', catalogRes.status);
    console.log('Catalog metas count:', catalogRes.data.metas.length);
    console.log('Catalog meta title:', catalogRes.data.metas[0].name);

    const metaRes = await getJSON('/meta/series/tt0096697_essential.json');
    console.log('Meta status:', metaRes.status);
    console.log('Meta title:', metaRes.data.meta.name);
    console.log('Meta videos count:', metaRes.data.meta.videos.length);
    console.log('Sample Episode 1:', metaRes.data.meta.videos[0].title, `(S${metaRes.data.meta.videos[0].season}E${metaRes.data.meta.videos[0].episode})`, metaRes.data.meta.videos[0].id);
    console.log('Sample Episode 150:', metaRes.data.meta.videos[149].title, `(S${metaRes.data.meta.videos[149].season}E${metaRes.data.meta.videos[149].episode})`, metaRes.data.meta.videos[149].id);

    console.log('\nALL ENDPOINT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
  }
});
