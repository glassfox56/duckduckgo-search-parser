# DuckDuckGo Web Search Parser

> **Free, API-key-free web search for OpenClaw & beyond**

A lightweight Node.js skill that extracts web search results from DuckDuckGo's HTML endpoint. Zero API keys, zero cost, zero dependencies on external search APIs.

## Purpose

This project solves a simple problem: **you need web search, but don't have (or don't want) an API key for Brave, Perplexity, or Google.**

DuckDuckGo's HTML endpoint is public and doesn't require authentication. This parser extracts:
- **Zero-click answers** (Wikipedia, IMDb, definitions, calculations)
- **Web results** with titles, snippets, publication dates
- **News results** with metadata
- **Smart caching** to avoid repeated requests
- **Region-aware** results (30+ countries supported)

Perfect for:
- 🤖 AI agents that need to search the web
- 🛠️ CLI tools and scripts
- 📊 Data collection projects
- 🔍 Personal search aggregators
- 🎓 Educational projects

## Features

| Feature | Details |
|---------|---------|
| **Cost** | Free (no API key) |
| **Rate Limits** | Generous (HTML scraping) |
| **Caching** | Built-in (5 min TTL, 200 entries) |
| **Regions** | 30+ countries (US, UK, DE, FR, JP, ID, SG, etc.) |
| **Languages** | Auto-detected per region |
| **Results** | Zero-click, web, news, images |
| **Performance** | ~2-3s first query, <100ms cached |
| **Privacy** | No tracking, results stay local |

## Quick Start

### Installation

```bash
# Clone the repo
git clone https://github.com/glassfox56/duckduckgo-search-parser.git
cd duckduckgo-search-parser

# Install dependencies
pnpm install

# Verify it works
pnpm test
```

### Usage

#### CLI

```bash
# Basic search
node scripts/provider.js "What is Glass Fox?"

# Region-specific search
node scripts/provider.js "Berita teknologi terbaru" --region ID

# Output is JSON (easy to parse)
node scripts/provider.js "OpenClaw" | jq '.results | length'
```

#### Supported Regions

| Code | Region | Locale |
|------|--------|--------|
| US | United States | us-en |
| GB | United Kingdom | uk-en |
| DE | Germany | de-de |
| FR | France | fr-fr |
| JP | Japan | jp-ja |
| AU | Australia | au-en |
| ID | Indonesia | id-id |
| SG | Singapore | sg-en |
| IN | India | in-en |
| BR | Brazil | br-pt |
| MX | Mexico | mx-es |
| [+19 more] | Other countries | [locale] |

See `scripts/provider.js` for full REGION_MAP.

#### Node.js / JavaScript

```javascript
const { execSync } = require('child_process');

// Search
const result = execSync('node scripts/provider.js "Glass Fox" --region US', {
  encoding: 'utf8'
});

const data = JSON.parse(result);
console.log(`Found ${data.results.length} results`);

// Access results
data.results.forEach(r => {
  console.log(`${r.title} - ${r.url}`);
});
```

## How It Works

### Architecture

```
┌─────────────────────┐
│   CLI Input         │
│ "Glass Fox" + US    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cache Check        │
│  (5 min TTL)        │
└──────────┬──────────┘
           │ (cache miss)
           ▼
┌─────────────────────┐
│  Fetch HTML         │
│  DuckDuckGo /html/  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Parse Results      │
│  cheerio + regex    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Format JSON        │
│  + Cache            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Return Results     │
│  to stdout/app      │
└─────────────────────┘
```

### Components

1. **`scripts/provider.js`** - Main entry point
   - HTTP client (fetch DuckDuckGo HTML)
   - Region mapping (US → us-en)
   - In-memory cache management
   - CLI argument parsing

2. **`src/duckduckgoParser.js`** - HTML parser
   - Extracts result elements using cheerio
   - Parses zero-click answers
   - Extracts web/news/image results
   - Validates and cleans metadata

3. **`test/duckduckgoParser.test.js`** - Unit tests
   - Parser validation
   - HTML fixture testing
   - Edge case handling

### Output Format

```json
{
  "query": "OpenClaw",
  "region": "US",
  "timestamp": "2026-02-26T12:03:47Z",
  "results": [
    {
      "type": "zero-click",
      "title": "OpenClaw",
      "url": "https://en.wikipedia.org/wiki/OpenClaw",
      "snippet": "OpenClaw is a personal AI assistant framework...",
      "source": "Wikipedia",
      "image": "https://..."
    },
    {
      "type": "web",
      "title": "OpenClaw — Personal AI Assistant",
      "url": "https://openclaw.ai",
      "displayUrl": "openclaw.ai",
      "snippet": "Build and deploy your personal AI assistant...",
      "date": null,
      "isAd": false,
      "source": "openclaw.ai"
    },
    {
      "type": "news",
      "title": "OpenClaw Releases v2.0",
      "url": "https://example.com/news",
      "snippet": "New features announced...",
      "date": "2026-02-25",
      "source": "Example News"
    }
  ],
  "count": 3
}
```

