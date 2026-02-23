const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { parseDuckDuckGoHTML } = require('../src/duckduckgoParser');

const readSample = (fileName) =>
  fs.readFileSync(path.join(__dirname, '../samples', fileName), 'utf8');

test('parses zero-click and web results from html-openclaw.html', () => {
  const html = readSample('html-openclaw.html');
  const results = parseDuckDuckGoHTML(html);

  assert(results.length >= 10, 'Should return at least ten entries');

  const zeroClick = results.find((entry) => entry.type === 'zero-click');
  assert(zeroClick, 'Zero-click section should be present');
  assert.strictEqual(zeroClick.title, 'OpenClaw');
  assert.match(zeroClick.url, /^https:\/\/en\.wikipedia\.org\/wiki\/OpenClaw/);

  const firstWeb = results.find((entry) => entry.type === 'web' && entry.displayUrl);
  assert(firstWeb, 'Should return a web result with a displayUrl');
  assert(firstWeb.snippet && firstWeb.snippet.length > 0);
});

test('captures publication dates when available', () => {
  const html = readSample('html-OpenAI-news.html');
  const results = parseDuckDuckGoHTML(html);

  const datedResult = results.find((entry) => entry.date);
  assert(datedResult, 'At least one news result should have a date');
  assert.match(datedResult.date, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
});
