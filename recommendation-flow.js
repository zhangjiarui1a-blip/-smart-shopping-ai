(function () {
  'use strict';

  var STATES = {
    INPUT: 'INPUT',
    CLARIFY: 'CLARIFY',
    ANALYZING: 'ANALYZING',
    SUCCESS: 'SUCCESS',
    FALLBACK: 'FALLBACK',
    FAILED: 'FAILED'
  };
  var running = false;
  var sequence = 0;

  function extractBudget(text) {
    var source = String(text || '');
    var match = source.match(/(?:\u9884\u7b97|\u4e0d\u8d85\u8fc7|\u4ee5\u5185|\u5143\u5185)[^0-9]{0,8}(\d{3,7})/) || source.match(/(\d{3,7})\s*\u5143/);
    return match ? Number(match[1]) : null;
  }

  function priceNumber(value) {
    var digits = String(value == null ? '' : value).replace(/[^0-9.]/g, '');
    return digits ? Number(digits) : null;
  }

  function applyBudget(products, budget) {
    if (!budget) return products;
    var matches = products.filter(function (product) {
      var price = priceNumber(product.price);
      return price === null || price <= budget;
    });
    return matches.length ? matches : products;
  }

  function answerText(answers) {
    return Object.keys(answers || {}).map(function (key) { return answers[key]; }).join(' ');
  }

  function sourceFor(query) {
    try {
      var entry = JSON.parse(window.sessionStorage.getItem('shoppingRecommendationEntry') || 'null');
      if (entry && entry.query === query) return entry.source || 'search';
    } catch (error) {
      console.warn('[ENTRY] unable to read saved entry', error);
    }
    return 'search';
  }

  function emit(callbacks, state, detail) {
    console.info('[RECOMMENDATION STATE]', state, detail || {});
    if (callbacks && typeof callbacks.onState === 'function') callbacks.onState(state, detail || {});
  }

  function decideEntry(query) {
    var cleanQuery = String(query || '').trim();
    var decision = window.clarificationService
      ? window.clarificationService.evaluate(cleanQuery)
      : { needClarification: false, questions: [], query: cleanQuery };
    return {
      state: decision.needClarification ? STATES.CLARIFY : STATES.INPUT,
      query: cleanQuery,
      needClarification: decision.needClarification,
      questions: decision.questions || []
    };
  }

  async function run(options) {
    if (running) return { ignored: true, state: STATES.ANALYZING };
    running = true;
    var requestId = ++sequence;
    var query = String(options.query || '').trim();
    var answers = options.answers && typeof options.answers === 'object' ? options.answers : {};
    var callbacks = options.callbacks || {};
    var context;

    emit(callbacks, STATES.INPUT, { requestId: requestId, query: query });
    try {
      if (!window.productService || typeof window.productService.getCandidates !== 'function') {
        throw new Error('product-service.js did not load before recommendation-flow.js');
      }
      if (!window.recommendationService || typeof window.recommendationService.request !== 'function') {
        throw new Error('recommendation-service.js did not load before recommendation-flow.js');
      }

      var candidateQuery = (query + ' ' + answerText(answers)).trim();
      var result = await window.productService.getCandidates(candidateQuery);
      var budget = extractBudget(candidateQuery);
      var candidates = applyBudget(result.products || [], budget).slice(0, 10);
      var category = result.category || window.productService.categoryFor(candidateQuery);
      var scenario = result.scenario || '';
      context = {
        query: query,
        answers: answers,
        candidates: candidates,
        criteria: { budget: budget, category: category, scenario: scenario },
        candidateSource: result.source,
        candidateError: result.error || null,
        source: sourceFor(query)
      };

      console.info('[recommendation] user query:', query);
      console.info('[recommendation] detected category:', category || 'unclassified');
      console.info('[recommendation] candidates before filter:', Number(result.beforeFilter) || 0);
      console.info('[recommendation] candidates after filter:', candidates.length);
      if (typeof callbacks.onCandidates === 'function') callbacks.onCandidates(context);

      if (!candidates.length) {
        emit(callbacks, STATES.FALLBACK, { requestId: requestId, reason: 'NO_MATCHING_PRODUCTS' });
        return { state: STATES.FALLBACK, products: [], context: context, message: '\u6682\u65f6\u6ca1\u6709\u7b26\u5408\u9700\u6c42\u7684\u5546\u54c1' };
      }

      emit(callbacks, STATES.ANALYZING, { requestId: requestId, candidateCount: candidates.length });
      var payload = await window.recommendationService.request({
        query: query,
        candidates: candidates,
        criteria: context.criteria,
        answers: answers
      });

      if (payload.fallback === true) {
        var fallbackResult = { state: STATES.FALLBACK, products: candidates, context: context, message: payload.message || '\u0041\u0049\u6682\u65f6\u7e41\u5fd9' };
        emit(callbacks, STATES.FALLBACK, { requestId: requestId, reason: 'AI_FALLBACK' });
        return fallbackResult;
      }

      var selected = Array.isArray(payload) ? payload : (Array.isArray(payload.products) ? payload.products : null);
      if (!selected) {
        var invalid = new Error('AI response did not include a products array');
        invalid.code = 'INVALID_RESPONSE';
        throw invalid;
      }
      var products = selected.map(function (item) {
        var original = candidates.filter(function (candidate) { return candidate.id === item.id; })[0];
        if (!original) return null;
        return Object.assign({}, original, {
          reason: item.reason || original.reason,
          score: Number(item.score) || original.score
        });
      }).filter(Boolean);

      var success = {
        state: STATES.SUCCESS,
        stage: 'recommend',
        products: products,
        profile: payload.profile || context.criteria,
        source: payload.source || 'ai',
        candidateSource: context.candidateSource,
        context: context
      };
      emit(callbacks, STATES.SUCCESS, { requestId: requestId, productCount: products.length });
      return success;
    } catch (error) {
      emit(callbacks, STATES.FAILED, { requestId: requestId, code: error.code || 'UNKNOWN_ERROR' });
      return { state: STATES.FAILED, error: error, context: context };
    } finally {
      running = false;
    }
  }

  window.recommendationFlow = { STATES: STATES, decideEntry: decideEntry, run: run };
}());
