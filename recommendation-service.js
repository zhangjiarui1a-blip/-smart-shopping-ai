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

  function fallbackRecommendation(query, candidates, error, candidateSource, answers) {
    return {
      stage: 'recommend',
      query: query,
      products: candidates.slice(0, 3),
      source: 'fallback',
      candidateSource: candidateSource || 'fallback',
      error: error || null,
      answers: answers || {}
    };
  }

  async function getRecommendations(query, answers) {
    var cleanQuery = String(query || '').trim();
    var collectedAnswers = answers && typeof answers === 'object' ? answers : {};

    if (!window.productService || typeof window.productService.getCandidates !== 'function') {
      throw new Error('product-service.js did not load before recommendation-service.js');
    }

    var candidateQuery = (cleanQuery + ' ' + answerText(collectedAnswers)).trim();
    var candidateResult = await window.productService.getCandidates(candidateQuery);
    var allCandidates = candidateResult.products || [];
    var budget = extractBudget(candidateQuery);
    var category = typeof window.productService.categoryFor === 'function'
      ? window.productService.categoryFor(candidateQuery)
      : '';
    var candidates = applyBudget(allCandidates, budget);
    var criteria = { budget: budget, category: category };

    if (!endpoint) {
      console.warn('[recommendations] API URL is not configured; using product candidates');
      return fallbackRecommendation(cleanQuery, candidates, 'window.RECOMMENDATIONS_API_URL is not configured', candidateResult.source, collectedAnswers);
    }

    try {
      console.info('[recommendations] requesting recommendation stage', {
        url: endpoint,
        query: cleanQuery,
        candidateCount: candidates.length,
        criteria: criteria,
        answers: collectedAnswers
      });

      var response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery, candidates: candidates, criteria: criteria, answers: collectedAnswers })
      });
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(payload.error || ('recommendations request failed: ' + response.status));

      if (payload && payload.stage === 'collecting_requirements') {
        console.info('[recommendations] requirements clarification requested', { count: (payload.questions || []).length });
        return {
          stage: 'collecting_requirements',
          query: cleanQuery,
          profile: payload.profile || {},
          questions: Array.isArray(payload.questions) ? payload.questions : [],
          products: [],
          source: 'ai',
          candidateSource: candidateResult.source,
          error: null,
          answers: collectedAnswers
        };
      }

      var apiProducts = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload && payload.products) ? payload.products : []);
      var products = apiProducts.length ? apiProducts : candidates;

      console.info('[recommendations] recommendation request succeeded', { count: products.length });
      return {
        stage: 'recommend',
        query: cleanQuery,
        profile: payload && payload.profile ? payload.profile : criteria,
        products: products,
        source: payload && payload.source ? payload.source : 'ai',
        candidateSource: candidateResult.source,
        error: candidateResult.error || null,
        answers: collectedAnswers
      };
    } catch (error) {
      var message = error && error.message ? error.message : String(error);
      console.error('[recommendations] request failed', { reason: message });
      return fallbackRecommendation(cleanQuery, candidates, message, candidateResult.source, collectedAnswers);
    }
  }

  window.recommendationService = {
    getRecommendations: getRecommendations,
    config: { endpoint: endpoint }
  };
}());
