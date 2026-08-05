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

function returnWithLog(statusCode, data, context) {
  console.log('[RETURN]', JSON.stringify({
    requestId: context.requestId,
    statusCode,
    productCount: Array.isArray(data) ? data.length : undefined,
    error: data && data.error ? data.error : undefined
  }));
  return reply(statusCode, data);
}

function queryBudget(query) {
  const text = String(query || '');
  const match = text.match(/(?:\u9884\u7b97|\u4e0d\u8d85\u8fc7|\u4ee5\u5185|\u5143\u5185)[^0-9]{0,8}(\d{3,7})/) || text.match(/(\d{3,7})\s*\u5143/);
  return match ? Number(match[1]) : null;
}

function recommendationCriteria(body, query) {
  const provided = body.criteria && typeof body.criteria === 'object' ? body.criteria : {};
  const budget = Number(provided.budget) || queryBudget(query);
  const category = String(provided.category || '').trim();
  return { budget: budget || null, category: category || null };
}

function configuredModel() {
  const value = String(process.env.TOKENHUB_MODEL || '').trim();
  if (value && value !== 'hy3-preview') return value;
  if (value === 'hy3-preview') console.warn('[START] Deprecated TOKENHUB_MODEL hy3-preview replaced with hy3');
  return 'hy3';
}

function requestTimeout() {
  const timeout = Number(process.env.AI_REQUEST_TIMEOUT_MS || 25000);
  return Math.min(Math.max(timeout, 3000), 45000);
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

async function askModel({ baseUrl, apiKey, model, prompt, timeoutMs, context }) {
  const controller = new AbortController();
  const startedAt = Date.now();
  let timeoutId;

  console.log('[AI ANALYSIS BEGIN]', JSON.stringify({
    requestId: context.requestId,
    model,
    timeoutMs,
    candidateCount: context.candidateCount
  }));

  try {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 700
      })
    });

    if (!response.ok) {
      throw new Error(`Hunyuan returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }

    const payload = await response.json();
    return payload.choices?.[0]?.message?.content || '';
  } catch (error) {
    if (controller.signal.aborted) {
      const timeoutError = new Error(`AI request timed out after ${timeoutMs}ms`);
      timeoutError.code = 'AI_TIMEOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    console.log('[AI ANALYSIS END]', JSON.stringify({
      requestId: context.requestId,
      durationMs: Date.now() - startedAt
    }));
  }
}

async function handleRequest(event) {
  const context = {
    requestId: event.requestId || event.requestID || 'unknown',
    candidateCount: 0
  };
  console.log('[START]', JSON.stringify({ requestId: context.requestId, method: event.httpMethod || 'POST' }));

  if (event.httpMethod === 'OPTIONS') return returnWithLog(204, '', context);

  const body = bodyFrom(event);
  const query = String(body.query || '').trim();
  const candidates = Array.isArray(body.candidates) ? body.candidates : [];
  context.candidateCount = candidates.length;
  console.log('[INPUT]', JSON.stringify({ requestId: context.requestId, query, candidateCount: candidates.length }));

  if (!query || query.length > 300) {
    return returnWithLog(400, { error: 'query is required and must be 300 characters or fewer' }, context);
  }
  if (!candidates.length) return returnWithLog(400, { error: 'candidates are required' }, context);

  const apiKey = process.env.TOKENHUB_API_KEY || process.env.HUNYUAN_API_KEY;
  if (!apiKey) return returnWithLog(500, { error: 'TOKENHUB_API_KEY is not configured' }, context);

  const criteria = recommendationCriteria(body, query);
  const safeCandidates = candidates.slice(0, 12).map(({ id, name, category, price, tags }) => ({ id, name, category, price, tags }));
  const baseUrl = (process.env.TOKENHUB_BASE_URL || 'https://tokenhub.tencentmaas.com/v1').replace(/\/$/, '');
  const model = configuredModel();

  console.log('[INPUT]', JSON.stringify({
    requestId: context.requestId,
    criteria,
    model,
    candidateCount: safeCandidates.length
  }));

  const text = await askModel({
    baseUrl,
    apiKey,
    model,
    prompt: buildPrompt(query, criteria, safeCandidates),
    timeoutMs: requestTimeout(),
    context
  });

  console.log('[RECOMMEND BEGIN]', JSON.stringify({ requestId: context.requestId, phase: 'parse-model-response' }));
  const selected = parseArray(text).map(pick => {
    const item = candidates.find(candidate => candidate.id === pick.id);
    return item && {
      ...item,
      reason: String(pick.reason || item.reason),
      score: Math.max(0, Math.min(100, Number(pick.score) || item.score))
    };
  }).filter(Boolean).slice(0, 3);

  if (!selected.length) throw new Error('No candidate IDs matched model response');

  console.log('[RECOMMEND END]', JSON.stringify({ requestId: context.requestId, productCount: selected.length }));
  return returnWithLog(200, selected, context);
}

exports.main = async event => {
  const safeEvent = event || {};
  const context = { requestId: safeEvent.requestId || safeEvent.requestID || 'unknown' };

  try {
    return await handleRequest(safeEvent);
  } catch (error) {
    console.error('[RECOMMEND END]', JSON.stringify({
      requestId: context.requestId,
      error: error.message || String(error),
      code: error.code || 'AI_REQUEST_FAILED'
    }));
    return returnWithLog(error.code === 'AI_TIMEOUT' ? 504 : 500, {
      error: 'Failed to generate recommendations',
      detail: error.message || String(error),
      code: error.code || 'AI_REQUEST_FAILED'
    }, context);
  }
};
