(function () {
  'use strict';

  var defaultQuery = '\u9884\u7b97 5000 \u5143\uff0c\u63a8\u8350\u4e00\u53f0\u8f7b\u8584\u7b14\u8bb0\u672c';
  var query = new URLSearchParams(location.search).get('q') || defaultQuery;
  var loadingMessages = [
    '\u6b63\u5728\u5206\u6790\u4f60\u7684\u9700\u6c42',
    '\u6b63\u5728\u5bf9\u6bd4\u5546\u54c1\u4e0e\u9884\u7b97',
    '\u6b63\u5728\u751f\u6210\u63a8\u8350\u7406\u7531'
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[character];
    });
  }

  function safeImageClass(value) {
    return /^(laptop|headphones|phone|watch)$/.test(value) ? value : 'laptop';
  }

  function renderList(values) {
    var items = Array.isArray(values) && values.length ? values : ['\u6682\u65e0\u989d\u5916\u4fe1\u606f'];
    return '<ul>' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function renderTags(tags) {
    if (!Array.isArray(tags) || !tags.length) {
      return '';
    }

    return '<div class="result-tags">' + tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('') + '</div>';
  }

  function renderLoading(target) {
    var index = 0;
    target.innerHTML = '<section class="ai-loading" role="status">' +
      '<span class="ai-loading-orb" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<div><p class="eyebrow">NOVA AI</p><h3 data-loading-message></h3>' +
      '<p>\u4e3a\u4f60\u7b5b\u9009\u66f4\u5339\u914d\u7684\u5546\u54c1\u9009\u62e9</p></div>' +
      '</section>';

    var message = target.querySelector('[data-loading-message]');
    message.textContent = loadingMessages[index];
    return window.setInterval(function () {
      index = (index + 1) % loadingMessages.length;
      message.textContent = loadingMessages[index];
    }, 1100);
  }

  function renderAlert(type, title, detail) {
    return '<section class="recommendation-alert recommendation-alert--' + type + '" role="status">' +
      '<strong>' + escapeHtml(title) + '</strong>' +
      (detail ? '<span>' + escapeHtml(detail) + '</span>' : '') +
      '</section>';
  }

  function renderProduct(product, index) {
    var item = product || {};
    var name = escapeHtml(item.name || '\u672a\u547d\u540d\u5546\u54c1');
    var category = escapeHtml(item.type || item.category || '\u5546\u54c1\u63a8\u8350');
    var price = escapeHtml(item.price || '\u4ee5\u5e73\u53f0\u5b9e\u65f6\u4ef7\u683c\u4e3a\u51c6');
    var reason = escapeHtml(item.reason || item.description || '\u7ed3\u5408\u4f60\u7684\u9700\u6c42\u4e0e\u4fa7\u9009\u5546\u54c1\u4fe1\u606f\u7b5b\u9009\u3002');
    var people = escapeHtml(item.people || item.suitableFor || '\u5e0c\u671b\u6839\u636e\u9700\u6c42\u4f18\u5148\u7b5b\u9009\u7684\u7528\u6237');
    var score = Math.max(0, Math.min(100, Number(item.score) || 80));

    return '<article class="recommendation-card">' +
      '<div class="result-image ' + safeImageClass(item.image) + '"></div>' +
      '<div class="result-main">' +
      '<div class="result-meta"><span class="result-type">' + (index === 0 ? 'AI \u9996\u9009 \u00b7 ' : '') + category + '</span>' +
      '<span class="score">\u63a8\u8350\u6307\u6570 ' + score + '</span></div>' +
      '<h4>' + name + '</h4>' +
      '<strong class="result-price">' + price + '</strong>' +
      renderTags(item.tags) +
      '<div class="result-reason"><b>\u63a8\u8350\u7406\u7531</b><p>' + reason + '</p></div>' +
      '<div class="result-details"><div><b>\u4f18\u70b9</b>' + renderList(item.pros) + '</div><div><b>\u6ce8\u610f\u70b9</b>' + renderList(item.cons) + '</div></div>' +
      '<p class="audience"><b>\u9002\u5408\u4eba\u7fa4\uff1a</b>' + people + '</p>' +
      '<div class="buy-links"><a href="detail.html?id=' + encodeURIComponent(item.id || '') + '">\u67e5\u770b\u8be6\u60c5</a>' +
      '<button type="button" data-store="\u4eac\u4e1c">\u4eac\u4e1c\u8d2d\u4e70</button>' +
      '<button type="button" data-store="\u6dd8\u5b9d">\u6dd8\u5b9d\u8d2d\u4e70</button></div>' +
      '</div></article>';
  }

  async function render() {
    var target = document.querySelector('#recommendationResult');
    var summary = document.querySelector('#querySummary');
    summary.textContent = '\u4f60\u7684\u9700\u6c42\uff1a' + query;
    var loadingTimer = renderLoading(target);

    try {
      var result = await window.recommendationService.getRecommendations(query);
      var products = Array.isArray(result.products) ? result.products : [];
      window.sessionStorage.setItem('aiRecommendations', JSON.stringify(products));

      var alerts = '';
      if (result.source === 'fallback') {
        alerts += renderAlert('error', '\u6682\u65f6\u65e0\u6cd5\u5b8c\u6210 AI \u5206\u6790', '\u5f53\u524d\u663e\u793a\u5019\u9009\u5546\u54c1\u793a\u4f8b\u3002' + (result.error ? ' ' + result.error : ''));
      } else if (result.candidateSource === 'fallback') {
        alerts += renderAlert('info', '\u5546\u54c1\u5e93\u8fde\u63a5\u5f02\u5e38', '\u5df2\u4f7f\u7528\u672c\u5730\u5019\u9009\u5546\u54c1\u5b8c\u6210 AI \u5206\u6790\u3002');
      }

      if (!products.length) {
        target.innerHTML = alerts + renderAlert('error', '\u672a\u627e\u5230\u5339\u914d\u5546\u54c1', '\u8bf7\u5c1d\u8bd5\u8865\u5145\u9884\u7b97\u3001\u7c7b\u522b\u6216\u4f7f\u7528\u573a\u666f\u3002');
        return;
      }

      target.innerHTML = alerts +
        '<div class="result-intro"><p>AI \u63a8\u8350\u7ed3\u8bba \u00b7 ' + (result.source === 'ai' ? '\u771f\u5b9e\u6a21\u578b\u7ed3\u679c' : '\u5019\u9009\u5546\u54c1\u793a\u4f8b') + '</p>' +
        '<h3>\u4e3a\u4f60\u7b5b\u9009\u51fa ' + products.length + ' \u4e2a\u4f18\u5148\u9009\u62e9</h3></div>' +
        '<div class="result-list">' + products.map(renderProduct).join('') + '</div>' +
        '<p class="result-note">\u5546\u54c1\u4ef7\u683c\u548c\u8d2d\u4e70\u5165\u53e3\u8bf7\u4ee5\u5e73\u53f0\u5b9e\u9645\u4fe1\u606f\u4e3a\u51c6\u3002</p>';

      target.querySelectorAll('[data-store]').forEach(function (button) {
        button.addEventListener('click', function () {
          button.textContent = button.dataset.store + '\u5165\u53e3\uff08\u6a21\u62df\uff09';
        });
      });
    } catch (error) {
      console.error('[result] failed to render recommendations', error);
      target.innerHTML = renderAlert('error', '\u63a8\u8350\u9875\u52a0\u8f7d\u5931\u8d25', '\u8bf7\u8fd4\u56de\u9996\u9875\u540e\u91cd\u65b0\u63d0\u4ea4\u9700\u6c42\u3002');
    } finally {
      window.clearInterval(loadingTimer);
      target.setAttribute('aria-busy', 'false');
    }
  }

  render();
}());
