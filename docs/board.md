# DuckDuckGo Parser Task Board

A lightweight Kanban-style list for tracking the work items related to the DuckDuckGo parser and `web_search` integration.

## 🧭 To Do
- [ ] Implement the parser module that normalizes raw HTML into `{title, url, snippet, source}` objects, handling missing fields gracefully.
- [ ] Add fixtures or unit tests (e.g., with `cheerio` or similar) to validate parser output against the collected sample HTML.
- [ ] Integrate the parser with the `web_search` tool so it can return structured results to users.
- [ ] Introduce caching/rate-limit safeguards and error handling for situations where DuckDuckGo blocks or fails.
- [ ] Keep documentation (README + docs/strategy.md) updated with selector decisions, parsing quirks, or new insights.
- [ ] Report parser prototype status back to Mas Nanda via Telegram for review and feedback.

## 🛠 In Progress
*(Currently nothing assigned here — move items here as work begins.)*

## ✅ Done
- [x] Collected representative DuckDuckGo HTML examples (standard queries, instant answers, and news results) — see `samples/` snapshots.
- [x] Cataloged selectors/markup metadata in `docs/selectors.md` so the parser knows which DOM nodes to target (zero-click, ads, dates, etc.).
