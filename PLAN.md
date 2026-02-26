# DuckDuckGo Web Search Integration Plan - REVISED

**Created**: 2026-02-25 22:50 UTC  
**Updated**: 2026-02-26 03:45 UTC (Phase 2A Failed → Revised to CLI-only)  
**Requested by**: Mas Nanda  
**Status**: Phase 1 Complete, Phase 2 REVISED (CLI-only approach)

## Objective

Provide **DuckDuckGo HTML parser as a CLI tool** (no Gateway integration) for free, API-key-free web searches.

**Rationale:**
- No API key required (free)
- Rich zero-click answers
- Built-in caching
- Region-aware results
- **Safe**: CLI-only, no Gateway patching required
- **Sustainable**: Can coexist with OpenClaw's built-in `web_search` tool

## What Changed

**Original Plan (Phase 2A)**: Integrate with OpenClaw Gateway's `web_search` tool
- ❌ Gateway config schema doesn't support tool provider overrides
- ❌ `web_search` tool is hardcoded, not pluggable
- ❌ Would require patching Gateway internals (unsafe)

**Revised Plan**: Keep DuckDuckGo as standalone CLI tool
- ✅ Safe: No Gateway modifications
- ✅ Simple: Just shell invocation
- ✅ Flexible: Agents can call whenever needed
- ✅ Independent: Doesn't conflict with built-in tools

---

## Phase 1: Foundation ✅ (DONE)

### Deliverables Completed
- [x] Skill installed: `/skills/duckduckgo-web-search`
- [x] Dependencies: `pnpm install` passed
- [x] Parser tests: 2/2 passing ✅
- [x] Live search: Working (tested "OpenClaw", "Glass Fox")
- [x] Provider module: `scripts/provider.js` created
- [x] Documentation: `SKILL.md` written (updated for CLI-only)

### Artifacts
```
skills/duckduckgo-web-search/
├── SKILL.md                    # Updated (CLI-only approach)
├── scripts/provider.js         # Core HTTP client + parser + cache
├── src/duckduckgoParser.js     # Parser
├── samples/                    # HTML fixtures for testing
├── test/duckduckgoParser.test.js  # Unit tests
└── README.md                   # Original repo docs
```

---

## Phase 2: Finalization (REVISED)

### 2A: Documentation ✅
- [x] Update SKILL.md for CLI-only usage
- [x] Remove Gateway integration references
- [x] Add simple CLI examples
- [x] Update implementation status

### 2B: Testing (Quick)
- [ ] Manual CLI test: `node scripts/provider.js "Glass Fox" --region US`
- [ ] Verify output format matches spec
- [ ] Test caching (second query should be instant)
- [ ] Test region support (ID, SG, etc.)

### 2C: Documentation (Final)
- [ ] Update PLAN.md (this file) ✅
- [ ] Commit & push
- [ ] Archive integration attempts in memory

---

## How to Use (For Mas Nanda)

### Simple CLI Usage
```bash
cd /root/.openclaw/workspace/skills/duckduckgo-web-search

# Search
node scripts/provider.js "What is Glass Fox?"

# Search in Indonesia
node scripts/provider.js "Berita teknologi terbaru" --region ID

# Parse output with jq
node scripts/provider.js "OpenClaw" | jq '.results | length'
```

### For Agents
If an agent needs to search:
```javascript
// In agent code
const result = require('child_process').execSync(
  'node /path/to/scripts/provider.js "query" --region US',
  { encoding: 'utf8' }
);
const data = JSON.parse(result);
```

---

## Success Criteria

| Criterion | Status |
|-----------|--------|
| Skill installed & working | ✅ Yes |
| CLI invocation works | ⏳ Testing |
| Documentation updated | ✅ Yes |
| No Gateway patching | ✅ Yes |
| Safe & sustainable | ✅ Yes |

---

## Timeline

| Phase | Task | Timeline | Owner |
|-------|------|----------|-------|
| 1 | Foundation (skill setup) | ✅ Done | Fox |
| 2A | Doc update (CLI-only) | ✅ Done | Fox |
| 2B | Manual testing | 15 min | Fox |
| 2C | Final commit & push | 5 min | Fox |

---

## Lessons Learned

1. **OpenClaw tool system is not pluggable** - Tools are hardcoded in Gateway, not configurable
2. **Better to extend via CLI** - Safer, simpler, no internals to patch
3. **Skill repo can be standalone** - Doesn't need tight integration with Gateway

---

## Notes

- **Phase 2A failure**: Tried to override Gateway's tool system → doesn't exist
- **Better approach**: Keep skill as CLI tool, agents invoke when needed
- **No loss of functionality**: Still get same results, just CLI-invoked instead of tool-invoked
- **Future**: Could wrap in a shell script for easier invocation (`ddg-search "query"`)

---

**Status**: Revised plan ready. Proceeding with Phase 2B (testing) & 2C (final commit).  
**Next step**: Quick manual test, then commit changes.
