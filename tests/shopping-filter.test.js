const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const window = {};
const context = { window, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'shopping-filter-service.js'), 'utf8'), context);

const service = window.shoppingFilterService;

assert.equal(service.channelKey('\u7535\u8111'), 'digital', 'computer must use digital channel');
assert.equal(service.decide('\u7535\u8111', { source: 'search' }).mode, 'channel', 'simple computer search must open channel filters');
assert.equal(service.decide('5000\u5143\u6e38\u620f\u7535\u8111', { source: 'search' }).mode, 'direct', 'complete computer search must go directly to recommendations');

assert.equal(service.channelKey('\u63a8\u8350\u96f6\u98df'), 'food', 'snacks must use food channel');
assert.equal(service.decide('\u63a8\u8350\u96f6\u98df', { source: 'search' }).mode, 'channel', 'snack search must open food filters');

assert.equal(service.channelKey('\u590f\u5b63\u7a7f\u642d\u63a8\u8350'), 'fashion', 'outfit query must use fashion channel');
assert.equal(service.decide('\u590f\u5b63\u7a7f\u642d\u63a8\u8350', { source: 'ai_discovery' }).mode, 'channel', 'AI discovery must open the matching channel');

const discovery = service.decide('5000\u5143\u9884\u7b97\uff0c\u6e38\u620f\u7535\u8111', { source: 'ai_discovery' });
const auto = service.autoSelections(discovery.query, service.channels[discovery.channel]);
assert.equal(discovery.channel, 'digital', 'computer discovery must open digital channel');
assert.equal(auto.type, '\u7535\u8111', 'discovery must prefill product type');
assert.equal(auto.usage, '\u6e38\u620f', 'discovery must prefill usage');
assert.equal(auto.budget, '3000-5000', 'discovery must prefill budget range');

assert.equal(service.decide('\u6444\u5f71\u8bbe\u5907\u8d2d\u4e70', { source: 'search' }).mode, 'clarify', 'complex photography request must retain clarification flow');
assert.equal(service.decide('\u6c7d\u8f66\u8d2d\u4e70\u5efa\u8bae', { source: 'search' }).mode, 'clarify', 'car purchase must retain clarification flow');
assert.equal(service.decide('20000\u5143\u65b0\u5bb6\u88c5\u4fee', { source: 'search' }).mode, 'clarify', 'high-value purchase must retain clarification flow');

console.log('V0.5.1 shopping filter tests passed');
