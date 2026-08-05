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
    stage: data && data.stage,
    productCount: Array.isArray(data) ? data.length : (data && Array.isArray(data.products) ? data.products.length : undefined),
    error: data && data.error
  }));
  return reply(statusCode, data);
}

function numberFromText(value) {
  const digits = String(value || '').replace(/[^0-9.]/g, '');
  return digits ? Number(digits) : null;
}

function queryBudget(query) {
  const text = String(query || '');
  const match = text.match(/(?:\u9884\u7b97|\u4e0d\u8d85\u8fc7|\u4ee5\u5185|\u5143\u5185)[^0-9]{0,8}(\d{3,7})/) || text.match(/(\d{3,7})\s*\u5143/);
  return match ? Number(match[1]) : null;
}

function categoryFrom(text) {
  const source = String(text || '');
  const rules = [
    ['\u624b\u673a', ['\u624b\u673a', '\u62cd\u7167', '\u5f71\u50cf']],
    ['\u7535\u8111', ['\u7535\u8111', '\u7b14\u8bb0\u672c', '\u53f0\u5f0f']],
    ['\u6570\u7801', ['\u6570\u7801', '\u8033\u673a', '\u97f3\u7bb1', '\u5e73\u677f', '\u76f8\u673a', '\u6295\u5f71']],
    ['\u5ba0\u7269\u7528\u54c1', ['\u5ba0\u7269', '\u732b', '\u72d7', '\u72d7\u7cae', '\u732b\u7cae', '\u73a9\u5177']],
    ['\u5bb6\u5c45', ['\u5bb6\u5c45', '\u626b\u5730', '\u53a8\u623f', '\u6536\u7eb3', '\u7a7a\u6c14\u51c0\u5316']],
    ['\u793c\u7269', ['\u793c\u7269', '\u9001\u793c', '\u751f\u65e5', '\u7eaa\u5ff5']]
  ];

  for (const [category, keywords] of rules) {
    if (source.includes(category) || keywords.some(keyword => source.includes(keyword))) return category;
  }
  return '';
}

function scenarioFrom(text) {
  const source = String(text || '');
  const rules = [
    [/\u529e\u516c|\u5b66\u4e60|\u4e0a\u8bfe|\u7f16\u7a0b/, '\u529e\u516c\u6216\u5b66\u4e60'],
    [/\u901a\u52e4|\u51fa\u5dee|\u65c5\u884c/, '\u901a\u52e4\u6216\u65c5\u884c'],
    [/\u6e38\u620f|\u7ade\u6280|\u5f00\u9ed1/, '\u6e38\u620f'],
    [/\u62cd\u7167|\u89c6\u9891|\u5f71\u50cf/, '\u62cd\u7167\u4e0e\u521b\u4f5c'],
    [/\u5ba0\u7269|\u732b|\u72d7/, '\u5ba0\u7269\u65e5\u5e38\u4f7f\u7528'],
    [/\u9001\u793c|\u751f\u65e5|\u7eaa\u5ff5/, '\u9001\u793c']
  ];
  const matched = rules.find(([pattern]) => pattern.test(source));
  return matched ? matched[1] : '';
}

function preferenceFrom(text) {
  const source = String(text || '');
  const keywords = ['\u8f7b\u8584', '\u4fbf\u643a', '\u6027\u80fd', '\u62cd\u7167', '\u7eed\u822a', '\u6027\u4ef7\u6bd4', '\u964d\u566a', '\u5927\u5c4f', '\u9759\u97f3', '\u667a\u80fd', '\u5b89\u5168', '\u9ad8\u86cb\u767d', '\u8010\u7528', '\u989c\u503c'];
  return keywords.find(keyword => source.includes(keyword)) || '';
}

