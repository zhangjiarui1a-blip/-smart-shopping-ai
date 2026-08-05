(function () {
  'use strict';

  var endpoint = String(window.RECOMMENDATIONS_API_URL || '').trim();

  function fallbackRecommendation(query, candidates, error) {
    return {
      query: query,
      summary: query,
      products: candidates,
      source: 'fallback',
      error: error || null
    };
  }

  async function getRecommendations(query) {
    var cleanQuery = String(query || '').trim();

    if (!window.productService || typeof window.productService.getCandidates !== 'function') {
      throw new Error('product-service.js did not load before recommendation-service.js');
    }

    var candidateResult = await window.productService.getCandidates(cleanQuery);
    var candidates = candidateResult.products || [];

    if (!endpoint) {
      console.warn('[recommendations] API URL is not configured; using product candidates');
      return fallbackRecommendation(cleanQuery, candidates, 'window.RECOMMENDATIONS_API_URL is not configured');
    }

    try {
      console.info('[recommendations] requesting AI analysis', {
        url: endpoint,
        query: cleanQuery,
        candidateCount: candidates.length
      });

      var response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery, candidates: candidates })
      });
      var payload = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(payload.error || ('recommendations request failed: ' + response.status));
      }

      var apiProducts = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload.products) ? payload.products : []);
      var products = apiProducts.length ? apiProducts : candidates;

      console.info('[recommendations] AI analysis request succeeded', {
        count: products.length
      });

      return {
        query: cleanQuery,
        summary: payload.summary || cleanQuery,
        products: products,
        source: payload.source || 'ai',
        error: candidateResult.error || null
      };
    } catch (error) {
      var message = error && error.message ? error.message : String(error);
      console.error('[recommendations] AI analysis request failed', { reason: message });
      return fallbackRecommendation(cleanQuery, candidates, message);
    }
  }

  window.recommendationService = {
    getRecommendations: getRecommendations,
    config: { endpoint: endpoint }
  };
}());
