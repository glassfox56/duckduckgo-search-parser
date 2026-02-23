const path = require('path');
const provider = require(path.join(__dirname, '..', 'skills', 'duckduckgo-web-search', 'scripts', 'provider'));

module.exports = provider;

if (require.main === module) {
  provider
    .run(process.argv.slice(2))
    .then((payload) => {
      console.log(JSON.stringify(payload, null, 2));
    })
    .catch((err) => {
      console.error('DuckDuckGo search failed:', err);
      process.exit(1);
    });
}
