const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const { parseDuckDuckGoHTML } = require(path.join(__dirname, '..', 'src', 'duckduckgoParser.js'));

const DDG_BASE = 'https://duckduckgo.com/html/';
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0';

let cache = new Map();
const DDG_CACHE_TTL_MIN = process.env.DDG_CACHE_TTL_MIN || 5;
const DDG_CACHE_MAX_ENTRIES = process.env.DDG_CACHE_MAX_ENTRIES || 200;

/**
 * Map region codes to DuckDuckGo kl parameter
 */
const REGION_MAP = {
  US: 'us-en',
  GB: 'uk-en',
  DE: 'de-de',
  FR: 'fr-fr',
  JP: 'jp-ja',
  AU: 'au-en',
  ID: 'id-id',
  SG: 'sg-en',
  // Add more as needed
};

/**
 * Fetch and parse DuckDuckGo HTML results
 */
async function fetchDuckDuckGo(query, region = 'US') {
  const cacheKey = `${query}|${region}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < DDG_CACHE_TTL_MIN * 60 * 1000) {
    return cached.results;
  }

  try {
    const kl = REGION_MAP[region] || 'us-en';
    const url = `${DDG_BASE}?q=${encodeURIComponent(query)}&kl=${kl}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!response.ok) {
      throw new Error(`DuckDuckGo returned ${response.status}`);
    }
    
    const html = await response.text();
    const results = parseDuckDuckGoHTML(html);
    
    // Manage cache size
    if (cache.size >= DDG_CACHE_MAX_ENTRIES) {
      const oldest = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      cache.delete(oldest[0]);
    }
    
    cache.set(cacheKey, {
      timestamp: Date.now(),
      results: results
    });
    
    return results;
  } catch (err) {
    console.error(`[duckduckgo] Error fetching results for "${query}":`, err.message);
    return [];
  }
}

/**
 * Provider interface for web_search tool
 */
async function run(argv) {
  const args = {
    query: '',
    region: 'US'
  };
  
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--region' && argv[i + 1]) {
      args.region = argv[i + 1];
      i++;
    } else if (!argv[i].startsWith('--')) {
      args.query = argv[i];
    }
  }
  
  if (!args.query) {
    throw new Error('Query required');
  }
  
  const results = await fetchDuckDuckGo(args.query, args.region);
  
  return {
    query: args.query,
    region: args.region,
    timestamp: new Date().toISOString(),
    results: results
  };
}

module.exports = { fetchDuckDuckGo, run };

if (require.main === module) {
  run(process.argv.slice(2))
    .then(payload => {
      console.log(JSON.stringify(payload, null, 2));
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
