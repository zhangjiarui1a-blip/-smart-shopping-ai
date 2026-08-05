(function () {
  'use strict';

  var endpoint = String(window.RECOMMENDATIONS_API_URL || '').trim();

  function extractBudget(query) {
    var text = String(query || '');
    var match = text.match(/(?:\u9884\u7b97|\u4e0d\u8d85\u8fc7|\u4ee5\u5185|\u5143\u5185)[^0-9]{0,8}(\d{3,7})/) || text.match(/(\d{3,7})\s*\u5143/);
    return match ? Number(match[1]) : null;
  }

  function priceNumber(value) {
    var digits = String(value == null ? '' : value).replace(/[^0-9.]/g, '');
    return digits ? Number(digits) : null;
  }

  function applyBudget(candidates, budget) {
    if (!budget) return candidates;
    var withinBudget = candidates.filter(function (candidate) {
      var price = priceNumber(candidate.price);
      return price === null || price <= budget;
    });
    return withinBudget.length ? withinBudget : candidates;
  }

  function answerText(answers) {
    return Object.keys(answers || {}).map(function (key) { return answers[key]; }).join(' ');
  }

  function readEntry(query) {
    try {
      var saved = JSON.parse(window.sessionStorage.getItem('shoppingRecommendationEntry') || 'null');
      if (saved && saved.query === query && Array.isArray(saved.candidates)) return saved;
    } catch (error) {
      console.warn('[ENTRY] unable to read saved entry', error);
    }
    return { source: 'search', query: query, candidates: [] };
  }

  function fallbackRecommendation(context, error) {
    console.warn('[FALLBACK]', {
      query: context.query,
      category: context.criteria.category || 'unclassified',
      candidateCount: context.candidates.length,
      reason: error || 'AI unavailable'
    });
    return {
      stage: 'recommend',
      query: context.query,
      profile: context.criteria,
      products: context.candidates.slice(0, 3),
      source: 'fallback',
      candidateSource: context.candidateSource,
      error: error || null,
      answers: context.answers
    };
  }

  async function loadCandidateContext(query, answers) {
    var cleanQuery = String(query || '').trim();
    var collectedAnswers = answers && typeof answers === 'object' ? answers : {};
    var entry = readEntry(cleanQuery);

    if (!window.productService || typeof window.productService.getCandidates !== 'function') {
      throw new Error('product-service.js did not load before recommendation-service.js');
    }

    var candidateQuery = (cleanQuery + ' ' + answerText(collectedAnswers)).trim();
    var candidateResult = await window.productService.getCandidates(candidateQuery);
    var budget = extractBudget(candidateQuery);
    var category = typeof window.productService.categoryFor === 'function'
      ? window.productService.categoryFor(candidateQuery)
      : '';

    var candidates = applyBudget(candidateResult.products || [], budget).slice(0, 10);
    console.info('[ENTRY] source=', entry.source);
    console.info('[ENTRY] query=', cleanQuery);
    console.info('[ENTRY] candidates length=', candidates.length);

    return {
      query: cleanQuery,
      entry: { source: entry.source, query: cleanQuery, candidates: candidates },
      answers: collectedAnswers,
      candidates: candidates,
      criteria: { budget: budget, category: category },
      candidateSource: candidateResult.source,
      candidateError: candidateResult.error || null
    };
  }

  async function requestAiAnalysis(context) {
    if (!endpoint) {
      throw new Error('window.RECOMMENDATIONS_API_URL is not configured');
    }

    if (!context.candidates.length) {
      return fallbackRecommendation(context, 'No matching products after category filter');
    }

    console.info('[AI REQUEST]', {
      url: endpoint,
      query: context.query,
      candidateCount: context.candidates.length,
      criteria: context.criteria
    });

    var response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: context.query,
        candidates: context.candidates,
        criteria: context.criteria,
        answers: context.answers
      })
    });
    var payload = await response.json().catch(function () { return {}; });

    console.info('[AI RESPONSE]', {
      status: response.status,
      stage: payload && payload.stage ? payload.stage : 'legacy'
    });

    if (!response.ok) {
      throw new Error(payload.error || ('recommendations request failed: ' + response.status));
    }

    if (payload && payload.stage === 'collecting_requirements') {
      return {
        stage: 'collecting_requirements',
        query: context.query,
        profile: payload.profile || {},
        questions: Array.isArray(payload.questions) ? payload.questions : [],
        products: [],
        source: 'ai',
        candidateSource: context.candidateSource,
        error: null,
        answers: context.answers
      };
    }

    var apiProducts = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload && payload.products) ? payload.products : []);

    if (!apiProducts.length) {
      throw new Error('AI response did not include recommended products');
    }

    return {
      stage: 'recommend',
      query: context.query,
      profile: payload && payload.profile ? payload.profile : context.criteria,
      products: apiProducts,
      source: payload && payload.source ? payload.source : 'ai',
      candidateSource: context.candidateSource,
      error: null,
      answers: context.answers
    };
  }

  async function getRecommendations(query, answers) {
    var context = await loadCandidateContext(query, answers);
    try {
      return await requestAiAnalysis(context);
    } catch (error) {
      var message = error && error.message ? error.message : String(error);
      console.error('[AI RESPONSE]', { status: 'failed', reason: message });
      return fallbackRecommendation(context, message);
    }
  }

  window.recommendationService = {
    loadCandidateContext: loadCandidateContext,
    requestAiAnalysis: requestAiAnalysis,
    getRecommendations: getRecommendations,
    config: { endpoint: endpoint }
  };
}());
