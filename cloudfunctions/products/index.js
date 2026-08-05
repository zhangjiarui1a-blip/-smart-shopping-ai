const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({});
const db = app.database();

const reply = (statusCode, data) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(data)
});

const bodyFrom = event => typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || event);

function matches(product, filters) {
  const category = String(filters.category || '');
  const keyword = String(filters.keyword || '').toLowerCase();
  const tags = Array.isArray(filters.tags) ? filters.tags : [];
  const searchable = [
    product.name,
    product.category,
    product.brand,
    product.description,
    ...(Array.isArray(product.tags) ? product.tags : [])
  ].join(' ').toLowerCase();

  return (!category || product.category === category) &&
    (!keyword || searchable.includes(keyword)) &&
    (!tags.length || tags.every(tag => (product.tags || []).includes(tag)));
}

function normalizeProduct(product) {
  const purchaseUrl = product.purchaseUrl || {};
  const url = product.url || purchaseUrl.jd || '';

  return {
    ...product,
    id: product.id || product._id,
    name: product.name || '',
    category: product.category || '',
    price: product.price || '',
    brand: product.brand || '',
    description: product.description || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    image: product.image || '',
    url,
    purchaseUrl: { jd: purchaseUrl.jd || url, taobao: purchaseUrl.taobao || '' }
  };
}

exports.main = async event => {
  try {
    if (event.httpMethod === 'OPTIONS') return reply(204, '');

    const body = bodyFrom(event);
    const limit = Math.min(Math.max(Number(body.limit) || 12, 1), 50);
    const result = await db.collection('products').get();
    const products = (result.data || [])
      .filter(product => matches(product, body))
      .slice(0, limit)
      .map(normalizeProduct);

    console.log('[products] query result', {
      count: products.length,
      category: body.category || '',
      keyword: body.keyword || ''
    });

    return reply(200, products);
  } catch (error) {
    console.error('[products] failed', error.stack || error);
    return reply(500, { error: 'Failed to load products', detail: error.message || String(error) });
  }
};
