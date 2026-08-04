window.recommendationService = (() => {
  const config = { useRemoteService: true, endpoint: window.RECOMMENDATIONS_API_URL || '/api/recommendations' };
  const mockIds = query => /耳机|降噪|音乐/.test(query) ? ['quiet-pro', 'air-14', 'fit-watch-3'] : /手机|拍照|影像/.test(query) ? ['one-pro', 'fit-watch-3', 'quiet-pro'] : /手表|运动/.test(query) ? ['fit-watch-3', 'quiet-pro', 'air-14'] : ['air-14', 'quiet-pro', 'one-pro'];
  const mockRecommendations = query => mockIds(query).map(id => window.productCatalog.find(product => product.id === id));

  async function getRecommendations(query) {
    if (!config.useRemoteService) return mockRecommendations(query);
    try {
      const response = await fetch(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      if (!response.ok) throw new Error(`Recommendation API returned ${response.status}`);
      const recommendations = await response.json();
      if (!Array.isArray(recommendations) || !recommendations.length) throw new Error('Recommendation API returned invalid data');
      return recommendations;
    } catch (error) {
      console.warn('Remote recommendation failed; using local fallback.', error);
      return mockRecommendations(query);
    }
  }

  return { getRecommendations, getProduct: id => window.productCatalog.find(product => product.id === id), config };
})();
