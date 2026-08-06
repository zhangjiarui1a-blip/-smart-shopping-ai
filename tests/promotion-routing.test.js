const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const pages = ['subsidy.html', 'specials.html', 'flash-sale.html', 'summer-new.html'];

pages.forEach((page) => {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.match(html, /href="index\.html"/, `${page} must provide a home link`);
});

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
pages.forEach((page) => assert.match(index, new RegExp('href="' + page + '"')));

const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
assert.match(app, /\['subsidy\.html', 'specials\.html', 'flash-sale\.html', 'summer-new\.html'\]/);

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'commerce-data.js'), 'utf8'), sandbox);
const categories = new Set(sandbox.window.commerceProducts.map((product) => product.category));
['digital', 'food', 'fashion', 'appliance', 'collectibles', 'home', 'baby', 'pet', 'sports'].forEach((category) => {
  assert(categories.has(category), `missing products for ${category}`);
});

const channel = fs.readFileSync(path.join(root, 'channel.js'), 'utf8');
assert.match(channel, /product\.category === key/);
assert.doesNotMatch(channel, /commerceProducts \|\| \[\]\)\.slice\(0, 4\)/);

console.log('promotion routing and channel product filtering tests passed');
