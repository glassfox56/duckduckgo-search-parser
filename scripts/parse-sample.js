const fs = require('fs');
const path = require('path');
const { parseDuckDuckGoHTML } = require('../src/duckduckgoParser');

const samplePath = process.argv[2];
if (!samplePath) {
  console.error('Usage: node scripts/parse-sample.js <path-to-html>');
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), samplePath);
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const html = fs.readFileSync(filePath, 'utf8');
const results = parseDuckDuckGoHTML(html);
console.log(JSON.stringify(results, null, 2));
