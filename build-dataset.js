const fs = require('fs');
const path = require('path');
const https = require('https');

const ESSENTIAL_EPISODES_BY_SEASON = {
  1: [
    "Krusty Gets Busted",
    "Moaning Lisa",
    "Life On The Fast Lane"
  ],
  2: [
    "The Call Of The Simpsons",
    "Bart The Daredevil",
    "Bart Gets Hit By A Car",
    "Simpson & Deliah",
    "Brush With Greatness",
    "The War Of The Simpsons",
    "Three Men & A Comic Book",
    "Blood Feud"
  ],
  3: [
    "Dog Of Death",
    "Bart The Murderer",
    "Homer Alone",
    "Radio Bart",
    "The Otto Show",
    "Bart's Friend Falls In Love",
    "Black Widower",
    "Mr. Lisa Goes To Washington",
    "Stark Raving Dad",
    "Flaming Moe's",
    "Burns Verkaufen Der Kraftwerk",
    "Homer At The Bat",
    "Brother Can You Spare Two Dimes"
  ],
  4: [
    "Kamp Krusty",
    "A Streetcar Named Marge",
    "Homer The Heretic",
    "Lisa The Beauty Queen",
    "New Kid On The Block",
    "Lisa's First Word",
    "Mr. Plow",
    "Homer's Triple Bypass",
    "Selma's Choice",
    "Marge Vs The Monorail",
    "Brother From The Same Planet",
    "Duffless",
    "I Love Lisa",
    "Krusty Gets Kancelled",
    "Whacking Day",
    "Last Exit To Springfield",
    "The Front",
    "Marge In Chains"
  ],
  5: [
    "Homer Goes To College",
    "Homer's Barbershop Quartet",
    "Homer The Vigilante",
    "Cape Feare",
    "Rosebud",
    "Marge On The Lam",
    "Bart's Inner Child",
    "Boy Scoutz In Tha Hood",
    "The Last Temptation Of Homer",
    "$pringfield",
    "Bart Gets Famous",
    "Lisa Vs Malibu Stacy",
    "Homer Loves Flanders",
    "Deep Space Homer",
    "Burns' Heir",
    "The Boy Who Knew Too Much",
    "Sweet Seymour Skinner's Badasssss Song",
    "Lady Bouvier's Lover"
  ],
  6: [
    "Bart Of Darkness",
    "Lisa's Rival",
    "Itchy & Scratchy Land",
    "Sideshow Bob Roberts",
    "Lisa On Ice",
    "Homer: Badman",
    "Grandpa Vs Sexual Inadequacy",
    "Fear Of Flying",
    "Homer The Great",
    "Homie The Clown",
    "And Maggie Makes Three",
    "Bart Vs Australia",
    "A Star Is Burns",
    "Homer Vs Patty & Selma",
    "The PTA Disbands",
    "The Springfield Connection",
    "Round Springfield",
    "Lemon Of Troy",
    "Who Shot Mr. Burns? Pt 1"
  ],
  7: [
    "Who Shot Mr. Burns? Pt 2",
    "Radioactive Man",
    "Bart Sells His Soul",
    "Lisa The Vegetarian",
    "King Size Homer",
    "Mother Simpson",
    "Home Sweet Home Diddily Dum Doodily",
    "Sideshow Bob's Last Gleaming",
    "Marge Be Not Proud",
    "Team Homer",
    "Two Bad Neighbors",
    "Scenes From The Class Struggle In Springfield",
    "Bart The Fink",
    "Homer The Smithers",
    "A Fish Called Selma",
    "Bart On The Road",
    "22 Short Films About Springfield",
    "Curse Of The Flying Hellfish",
    "Much Apu About Nothing",
    "Homerpalooza",
    "Summer Of 4'2\""
  ],
  8: [
    "You Only Move Twice",
    "The Homer They Fall",
    "Burns, Baby Burns",
    "Bart After Dark",
    "A Milhouse Divided",
    "Lisa's Date With Density",
    "Hurricane Neddy",
    "El Viaje Misterioso De Nuestro Jomer (The Mysterious Voyage Of Our Homer)",
    "The Springfield Files",
    "The Twisted World Of Marge Simpson",
    "Mountain Of Madness",
    "Homer's Phobia",
    "Homer's Enemy",
    "Brother From Another Series",
    "Homer Vs The 18th Amendment",
    "The Canine Mutiny",
    "In Marge We Trust",
    "The Secret War Of Lisa Simpson"
  ],
  9: [
    "The City Of New York Vs Homer Simpson",
    "The Cartridge Family",
    "Bart Star",
    "The Joy Of Sect",
    "Das Bus",
    "The Last Temptation Of Krust",
    "Dumbbell Indemnity",
    "Simpson Tide",
    "The Trouble With Trillions",
    "Girly Edition",
    "Trash Of The Titans",
    "King Of The Hill",
    "Natural Born Kissers"
  ],
  10: [
    "Mayored To The Mob",
    "Lard Of The Dance",
    "Lisa Gets An \"A\"",
    "Viva Ned Flanders",
    "Wild Barts Can't Be Broken",
    "Homer To The Max",
    "Mom And Pop Art"
  ],
  11: [
    "Guess Who's Coming To Criticize Dinner?",
    "The Mansion Family",
    "Missionary: Impossible",
    "Little Big Mom",
    "Behind The Laughter"
  ],
  12: [
    "Trilogy Of Error",
    "Homer Vs Dignity",
    "Day Of The Jackanapes",
    "HOMR",
    "Hungry, Hungry Homer"
  ],
  13: [
    "Weekend At Burnsie's"
  ],
  14: [
    "I'm Spelling As Fast As I Can"
  ]
};

