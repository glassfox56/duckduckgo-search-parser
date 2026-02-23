const { fetch } = require('undici');
const { parseDuckDuckGoHTML } = require('../src/duckduckgoParser');

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

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

if (require.main === module) {
  const rawArgs = process.argv.slice(2);
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
    console.error('Usage: pnpm run duckduckgo-search -- "your query" [--region=<code>]');
    process.exit(1);
  }

  fetchDuckDuckGo(query, opts)
    .then((payload) => {
      console.log(JSON.stringify(payload, null, 2));
    })
    .catch((err) => {
      console.error('DuckDuckGo search failed:', err);
      process.exit(1);
    });
}

module.exports = { fetchDuckDuckGo };
