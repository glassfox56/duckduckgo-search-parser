const cheerio = require('cheerio');

function normalizeText(el) {
  if (!el || !el.length) {
    return null;
  }
  return el
    .text()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseZeroClick($) {
  const heading = $('div.zci h1.zci__heading a').first();
  const resultNode = $('div.zci__result');
  if (!heading.length || !resultNode.length) {
    return null;
  }

  const title = normalizeText(heading);
  const link = heading.attr('href') || null;
  const snippet = normalizeText(resultNode);
  const image = resultNode.find('img').first().attr('src') || null;
  const sourceLink = normalizeText(resultNode.find('a').last());

  return {
    type: 'zero-click',
    title,
    url: link,
    snippet,
    image,
    source: sourceLink,
  };
}

function extractDateFromExtras(extras, $) {
  const dateText = extras
    .find('span')
    .map((i, el) => normalizeText($(el)))
    .get()
    .filter(Boolean)
    .find((txt) => /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(txt));

  if (!dateText) {
    return null;
  }

  return dateText.replace(/[^0-9T:\-\.Z]/g, '');
}

function parseSearchResults(html) {
  const $ = cheerio.load(html);
  const results = [];

  const zeroClick = parseZeroClick($);
  if (zeroClick) {
    results.push(zeroClick);
  }

  $('div.serp__results div.results div.result.results_links').each((idx, node) => {
    const container = $(node);
    const body = container.find('div.links_main');
    const titleEl = body.find('h2.result__title > a.result__a').first();
    if (!titleEl.length) {
      return;
    }

    const snippetEl = body.find('a.result__snippet').first();
    const extras = body.find('div.result__extras__url').first();
    const urlEl = extras.find('a.result__url').first();
    const date = extras.length ? extractDateFromExtras(extras, $) : null;

    const result = {
      type: container.hasClass('result--ad') ? 'ad' : 'web',
      title: normalizeText(titleEl),
      url: titleEl.attr('href') || null,
      displayUrl: normalizeText(urlEl) || null,
      snippet: normalizeText(snippetEl) || null,
      date,
      isAd: container.hasClass('result--ad'),
      source: extras.length ? normalizeText(extras.find('a.result__url')) : null,
    };

    if (result.title) {
      results.push(result);
    }
  });

  return results;
}

module.exports = {
  parseDuckDuckGoHTML: parseSearchResults,
};
