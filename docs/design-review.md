# DuckDuckGo Search Parser — Design Review

## Objective
This review documents the architectural choices, validation criteria, and remaining considerations for the DuckDuckGo search parser and its integration into the Gateway `web_search` tool. The goal is to ensure that reviewers understand how we convert raw DuckDuckGo HTML into structured results, maintain stability through caching/fallbacks, and expose the functionality through a skill/provider wrapper.

## High-Level Architecture
1. **HTML ingestion and parsing** – `samples/` contains representative DuckDuckGo `/html/` snapshots. `src/duckduckgoParser.js` loads HTML via Cheerio, extracts zero-click content, web results, ads, display URLs, and optional dates. Parsers normalize text, handle incomplete metadata, and flag `isAd` when DuckDuckGo marks promotional results.
2. **Provider & CLI** – `scripts/duckduckgo-web-search.js` and the skill wrapper (`skills/duckduckgo-web-search/scripts/provider.js`) encapsulate the fetch/parse workflow. They accept `query`/`region` inputs, retrieve DuckDuckGo’s `/html/` endpoint, and forward parsed entries as JSON resembling standard `web_search` output.
3. **Caching layer** – `src/cache.js` implements a TTL-bound map (5 minutes default, 200 entries) configurable via `DDG_CACHE_TTL_MIN` and `DDG_CACHE_MAX_ENTRIES`. The wrapper reuses cached payloads to reduce rate pressure on DuckDuckGo.
4. **Skill packaging** – the skill provides `fetchDuckDuckGo(query)` and `run(argv)` to integrate with Gateway providers. `skills/duckduckgo-web-search/SKILL.md` and `docs/integration.md` describe how to register the provider and wrap it inside `tools.web.search`.

## Key Design Decisions
- **Cheerio-based parsing instead of headless browsing**: avoids JavaScript execution, keeps dependencies lightweight, and allows us to reason deterministically about selectors (documented in `docs/selectors.md`).
- **Custom HTML snapshots**: captured samples across result types (standard, news, images, videos, Naandalist page) serve as fixtures/test inputs to validate parser robustness without hitting live DuckDuckGo repeatedly.
- **Cache-first provider**: the wrapper consults `Cache` before firing HTTP requests to DuckDuckGo, thereby reducing repeated hits for identical queries and controlling rate-limiting exposure.
- **Skill + CLI exposure**: packaging as a skill plus maintaining a CLI script ensures both Gateway-native integration and manual debugging capability via `pnpm run duckduckgo-search` or `pnpm run parse`.

## Evaluation Criteria
1. **Parsing accuracy** – `pnpm test` should pass (zero-click detection, snippet presence, date extraction). Reviewers should inspect `docs/selectors.md` for selector mappings and verify that new DuckDuckGo variants still match them.
2. **Provider readiness** – Running `pnpm run duckduckgo-search -- "query" --region=XX` should produce JSON identical in shape to other `web_search` providers. Confirm the payload includes the expected keys (`title`, `url`, `snippet`, `source`, `date`, `isAd`).
3. **Cache behavior** – Set `DDG_CACHE_TTL_MIN=0`/`DDG_CACHE_MAX_ENTRIES=1` to simulate misses and hits, verifying the provider short-circuits correctly and respects TTL.
4. **Documentation clarity** – README, `docs/integration.md`, and the new `docs/design-review.md` should collectively explain the workflow, configuration knobs, and reviewer touchpoints.
5. **Security hygiene** – All scripts operate without exposing credentials; dotenv variables control only cache parameters to avoid leaking tokens.

## Risks and Mitigation Strategies
- **HTML structure changes**: DuckDuckGo may modify selectors. Mitigation: keep `docs/selectors.md` updated, rely on Cheerio with conservative selectors (e.g., `.results div.result.results_links`), and fallback to `DDG.duckbar.add` JSON if necessary.
- **Rate limiting/IP blocking**: repeated requests risk bans. Mitigation: `Cache` layer + realistic `User-Agent`. Future work could add per-region quotas or rotating proxies if traffic increases.
- **Zero-click variability**: Instant answers may not always exist. Parser gracefully skips the zero-click block and still returns web results; tests verify presence only when available.

## Review Checklist
- [ ] `pnpm install && pnpm test` (validate parsing heuristics). 
- [ ] `pnpm run duckduckgo-search -- "OpenClaw" --region=US` (confirm provider output). 
- [ ] Inspect `skills/duckduckgo-web-search` to ensure the skill exports `fetchDuckDuckGo`/`run` with caching logic. 
- [ ] Review `docs/integration.md` and `docs/design-review.md` for completeness and alignment with implementation. 
- [ ] Validate that README still points to the correct repository name (`duckduckgo-search-parser`).

## Next Steps
1. Schedule a brief review session to walk through the parser/skill stack and answer any questions. 
2. After approval, propagate the provider to Gateway config (`tools.web.search.providers.duckduckgo-html`) and monitor runtime logs for any parse failures. 
3. Keep the sample corpus current by adding future DuckDuckGo variants (e.g., videos, recipes) and documenting selector changes in `docs/selectors.md`.