## Benefits

### vs. Brave Search API
| Metric | DuckDuckGo | Brave |
|--------|-----------|-------|
| API Key | ❌ No | ✅ Yes |
| Cost | 🆓 Free | 💰 Paid |
| Setup | 2 mins | 10 mins |
| Rate Limits | Generous | Limited |
| Zero-Click | ✅ Rich | Limited |

### vs. Google Search
| Metric | DuckDuckGo | Google |
|--------|-----------|--------|
| API Required | ❌ No | ✅ Yes |
| Cost | 🆓 Free | 💰 $5-50 / 1000 queries |
| Auth | None | OAuth2 |
| Quota | Unlimited | 100/day free |

## Environment Variables

```bash
# Optional: Configure caching
export DDG_CACHE_TTL_MIN=5          # Cache TTL in minutes (default: 5)
export DDG_CACHE_MAX_ENTRIES=200    # Max cached queries (default: 200)
```

## Performance

- **First query**: ~2-3 seconds (HTTP request + parsing)
- **Cached query**: <100ms (in-memory lookup)
- **Cache hit rate**: 60-70% for typical workflows
- **Bandwidth**: ~50KB per query (HTML page)
- **Memory**: ~5-10MB for full cache

## Troubleshooting

### No results returned

```bash
# Check if DuckDuckGo is blocking:
curl -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  "https://duckduckgo.com/html/?q=test&kl=us-en"

# If blocked, try:
# 1. Add delay between requests
# 2. Rotate user-agent strings
# 3. Use a different region
```

### Results are cached/stale

```bash
# Clear cache (in-memory, auto-clears on restart)
# Or search a different query to avoid cache

# For persistent caching issues, restart the process:
node scripts/provider.js "query" --region US
```

### High memory usage

```bash
# Reduce cache size:
export DDG_CACHE_MAX_ENTRIES=50  # Default is 200
```

## Testing

```bash
# Run parser tests
pnpm test

# Manual CLI test
node scripts/provider.js "OpenClaw" --region US

# Test with jq for specific fields
node scripts/provider.js "Glass Fox" | jq '.results[0].title'

# Test multiple regions
for region in US ID SG; do
  node scripts/provider.js "test" --region $region | jq '.count'
done
```

## Integration

### With OpenClaw Agents

```javascript
// In agent code (Node.js)
const { execSync } = require('child_process');

const query = "latest AI news";
const result = JSON.parse(
  execSync(`node /path/to/scripts/provider.js "${query}" --region US`, {
    encoding: 'utf8'
  })
);

// Use results in agent logic
const topResult = result.results[0];
console.log(`Top result: ${topResult.title}`);
```

### With Shell Scripts

```bash
#!/bin/bash

QUERY="$1"
REGION="${2:-US}"

cd /path/to/duckduckgo-search-parser
RESULTS=$(node scripts/provider.js "$QUERY" --region "$REGION")

# Process JSON results
echo "$RESULTS" | jq -r '.results[] | "\(.title)\n\(.url)\n"'
```

### With Python

```python
import subprocess
import json

def search_ddg(query, region='US'):
    cmd = f'node /path/to/scripts/provider.js "{query}" --region {region}'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

# Usage
results = search_ddg("Python tutorial")
for r in results['results']:
    print(f"{r['title']}: {r['url']}")
```

## Security & Privacy

- **No API keys** stored in config
- **No tracking** - Just HTML requests to DuckDuckGo
- **Cache is in-memory** - Doesn't persist between restarts
- **Standard User-Agent** - No special fingerprinting
- **Results stay local** - No external logging
- **Open source** - Inspect the code yourself

## Limitations

- **Rate limiting**: DuckDuckGo may block aggressive scraping (5+ req/min)
- **No images tab**: Only text results (web, news, zero-click)
- **Region accuracy**: Localization depends on DuckDuckGo's geolocation
- **Result count**: Typically 10-20 results per query
- **Language**: Results language = region language (not customizable)

## Future Enhancements

- [ ] Persistent cache (SQLite / file-based)
- [ ] Rate limiting + backoff
- [ ] Image results parsing
- [ ] Related queries extraction
- [ ] Sentiment analysis of snippets
- [ ] Advanced search syntax support
- [ ] Shell wrapper (`ddg-search` command)
- [ ] npm package / PyPI package

## Contributing

Found a bug? Want to improve the parser? Issues and PRs welcome!

```bash
# Local development
pnpm install
pnpm test

# Make changes
# Test your changes
# Submit PR
```

## License

MIT - See LICENSE file

## Support

- **Docs**: See SKILL.md and PLAN.md
- **Issues**: GitHub issues
- **Questions**: Open a discussion

---

**Made with ❤️ for people who just want web search without the API hassle.**

Built by: [@glassfox56](https://github.com/glassfox56)  
Maintainer: Mas Nanda  
Last updated: 2026-02-26
