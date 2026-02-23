# DuckDuckGo Parser Strategy Log

## Sample Selectors
- Result block: `.result` (contains `.result__a` link and `.result__snippet`).
- Title/Link: `.result__a` anchor text + `href`.
- URL snippet: `.result__url` or `.result__extras__url` when available.
- Snippet: `.result__snippet` text content.
- Instant answer: `.result--answer` / `.result--entity` with additional fields (optional handling later).

## Parsing Approach
1. Query DuckDuckGo with safe user-agent headers (follow robots?).
2. Use a lightweight HTML parser (e.g., jsdom or cheerio) to load the response.
3. Iterate result nodes, building objects with structured fields.
4. Provide fallback data (e.g., when snippet missing, set empty string).
5. Normalize URLs (handle redirects) and detect ads/related results for filtering.

## Tool Integration Considerations
- The parser returns JSON that `web_search` tool can serialize as a response table/JSON.
- Consider caching results for identical queries within a short timeframe to avoid rate limits.
- Provide metadata about the retrieval (timestamp, DuckDuckGo HTML version) for debugging.
