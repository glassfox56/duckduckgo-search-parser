#!/usr/bin/env node
/**
 * OpenClaw web_search provider wrapper for DuckDuckGo
 * This bridges the duckduckgo-search-parser to the web_search tool
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let cache = new Map();
const CACHE_TTL_MIN = 5;
const CACHE_MAX_ENTRIES = 200;

/**
 * Fetch DuckDuckGo search results via HTML parser
 */
async function fetchDuckDuckGo(query, region = 'US') {
  const cacheKey = `${query}|${region}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MIN * 60 * 1000) {
    console.error(`[duckduckgo-provider] Cache hit: ${cacheKey}`);
    return cached.results;
  }

  try {
    const { execSync } = require('child_process');
    const cmd = `cd "${__dirname}" && pnpm run duckduckgo-search -- "${query}" --region=${region} 2>/dev/null`;
    const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const payload = JSON.parse(output);
    
    // Clean up old cache entries if needed
    if (cache.size >= CACHE_MAX_ENTRIES) {
      const oldest = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      cache.delete(oldest[0]);
    }
    
    cache.set(cacheKey, {
      timestamp: Date.now(),
      results: payload.results
    });
    
    console.error(`[duckduckgo-provider] Fetched ${payload.results.length} results for "${query}"`);
    return payload.results;
  } catch (err) {
    console.error(`[duckduckgo-provider] Error fetching DuckDuckGo results:`, err.message);
    throw err;
  }
}

/**
 * Convert DuckDuckGo results to web_search tool format
 */
function convertToWebSearchFormat(results) {
  return results.map(result => ({
    title: result.title,
    url: result.url || result.displayUrl,
    snippet: result.snippet,
    source: result.source || result.displayUrl || 'DuckDuckGo',
    date: result.date || null,
    type: result.type || 'web'
  }));
}

/**
 * Main provider function (called by web_search tool)
 */
export async function searchDuckDuckGo(query, opts = {}) {
  const region = opts.region || opts.country || 'US';
  try {
    const results = await fetchDuckDuckGo(query, region);
    return {
      query,
      region,
      timestamp: new Date().toISOString(),
      results: convertToWebSearchFormat(results),
      count: results.length
    };
  } catch (err) {
    console.error(`[duckduckgo-provider] Failed to search:`, err.message);
    return {
      query,
      region,
      timestamp: new Date().toISOString(),
      results: [],
      error: err.message,
      count: 0
    };
  }
}

// CLI usage
if (process.argv[1] === __filename) {
  const query = process.argv[2] || 'OpenClaw';
  const region = process.argv[3] || 'US';
  
  searchDuckDuckGo(query, { region }).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}