function questionSet() {
  return {
    budget: {
      id: 'budget',
      prompt: '\u4f60\u7684\u9884\u7b97\u5927\u7ea6\u662f\u591a\u5c11\uff1f',
      placeholder: '\u4f8b\u5982\uff1a5000\u5143',
      options: ['3000\u5143\u4ee5\u5185', '5000\u5143\u4ee5\u5185', '10000\u5143\u4ee5\u5185']
    },
    category: {
      id: 'category',
      prompt: '\u4f60\u60f3\u8d2d\u4e70\u54ea\u7c7b\u5546\u54c1\uff1f',
      placeholder: '\u4f8b\u5982\uff1a\u8f7b\u8584\u7b14\u8bb0\u672c',
      options: ['\u624b\u673a', '\u7535\u8111', '\u6570\u7801', '\u5ba0\u7269\u7528\u54c1', '\u5bb6\u5c45', '\u793c\u7269']
    },
    scenario: {
      id: 'scenario',
      prompt: '\u4e3b\u8981\u4f1a\u5728\u4ec0\u4e48\u573a\u666f\u4e0b\u4f7f\u7528\uff1f',
      placeholder: '\u4f8b\u5982\uff1a\u901a\u52e4\u529e\u516c',
      options: ['\u65e5\u5e38\u529e\u516c', '\u901a\u52e4\u65c5\u884c', '\u6e38\u620f\u5a31\u4e50', '\u62cd\u7167\u521b\u4f5c']
    },
    preference: {
      id: 'preference',
      prompt: '\u4f60\u6700\u770b\u91cd\u7684\u662f\u4ec0\u4e48\uff1f',
      placeholder: '\u4f8b\u5982\uff1a\u8f7b\u8584\u4fbf\u643a',
      options: ['\u8f7b\u8584\u4fbf\u643a', '\u6027\u80fd', '\u62cd\u7167', '\u7eed\u822a', '\u6027\u4ef7\u6bd4']
    }
  };
}

function collectProfile(body, query) {
  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const answerText = Object.values(answers).join(' ');
  const fullText = `${query} ${answerText}`;
  const directBudget = numberFromText(answers.budget);
  const directScenario = String(answers.scenario || '').trim();
  const directPreference = String(answers.preference || '').trim();
  const directCategory = String(answers.category || '').trim();

  return {
    budget: directBudget || queryBudget(fullText),
    category: categoryFrom(directCategory) || categoryFrom(fullText),
    scenario: directScenario || scenarioFrom(fullText),
    preference: directPreference || preferenceFrom(fullText)
  };
}

