const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const silentConsole = { info() {}, warn() {}, error() {}, log() {} };
const storage = new Map();
const window = {
  sessionStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  },
  RECOMMENDATIONS_API_URL: 'https://example.test/recommendations',
  PRODUCTS_API_URL: ''
};
let responsePayload = { stage: 'recommend', products: [] };
let aiRequestCount = 0;
const context = {
  window,
  console: silentConsole,
  fetch: async () => {
    aiRequestCount += 1;
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(responsePayload)
    };
  }
};

vm.createContext(context);
['clarification-service.js', 'product-database.js', 'product-service.js', 'recommendation-service.js', 'recommendation-flow.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
});

async function run() {
  const snack = await window.productService.getCandidates('\u63a8\u8350\u96f6\u98df');
  assert.ok(snack.products.length > 0, 'snack query should have products');
  assert.ok(snack.products.every(product => product.category === '\u98df\u54c1'), 'snack query must only return food products');

  const dogFood = await window.productService.getCandidates('\u63a8\u8350\u72d7\u7cae');
  assert.ok(dogFood.products.length > 0, 'dog-food query should have products');
  assert.ok(dogFood.products.every(product => product.category === '\u5ba0\u7269\u7528\u54c1'), 'dog-food query must only return pet products');

  const gifts = await window.productService.getCandidates('\u63a8\u8350\u793c\u7269');
  assert.ok(gifts.products.length > 0, 'gift query should have products');
  assert.ok(gifts.products.every(product => product.name_cn && /[\u4e00-\u9fff]/.test(product.name_cn)), 'gift products must have Chinese names');

  const computer = window.recommendationFlow.decideEntry('\u4e70\u7535\u8111');
  assert.equal(computer.state, window.recommendationFlow.STATES.CLARIFY, 'incomplete computer query must enter clarification');

  responsePayload = { fallback: true, message: 'AI\u6682\u65f6\u7e41\u5fd9', products: [] };
  const timeoutResult = await window.recommendationFlow.run({ query: '\u63a8\u8350\u96f6\u98df', answers: {} });
  assert.equal(timeoutResult.state, window.recommendationFlow.STATES.FALLBACK, 'AI timeout payload must map to FALLBACK');
  assert.ok(timeoutResult.products.length > 0, 'fallback must preserve filtered candidates');
  assert.ok(timeoutResult.products.every(product => product.category === '\u98df\u54c1'), 'fallback must preserve category safety');
  assert.equal(aiRequestCount, 1, 'one flow run must make exactly one AI request');

  responsePayload = { stage: 'recommend', products: snack.products.slice(0, 2).map(product => ({ id: product.id, name: 'AI generated English name', reason: 'matched', score: 90 })) };
  const successResult = await window.recommendationFlow.run({ query: '\u63a8\u8350\u96f6\u98df', answers: {} });
  assert.equal(successResult.state, window.recommendationFlow.STATES.SUCCESS, 'valid AI payload must map to SUCCESS');
  assert.equal(aiRequestCount, 2, 'each flow run must make only one AI request');
  assert.equal(successResult.products[0].name, snack.products[0].name, 'AI must not overwrite original product name');

  console.log('V0.3 recommendation architecture tests passed');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
