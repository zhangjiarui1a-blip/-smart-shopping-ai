(function () {
  'use strict';

  var endpoint = String(window.RECOMMENDATIONS_API_URL || '').trim();

  async function request(payload) {
    if (!endpoint) throw new Error('window.RECOMMENDATIONS_API_URL is not configured');

    console.info('[AI REQUEST]', {
      url: endpoint,
      query: payload.query,
      candidateCount: Array.isArray(payload.candidates) ? payload.candidates.length : 0
    });

    var response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      error.code = error.code || 'NETWORK_ERROR';
      throw error;
    }

    var text = await response.text();
    var data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      var parseError = new Error('recommendations response is not valid JSON');
      parseError.code = 'INVALID_RESPONSE';
      throw parseError;
    }

    console.info('[AI RESPONSE]', { status: response.status, fallback: data.fallback === true });
    if (!response.ok) {
      var requestError = new Error(data.error || ('recommendations request failed: ' + response.status));
      requestError.code = 'HTTP_ERROR';
      requestError.status = response.status;
      throw requestError;
    }

    return data;
  }

  window.recommendationService = {
    request: request,
    config: { endpoint: endpoint }
  };
}());