function missingQuestions(profile) {
  const allQuestions = questionSet();
  return ['budget', 'category', 'scenario', 'preference']
    .filter(key => !profile[key])
    .map(key => allQuestions[key]);
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

function buildPrompt(query, profile, candidates) {
  return [
    '\u4f60\u662f\u4e13\u4e1a\u3001\u514b\u5236\u7684 AI \u8d2d\u7269\u52a9\u624b\u3002',
    `\u7528\u6237\u539f\u59cb\u9700\u6c42\uff1a${query}`,
    `\u5df2\u786e\u8ba4\u7684\u9884\u7b97\uff1a${profile.budget}\u5143`,
    `\u5df2\u786e\u8ba4\u7684\u7c7b\u522b\uff1a${profile.category}`,
    `\u4f7f\u7528\u573a\u666f\uff1a${profile.scenario}`,
    `\u6838\u5fc3\u504f\u597d\uff1a${profile.preference}`,
    '\u4e25\u683c\u89c4\u5219\uff1a\u53ea\u80fd\u4ece\u5019\u9009\u5546\u54c1\u4e2d\u9009\u62e9\uff0c\u4e0d\u80fd\u521b\u9020\u3001\u6539\u5199\u6216\u8865\u5145\u5546\u54c1\u540d\u79f0\u3001\u5206\u7c7b\u6216\u4ef7\u683c\u3002',
    '\u53ea\u9009\u62e9\u7b26\u5408\u9884\u7b97\u3001\u7c7b\u522b\u4e0e\u4f7f\u7528\u573a\u666f\u7684\u5546\u54c1\u3002\u8fd4\u56de 1-3 \u4e2a\u7ed3\u679c\u3002',
    '\u6bcf\u4e2a\u7ed3\u679c\u53ea\u80fd\u5305\u542b id\u3001reason\u3001score\uff1breason \u7528\u4e2d\u6587\u4e00\u53e5\u8bdd\u89e3\u91ca\u4e3a\u4f55\u5339\u914d\u3002',
    '\u53ea\u8f93\u51fa\u5408\u6cd5 JSON \u6570\u7ec4\uff0c\u4e0d\u8981 Markdown \u6216\u5176\u4ed6\u6587\u5b57\u3002',
    `\u5019\u9009\u5546\u54c1\uff1a${JSON.stringify(candidates)}`
  ].join('\n');
}

async function askModel({ baseUrl, apiKey, model, prompt, timeoutMs, context }) {
  const controller = new AbortController();
  const startedAt = Date.now();
  let timeoutId;

  console.log('[AI ANALYSIS BEGIN]', JSON.stringify({ requestId: context.requestId, model, timeoutMs, candidateCount: context.candidateCount }));
  try {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 700 })
    });
    if (!response.ok) throw new Error(`Hunyuan returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
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
    console.log('[AI ANALYSIS END]', JSON.stringify({ requestId: context.requestId, durationMs: Date.now() - startedAt }));
  }
}

async function handleRequest(event) {
  const context = { requestId: event.requestId || event.requestID || 'unknown', candidateCount: 0 };
  console.log('[START]', JSON.stringify({ requestId: context.requestId, method: event.httpMethod || 'POST' }));
  if (event.httpMethod === 'OPTIONS') return returnWithLog(204, '', context);

  const body = bodyFrom(event);
  const query = String(body.query || '').trim();
  const candidates = Array.isArray(body.candidates) ? body.candidates : [];
  context.candidateCount = candidates.length;
  if (!query || query.length > 300) return returnWithLog(400, { error: 'query is required and must be 300 characters or fewer' }, context);

  const profile = collectProfile(body, query);
  const questions = missingQuestions(profile);
  console.log('[INPUT]', JSON.stringify({ requestId: context.requestId, query, profile, candidateCount: candidates.length, missing: questions.map(question => question.id) }));

  if (questions.length) {
    return returnWithLog(200, { stage: 'collecting_requirements', profile, questions }, context);
  }
  if (!candidates.length) return returnWithLog(400, { error: 'candidates are required to generate recommendations' }, context);

  const apiKey = process.env.TOKENHUB_API_KEY || process.env.HUNYUAN_API_KEY;
  if (!apiKey) return returnWithLog(500, { error: 'TOKENHUB_API_KEY is not configured' }, context);

  const safeCandidates = candidates.slice(0, 12).map(({ id, name, category, price, tags }) => ({ id, name, category, price, tags }));
  const baseUrl = (process.env.TOKENHUB_BASE_URL || 'https://tokenhub.tencentmaas.com/v1').replace(/\/$/, '');
  const model = configuredModel();
  const text = await askModel({ baseUrl, apiKey, model, prompt: buildPrompt(query, profile, safeCandidates), timeoutMs: requestTimeout(), context });

  console.log('[RECOMMEND BEGIN]', JSON.stringify({ requestId: context.requestId, phase: 'parse-model-response' }));
  const selected = parseArray(text).map(pick => {
    const item = candidates.find(candidate => candidate.id === pick.id);
    return item && { ...item, reason: String(pick.reason || item.reason), score: Math.max(0, Math.min(100, Number(pick.score) || item.score)) };
  }).filter(Boolean).slice(0, 3);

  if (!selected.length) throw new Error('No candidate IDs matched model response');
  console.log('[RECOMMEND END]', JSON.stringify({ requestId: context.requestId, productCount: selected.length }));
  return returnWithLog(200, { stage: 'recommend', profile, products: selected }, context);
}

exports.main = async event => {
  const safeEvent = event || {};
  const context = { requestId: safeEvent.requestId || safeEvent.requestID || 'unknown' };
  try {
    return await handleRequest(safeEvent);
  } catch (error) {
    console.error('[RECOMMEND END]', JSON.stringify({ requestId: context.requestId, error: error.message || String(error), code: error.code || 'AI_REQUEST_FAILED' }));
    return returnWithLog(error.code === 'AI_TIMEOUT' ? 504 : 500, { error: 'Failed to generate recommendations', detail: error.message || String(error), code: error.code || 'AI_REQUEST_FAILED' }, context);
  }
};
