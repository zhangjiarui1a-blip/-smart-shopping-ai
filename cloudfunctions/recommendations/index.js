console.log('FUNCTION_START');

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
const parseArray = text => {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Model response contains no JSON array');
  return JSON.parse(match[0]);
};

function queryBudget(query) {
  const match = String(query || '').match(/(?:\u9884\u7b97|\u4e0d\u8d85\u8fc7|\u4ee5\u5185|\u5143\u5185)[^0-9]{0,8}(\d{3,7})/) || String(query || '').match(/(\d{3,7})\s*\u5143/);
  return match ? Number(match[1]) : null;
}

function recommendationCriteria(body, query) {
  const provided = body.criteria && typeof body.criteria === 'object' ? body.criteria : {};
  const budget = Number(provided.budget) || queryBudget(query);
  const category = String(provided.category || '').trim();
  return { budget: budget || null, category: category || null };
}

async function resolveModel(baseUrl, apiKey) {
  const configuredModel = process.env.TOKENHUB_MODEL;
  if (configuredModel && configuredModel !== 'hy3-preview') return configuredModel;
  if (configuredModel === 'hy3-preview') console.warn('[recommendations] Replacing unavailable model hy3-preview with hy3');
  if (configuredModel === 'hy3-preview') return 'hy3';

  const response = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!response.ok) throw new Error(`TokenHub model discovery returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const models = (await response.json()).data || [];
  const ids = models.map(model => model.id).filter(Boolean);
  console.log('[recommendations] TokenHub available models:', ids);
  const preferred = ids.includes('hy3') ? 'hy3' : (ids.find(id => /hunyuan|hy/i.test(id)) || ids[0]);
  if (!preferred) throw new Error('TokenHub returned no available models for this API Key');
  console.log('[recommendations] TokenHub selected model:', preferred);
  return preferred;
}

function buildPrompt(query, criteria, candidates) {
  const budgetInstruction = criteria.budget
    ? `\u7528\u6237\u9884\u7b97\uff1a\u4e0d\u8d85\u8fc7 ${criteria.budget} \u5143\u3002`
    : '\u7528\u6237\u672a\u63d0\u4f9b\u660e\u786e\u9884\u7b97\u3002';
  const categoryInstruction = criteria.category
    ? `\u76ee\u6807\u5546\u54c1\u7c7b\u522b\uff1a${criteria.category}\u3002`
    : '\u7528\u6237\u672a\u63d0\u4f9b\u660e\u786e\u7c7b\u522b\u3002';

  return [
    '\u4f60\u662f\u4e13\u4e1a\u3001\u514b\u5236\u7684 AI \u8d2d\u7269\u52a9\u624b\u3002',
    `\u7528\u6237\u9700\u6c42\uff1a${query}`,
    budgetInstruction,
    categoryInstruction,
    '\u4e25\u683c\u89c4\u5219\uff1a\u53ea\u80fd\u4ece\u5019\u9009\u5546\u54c1\u4e2d\u9009\u62e9\uff0c\u4e0d\u80fd\u521b\u9020\u3001\u6539\u5199\u6216\u8865\u5145\u5546\u54c1\u540d\u79f0\u3001\u5206\u7c7b\u6216\u4ef7\u683c\u3002',
    '\u4f18\u5148\u9009\u62e9\u7c7b\u522b\u5339\u914d\u4e14\u4e0d\u8d85\u8fc7\u9884\u7b97\u7684\u5546\u54c1\u3002\u82e5\u4e0d\u8db3 3 \u4e2a\uff0c\u53ea\u8fd4\u56de\u7b26\u5408\u6761\u4ef6\u7684\u5546\u54c1\uff0c\u4e0d\u8981\u7528\u4e0d\u7b26\u5408\u9879\u51d1\u6570\u3002',
    '\u8fd4\u56de 1-3 \u4e2a\u7ed3\u679c\u3002\u6bcf\u4e2a\u7ed3\u679c\u53ea\u80fd\u5305\u542b id\u3001reason\u3001score\uff1bscore \u4e3a 0-100 \u7684\u6574\u6570\u3002',
    'reason \u7528\u4e2d\u6587\u4e00\u53e5\u8bdd\u8bf4\u660e\u5b83\u4e3a\u4f55\u5339\u914d\u7528\u6237\u573a\u666f\u3001\u9884\u7b97\u6216\u504f\u597d\uff0c\u4e0d\u8981\u989d\u5916\u63a8\u6d4b\u4ea7\u54c1\u53c2\u6570\u3002',
    '\u53ea\u8f93\u51fa\u5408\u6cd5 JSON \u6570\u7ec4\uff0c\u4e0d\u8981 Markdown \u6216\u5176\u4ed6\u6587\u5b57\u3002',
    `\u5019\u9009\u5546\u54c1\uff1a${JSON.stringify(candidates)}`
  ].join('\n');
}

async function handleRequest(event) {
  if (event.httpMethod === 'OPTIONS') return reply(204, '');
  const body = bodyFrom(event);
  const query = String(body.query || '').trim();
  const candidates = Array.isArray(body.candidates) ? body.candidates : [];
  console.log('[recommendations] query:', query);
  console.log('[recommendations] candidate count:', candidates.length);

  if (!query || query.length > 300) return reply(400, { error: 'query is required and must be 300 characters or fewer' });
  if (!candidates.length) return reply(400, { error: 'candidates are required' });

  const apiKey = process.env.TOKENHUB_API_KEY || process.env.HUNYUAN_API_KEY;
  if (!apiKey) return reply(500, { error: 'TOKENHUB_API_KEY is not configured' });

  const criteria = recommendationCriteria(body, query);
  const safeCandidates = candidates.slice(0, 12).map(({ id, name, category, price, tags }) => ({ id, name, category, price, tags }));
  console.log('[recommendations] criteria:', JSON.stringify(criteria));

  const baseUrl = (process.env.TOKENHUB_BASE_URL || 'https://tokenhub.tencentmaas.com/v1').replace(/\/$/, '');
  const model = await resolveModel(baseUrl, apiKey);
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildPrompt(query, criteria, safeCandidates) }],
      temperature: 0.2
    })
  });
  if (!response.ok) throw new Error(`Hunyuan returned ${response.status}: ${(await response.text()).slice(0, 300)}`);

  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content || '';
  console.log('[recommendations] Hunyuan text:', text);
  const selected = parseArray(text).map(pick => {
    const item = candidates.find(candidate => candidate.id === pick.id);
    return item && {
      ...item,
      reason: String(pick.reason || item.reason),
      score: Math.max(0, Math.min(100, Number(pick.score) || item.score))
    };
  }).filter(Boolean).slice(0, 3);

  if (!selected.length) throw new Error('No candidate IDs matched model response');
  console.log('[recommendations] final products:', JSON.stringify(selected));
  return reply(200, selected);
}

exports.main = async event => {
  try {
    return await handleRequest(event || {});
  } catch (error) {
    console.error(error.stack || error);
    return reply(500, { error: 'Failed to generate recommendations', detail: error.message || String(error) });
  }
};
