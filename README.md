# DuckDuckGo Parser Task Documentation

## Purpose
Document the strategy, progress, and next steps for the DuckDuckGo search results parser and web search integration work requested by Mas Nanda.

## Strategy
1. **Analyze DuckDuckGo HTML** – capture sample responses, identify selectors for titles, URLs, snippets, and answer boxes so the parser is resilient.
2. **Modular Parser** – implement a parser that turns raw HTML into a consistent array of `{title, url, snippet, source}` objects, with hooks for extended content later.
3. **Tool Integration** – plug the parser into the existing `web_search` tool so it can respond with structured data, include caching/fallbacks as needed.
4. **Validation & Docs** – add tests or sample fixtures and keep documentation up to date with selectors or known quirks.

## Setup
- Install dependencies via `pnpm install` (requires pnpm to be installed globally).
- If pnpm isn’t available on the system yet, `npm install -g pnpm` will add it.

## Progress
- Repository created to house documentation (this doc).
- Strategy outlined and approved in chat.
- Collected three representative DuckDuckGo HTML snapshots (standard/search results, weather question, and news query) for parser reference.
- Cataloged selectors/markup patterns in `docs/selectors.md`, based on the raw `/html/` output and zero-click section.
- Built `src/duckduckgoParser.js` plus `scripts/parse-sample.js` to turn raw HTML into structured `{title, url, snippet, source}` records (run `npm run parse` to sample with `samples/html-openclaw.html`).

## Samples
Representative HTML snapshots live under `samples/`:
- `samples/html-openclaw.html`
- `samples/html-weather-Jakarta.html`
- `samples/html-OpenAI-news.html`

## Next Steps
1. Hook parser into the `web_search` tool once outputs are consistent.
2. Add fixtures or unit tests (e.g., with `cheerio` or similar) to validate parser output against the collected sample HTML.
3. Document ongoing findings here so the task history is transparent.

## Parser Module
- `src/duckduckgoParser.js` exports `parseDuckDuckGoHTML(html)` which returns an array of zero-click / web result objects with `title`, `url`, `displayUrl`, `snippet`, `date`, `isAd`, and `source` metadata.
- CLI helper `scripts/parse-sample.js <sample-path>` lets you inspect parser output from any saved HTML snapshot; run `pnpm run parse` to exercise it against `samples/html-openclaw.html`.
- Run `pnpm test` to exercise the built-in parser smoke test that validates zero-click content plus news dates (see `test/duckduckgoParser.test.js`).
- Future work: extend parser to capture related searches, tabs (News/Images), and make snippets aversive when `result__snippet` is missing.

## DuckDuckGo Web Search Provider
- `scripts/duckduckgo-web-search.js` (run via `pnpm run duckduckgo-search -- "OpenClaw" --region=US`) calls DuckDuckGo’s `/html/` endpoint, uses the parser to extract structured results, and emits JSON that mirrors what `web_search` expects.
- You can adjust `--region=<code>` to target a specific country (mapped to DuckDuckGo’s `kl` parameter) if the Gateway needs region-specific results.
- This script shows how to integrate with the Gateway’s `web_search` tool by wrapping `fetchDuckDuckGo(query)` in a custom provider and feeding its results into the tool’s response format (see `docs/integration.md` for a sketch of an integration hook).

## Board
The detailed to-do list lives in [docs/board.md](docs/board.md), arranged like a simple Kanban board for tracking progress.

## Contact
Ping Mas Nanda (Boss) in Telegram if updates or reviews are needed.
