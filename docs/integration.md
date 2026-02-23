# DuckDuckGo Provider Integration

This document shows how the parser can be wired into the Gateway's `web_search` tool so DuckDuckGo HTML results are exposed as structured `web_search` output.

## 1. Run the provider script

- `scripts/duckduckgo-web-search.js` (exposed by the `duckduckgo-search` script entry) takes a query, fetches the DuckDuckGo `/html/` results page, and runs `parseDuckDuckGoHTML` over it.
- It emits a JSON payload with `{ query, timestamp, results: [ ... ] }`, where each `result` already contains `title`, `url`, `displayUrl`, `snippet`, `date`, `isAd`, and `source`.
- Example:

  ```bash
  pnpm run duckduckgo-search -- "what is OpenClaw"
  ```

  The output mirrors what `web_search` normally returns, only the data now comes from DuckDuckGo’s HTML.

## 2. Hook into `web_search`

Because Gateway tools are pluggable, you can wrap `fetchDuckDuckGo` inside your `web_search` provider implementation:

```js
const { fetchDuckDuckGo } = require("../duckduckgo-task-docs/scripts/duckduckgo-web-search");

async function duckDuckGoProvider({ query, count }) {
  const { results } = await fetchDuckDuckGo(query);
  return {
    tool: "web_search",
    provider: "duckduckgo-html",
    results: results.slice(0, count || results.length).map((entry) => ({
      title: entry.title,
      url: entry.url,
      snippet: entry.snippet,
      source: entry.displayUrl || entry.source,
      date: entry.date || null,
    })),
  };
}
```

Plug this module into the Gateway the same way you would a custom provider (for example, register it behind `tools.web.search.providers.duckduckgo-html`). If you expose it via a skill or plugin, make sure to keep the `results` schema consistent with `web_search`, as the UI expects `title`, `url`, and `snippet`.

## 3. Caching & rate limits

- `web_search` normally caches responses for a few minutes. You can layer the same caching logic around the `fetchDuckDuckGo` helper by storing the latest HTML per query (e.g., in-memory map keyed by `${query}|${region}` and timestamp).
- DuckDuckGo HTML is lightweight, so you can keep a small LRU cache in the provider module and return cached results while the cache TTL is fresh.
- Always send a realistic `User-Agent` and respect `robots` headers if you switch to a more aggressive fetch (more advanced rate limiting or rotating IPs may be necessary if you scale beyond casual use).

## 4. Packaging the wrapper as a skill

- `/skills/duckduckgo-web-search` contains the frontend that Gateway integrators can import directly (look at `SKILL.md` for instructions and `scripts/provider.js` for the helper).
- The skill exposes `fetchDuckDuckGo(query)` plus a CLI via `run(argv)` so the provider logic can be invoked from any custom module or skill/plugin entrypoint.
- When packaging or distributing the skill, include the script, README instructions, and the integration doc so other agents know how to register the `duckduckgo-html` provider.

## 5. Future proofing

- The parser documents known selectors in `docs/selectors.md`. If DuckDuckGo updates its HTML, the provider only needs to refresh that doc and adjust `src/duckduckgoParser.js` accordingly.
- When the Gateway eventually needs instant answer blocks or tabs (News/Images), extend `fetchDuckDuckGo` to request `https://duckduckgo.com/html/?q=...&ia=web` or other endpoints and adapt the parser accordingly.
