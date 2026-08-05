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
  RECOMMENDATIONS_API_URL: 'https://example.test/recommendations'
};
let aiRequestCount = 0;
const context = {
  window,
  console: silentConsole,
  fetch: async () => {
    aiRequestCount += 1;
    throw new Error('AI must not run for an empty candidate list');
  }
};

vm.createContext(context);
['product-database.js', 'product-service.js', 'recommendation-service.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
});

async function run() {
  const snack = await window.productService.getCandidates('\u63a8\u8350\u96f6\u98df');
  assert.ok(snack.products.length > 0, 'snack query should have products');
  assert.ok(snack.products.every(product => product.category === '\u98df\u54c1'), 'snack query must only return food products');
  assert.ok(snack.products.every(product => !['\u624b\u673a', '\u7535\u8111', '\u6570\u7801', '\u5ba0\u7269\u7528\u54c1'].includes(product.category)), 'snack query must not return unrelated categories');

  const dogFood = await window.productService.getCandidates('\u63a8\u8350\u72d7\u7cae');
  assert.ok(dogFood.products.length > 0, 'dog-food query should have products');
  assert.ok(dogFood.products.every(product => product.category === '\u5ba0\u7269\u7528\u54c1'), 'dog-food query must only return pet products');

  const empty = await window.recommendationService.requestAiAnalysis({
    query: '\u4e0d\u5b58\u5728\u7684\u5546\u54c1\u7c7b\u522b',
    candidates: [],
    criteria: { category: '' },
    candidateSource: 'fallback',
    answers: {}
  });
  assert.equal(empty.source, 'empty', 'empty candidates should skip AI and return an empty recommendation');
  assert.equal(aiRequestCount, 0, 'AI must not be called without filtered candidates');

  console.log('recommendation filtering tests passed');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
