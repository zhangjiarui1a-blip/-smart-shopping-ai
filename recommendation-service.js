/*
 * Recommendation adapter. Keep this browser module free of provider keys.
 * When CloudBase is ready, set useRemoteService to true and implement the
 * /api/recommendations CloudBase Function to call Tencent Hunyuan server-side.
 */
window.recommendationService = (() => {
  const config = { useRemoteService: false, endpoint: '/api/recommendations' };
  const idsForQuery = query => /耳机|降噪|音乐/.test(query) ? ['quiet-pro', 'air-14', 'fit-watch-3'] : /手机|拍照|影像/.test(query) ? ['one-pro', 'fit-watch-3', 'quiet-pro'] : /手表|运动/.test(query) ? ['fit-watch-3', 'quiet-pro', 'air-14'] : ['air-14', 'quiet-pro', 'one-pro'];

  async function getRecommendations(query) {
    if (config.useRemoteService) {
      const response = await fetch(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      if (!response.ok) throw new Error('Recommendation API request failed');
      return response.json();
    }
    return idsForQuery(query).map(id => window.productCatalog.find(product => product.id === id));
  }

  return { getRecommendations, getProduct: id => window.productCatalog.find(product => product.id === id), config };
})();