function normalizeTitle(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/я/g, 'r')
    .replace(/&/g, ' and ')
    .replace(/\$/g, 's')
    .replace(/grandpa/g, 'grampa')
    .replace(/ba+dass+s+/g, 'badass')
    .replace(/\bpt\.?\s*1\b|\(1\)|\bpart\s*1\b|\bpart\s*i\b/g, 'part 1')
    .replace(/\bpt\.?\s*2\b|\(2\)|\bpart\s*2\b|\bpart\s*ii\b/g, 'part 2')
    .replace(/deliah/g, 'delilah')
    .replace(/boy-?scoutz?\s*['’]?n\s*(the|tha)\s*hood/g, 'boyscouts in the hood')
    .replace(/boy\s*scoutz?\s*in\s*tha\s*hood/g, 'boyscouts in the hood')
    .replace(/homediddily/g, 'home diddily')
    .replace(/4\s*ft\.?\s*2/g, '4 2')
    .replace(/4['’]2/g, '4 2')
    .replace(/['’".,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchCinemetaMetadata(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function buildDataset() {
  console.log('Fetching Cinemeta metadata for The Simpsons (tt0096697)...');
  const url = 'https://v3-cinemeta.strem.io/meta/series/tt0096697.json';
  
  let cinemetaData;
  try {
    cinemetaData = await fetchCinemetaMetadata(url);
  } catch (err) {
    console.error('Failed to fetch from Cinemeta:', err.message);
    process.exit(1);
  }

  const allVideos = cinemetaData?.meta?.videos || [];
  console.log(`Received ${allVideos.length} total video entries from Cinemeta.`);

  const matchedVideos = [];
  const unmatchedTitles = [];
  let totalRequested = 0;

  for (const [seasonStr, episodeTitles] of Object.entries(ESSENTIAL_EPISODES_BY_SEASON)) {
    const seasonNum = parseInt(seasonStr, 10);
    const seasonVideos = allVideos.filter(v => v.season === seasonNum);

    for (const title of episodeTitles) {
      totalRequested++;
      const normRequested = normalizeTitle(title);

      // 1. Try matching within the listed season
      let match = seasonVideos.find(v => {
        const normCinemeta = normalizeTitle(v.name || v.title);
        return normCinemeta === normRequested ||
               normCinemeta.replace(/\s+/g, '') === normRequested.replace(/\s+/g, '') ||
               normCinemeta.includes(normRequested) ||
               normRequested.includes(normCinemeta);
      });

      // 2. If not found, search across all seasons in case of season grouping offset
      if (!match) {
        match = allVideos.find(v => {
          const normCinemeta = normalizeTitle(v.name || v.title);
          return normCinemeta === normRequested ||
                 normCinemeta.replace(/\s+/g, '') === normRequested.replace(/\s+/g, '');
        });
      }

      if (match) {
        matchedVideos.push({
          id: match.id,
          name: match.name || match.title,
          title: match.name || match.title,
          season: match.season,
          episode: match.episode || match.number,
          number: match.number || match.episode,
          firstAired: match.firstAired,
          released: match.released || match.firstAired,
          thumbnail: match.thumbnail,
          overview: match.overview || match.description || '',
          description: match.description || match.overview || '',
          rating: match.rating || '0',
          tvdb_id: match.tvdb_id
        });
        console.log(`[OK] Season ${seasonNum}: "${title}" -> "${match.name}" (S${match.season}E${match.episode}, ID: ${match.id})`);
      } else {
        unmatchedTitles.push({ season: seasonNum, title });
        console.error(`[FAIL] No match found for Season ${seasonNum}: "${title}"`);
      }
    }
  }

  // Deduplicate matched videos in case of any duplicate requests
  const uniqueVideos = [];
  const seenIds = new Set();
  for (const v of matchedVideos) {
    if (!seenIds.has(v.id)) {
      seenIds.add(v.id);
      uniqueVideos.push(v);
    }
  }

  // Sort matched videos chronologically by season then episode
  uniqueVideos.sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    return a.episode - b.episode;
  });

  const outputPath = path.join(__dirname, 'dataset.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueVideos, null, 2), 'utf-8');

  console.log('\n--- Dataset Compilation Summary ---');
  console.log(`Total episodes requested: ${totalRequested}`);
  console.log(`Successfully matched: ${uniqueVideos.length}`);
  console.log(`Unmatched count: ${unmatchedTitles.length}`);

  if (unmatchedTitles.length > 0) {
    console.warn('\nUnmatched titles list for manual review:');
    unmatchedTitles.forEach(u => console.warn(`- Season ${u.season}: "${u.title}"`));
  } else {
    console.log('\nAll curated episodes successfully matched with 100% accuracy!');
  }
  console.log(`Dataset written to: ${outputPath}`);
}

buildDataset();
