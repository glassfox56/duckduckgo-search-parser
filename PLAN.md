# DuckDuckGo Web Search Integration Plan

**Created**: 2026-02-25 22:50 UTC  
**Requested by**: Mas Nanda  
**Status**: Phase 1 Complete, Phase 2 Planning

## Objective

Replace Brave Search API (not configured) with **DuckDuckGo HTML parser** for the `web_search` tool in OpenClaw Gateway.

**Rationale:**
- No API key required (free)
- Rich zero-click answers
- Built-in caching
- Region-aware results
- Sustainable long-term

---

## Phase 1: Foundation ✅ (DONE)

### Deliverables Completed
- [x] Skill installed: `/skills/duckduckgo-web-search`
- [x] Dependencies: `pnpm install` passed
- [x] Parser tests: 2/2 passing ✅
- [x] Live search: Working (tested "OpenClaw", "Glass Fox")
- [x] Provider module: `scripts/provider.js` created
- [x] Documentation: `SKILL.md` written

### Artifacts
```
skills/duckduckgo-web-search/
├── SKILL.md                    # Skill documentation (comprehensive)
├── scripts/provider.js         # Core HTTP client + parser + cache
├── src/duckduckgoParser.js     # Parser (from main repo)
├── openclaw-provider.js        # OpenClaw wrapper (for integration)
├── samples/                    # HTML fixtures for testing
├── test/duckduckgoParser.test.js  # Unit tests
└── README.md                   # Original repo docs
```

---

## Phase 2: Gateway Integration (NEXT)

### 2A: Tool Override Implementation

**Approach**: Inject provider at Gateway startup.

**File changes needed:**
1. Create `/root/.openclaw/workspace/tools/duckduckgo-provider-hook.js`
   - Hook into Gateway's `tools.web.search` setup
   - Register `duckduckgo-html` provider
   - Handle fallback to Brave if DDG fails

2. Update `openclaw.json`:
   ```json
   {
     "tools": {
       "web": {
         "search": {
           "provider": "duckduckgo-html",
           "fallback": "brave",  // Optional: fallback strategy
           "region": "US"
         }
       }
     }
   }
   ```

3. Update agent config (if needed):
   ```json
   {
     "agents": {
       "main": {
         "toolOverrides": {
           "web_search": {
             "provider": "duckduckgo-html"
           }
         }
       }
     }
   }
   ```

### 2B: Testing Checklist

**Unit Tests:**
- [ ] Provider returns structured results
- [ ] Caching works (cache hit after second call)
- [ ] Region mapping correct (ID → id-id, etc.)
- [ ] Error handling (network timeout, no results)

**Integration Tests:**
- [ ] Agent can invoke `web_search` tool
- [ ] Results appear in Telegram replies
- [ ] Formatting correct (no JSON dumps in chat)
- [ ] Performance acceptable (<3s for first query)

**Regression Tests:**
- [ ] Other tools still work (`browser`, `web_fetch`, etc.)
- [ ] No memory leaks from caching
- [ ] Graceful fallback if DuckDuckGo down

**End-to-End (Telegram):**
```
/search Glass Fox AI
→ Tool invokes DuckDuckGo provider
→ Results returned + formatted
→ User sees: "🔍 Found X results... Wikipedia: ..., OpenClaw.ai: ..."
```

### 2C: Config Changes

**Current state:**
```json
{
  "tools": null  // No tools section yet
}
```

**After Phase 2:**
```json
{
  "tools": {
    "web": {
      "search": {
        "provider": "duckduckgo-html",
        "region": "US",
        "cacheMinutes": 5,
        "maxCacheEntries": 200
      }
    }
  }
}
```

---

## Phase 3: Optimization (FUTURE)

- [ ] Persist cache to disk (survive restarts)
- [ ] Add region selector to tool options
- [ ] Monitor DDG rate limits & rotation
- [ ] Benchmark: Brave vs DuckDuckGo latency
- [ ] Add related queries extraction
- [ ] Support image/video search tabs

---

## Risk Mitigation

### Risk: DuckDuckGo blocks scraping
**Mitigation:**
- Rotate user-agent strings
- Add backoff/retry logic
- Fallback to Brave if available
- Monitor block frequency

### Risk: Parse failures (HTML changes)
**Mitigation:**
- Keep sample HTML fixtures updated
- Run parser tests periodically
- Log unparseable results for debugging
- Maintain selector documentation

### Risk: Cache explosion
**Mitigation:**
- Cap cache size (200 entries default)
- LRU eviction when full
- Set TTL (5 min default)
- Monitor memory usage

---

## Timeline

| Phase | Task | Timeline | Owner |
|-------|------|----------|-------|
| 1 | Foundation (skill setup) | ✅ Done | Fox |
| 2A | Tool hook + config | 1-2 hours | Fox |
| 2B | Testing + debug | 1 hour | Fox |
| 2C | Telegram integration | 30 min | Fox |
| 3 | Optimization (future) | TBD | TBD |

---

## Success Criteria

- [x] Skill installed & documented
- [ ] Gateway recognizes `duckduckgo-html` provider
- [ ] Agent can query via `web_search` tool
- [ ] Results appear in Telegram (formatted nicely)
- [ ] Cache working (verified via logs)
- [ ] No regressions in other tools

---

## Questions for Mas Nanda

1. **Region preference**: Default to US, or auto-detect from locale (ID)?
2. **Fallback strategy**: If DDG fails, should we fallback to Brave or error?
3. **Cache persistence**: Keep cache in-memory, or persist to disk?
4. **Result formatting**: Simple list, or rich card with snippets?

---

## Notes

- **Best practice**: Using skill-driven architecture (vs. core patching)
- **Modularity**: Can disable DDG or swap back to Brave easily
- **Documentation**: SKILL.md serves as single source of truth
- **Testing**: All changes will be tested before commit

---

**Next step**: Phase 2A implementation (tool hook creation).  
**Approval**: Awaiting confirmation from Mas Nanda.
