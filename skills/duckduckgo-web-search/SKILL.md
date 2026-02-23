---
name: duckduckgo-web-search
description: "Provide a DuckDuckGo HTML-backed `web_search` provider when Brave/Perplexity is not available or when DuckDuckGo-specific snippets (zero-click, related answers) are desired. Use this skill when configuring Gateway search providers or when a custom skill/plugin needs a deterministic DuckDuckGo fetch/parser pipeline."
---

# DuckDuckGo Web Search Wrapper

## Overview
- The skill bundles the `fetchDuckDuckGo(query)` helper inside `skills/duckduckgo-web-search/scripts/provider.js` along with the wrapper CLI entrypoint.
- It is intended for Gateway integrators who want to register a `web_search` provider that uses DuckDuckGo's `/html/` endpoint and the shared parser (`src/duckduckgoParser.js`) instead of linking to Brave/Perplexity APIs.
- Use it when a custom provider is the easiest way to expose DuckDuckGo results to agents that invoke the standard `web_search` tool.

## How to run the helper manually
1. Run `pnpm run duckduckgo-search -- "OpenClaw" --region=US` to quickly inspect DuckDuckGo output (zero-click, ads, news results, etc.).
2. The helper accepts `--region=<code>` to change DuckDuckGo's `kl` parameter when region-specific relevance is needed.
3. The CLI ultimately calls `provider.run(args)` from the skill script so you can also `require` that module from the Gateway directly.

## Integrating with Gateway `web_search`
1. Require the skill provider as a Node module:
   ```js
   const { fetchDuckDuckGo } = require('@app/skills/duckduckgo-web-search/scripts/provider');
   ```
2. Wrap it in a `tools.web.search` provider implementation (see `docs/integration.md` for a working stub).
3. Return results with `title`, `url`, `snippet`, and optionally `date`; the parser already marks ads and zero-click data.
4. Register the provider under `tools.web.search.providers.duckduckgo-html` (or a name of your choice), then set `tools.web.search.provider` to that key.

## Code structure
- `fetchDuckDuckGo(query, opts)` fetches `/html/` (with `--region`/`kl`) and returns `{ query, region, timestamp, results }` from the shared parser.
- `run(argv)` parses CLI arguments, calls `fetchDuckDuckGo`, and returns the payload—this is the function the Gateway provider should call.
- The CLI wrapper at `duckduckgo-task-docs/scripts/duckduckgo-web-search.js` simply loads this module and formats the JSON output.

## Resources
- `scripts/provider.js` (primary helper used inside Gateway or for manual inspection).
- `docs/integration.md` demonstrates how to wrap `fetchDuckDuckGo` in a `web_search` provider, including caching notes.
