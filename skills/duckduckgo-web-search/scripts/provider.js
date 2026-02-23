const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const rootNodeModules = path.join(repoRoot, 'node_modules');

module.paths.unshift(rootNodeModules);

const { fetch } = require('undici');
const { parseDuckDuckGoHTML } = require(path.join(repoRoot, 'src', 'duckduckgoParser'));
const { Cache } = require(path.join(repoRoot, 'src', 'cache'));

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const cacheTtlMinutes = Math.max(1, Number(process.env.DDG_CACHE_TTL_MIN) || 5);
const cacheMaxEntries = Math.max(1, Number(process.env.DDG_CACHE_MAX_ENTRIES) || 200);
const cache = new Cache({ ttlMs: cacheTtlMinutes * 60 * 1000, maxEntries: cacheMaxEntries });

async function fetchDuckDuckGo(query, opts = {}) {
  const url = new URL('https://duckduckgo.com/html/');
  url.searchParams.set('q', query);
  if (opts.region) {
    url.searchParams.set('kl', opts.region);
  }
  if (opts.language) {
    url.searchParams.set('ia', 'web');
  }
  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }

  const html = await response.text();
  const entries = parseDuckDuckGoHTML(html);
  return {
    query,
    region: opts.region || 'default',
    timestamp: new Date().toISOString(),
    results: entries,
  };
}

function parseCLIArgs(rawArgs) {
  const args = [];
  const opts = { region: null };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === '--') {
      continue;
    }
    if (arg.startsWith('--region=')) {
      opts.region = arg.split('=')[1];
      continue;
    }
    if (arg === '--region') {
      opts.region = rawArgs[++index];
      continue;
    }
    args.push(arg);
  }

  const query = args.join(' ').trim();
  if (!query) {
    throw new Error('Usage: runProvider("your query" [--region=<code>])');
  }

  return { query, opts };
}

async function run(rawArgs) {
  const { query, opts } = parseCLIArgs(rawArgs);
  const cacheKey = `${query}|${opts.region || 'default'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const payload = await fetchDuckDuckGo(query, opts);
  cache.set(cacheKey, payload);
  return payload;
}

if (require.main === module) {
  run(process.argv.slice(2))
    .then((payload) => {
      console.log(JSON.stringify(payload, null, 2));
    })
    .catch((err) => {
      console.error('DuckDuckGo search failed:', err);
      process.exit(1);
    });
}

module.exports = { fetchDuckDuckGo, run };
