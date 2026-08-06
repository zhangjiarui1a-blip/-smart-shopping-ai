const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

['subsidy.html', 'specials.html', 'flash-sale.html', 'summer-new.html', 'space.html'].forEach((file) => assert(fs.existsSync(path.join(root, file))));
assert.match(read('channel.html'), /id="channelSort"/);
assert.match(read('channel-commerce.css'), /grid-template-columns:repeat\(3/);
assert.match(read('channel-commerce.css'), /grid-template-columns:repeat\(2/);
assert.match(read('promotion.js'), /补贴后/);
assert.match(read('promotion.js'), /降幅/);
assert.match(read('promotion.js'), /距本场结束/);
assert.match(read('promotion.js'), /夏日上新/);
assert.match(read('index.html'), /space\.html\?scene=photography/);
assert.match(read('index.html'), /space\.html\?scene=student/);
assert.match(read('index.html'), /space\.html\?scene=smart-home/);
assert.match(read('search-suggestions.js'), /相关分类/);
assert.match(read('search-suggestions.js'), /热门需求/);

const sandbox = { window: {} };
vm.runInNewContext(read('commerce-data.js'), sandbox);
const products = sandbox.window.commerceProducts;
['digital', 'fashion', 'food', 'makeup', 'accessory', 'collectibles', 'appliance', 'home', 'baby', 'sports', 'gift'].forEach((category) => assert(products.some((item) => item.category === category), category));
console.log('V0.7 shopping experience tests passed');
