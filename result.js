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
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character];
    });
  }

  function safeImageClass(value) {
    return /^(laptop|headphones|phone|watch)$/.test(value) ? value : 'laptop';
  }

  function numberFromPrice(value) {
    var number = String(value == null ? '' : value).replace(/[^0-9.]/g, '');
    return number ? Number(number) : null;
  }

  function formatPrice(value) {
    var price = numberFromPrice(value);
    if (price === null) return String(value || '\u4ee5\u5b9e\u65f6\u4ef7\u683c\u4e3a\u51c6');
    return '\u00a5' + price.toLocaleString('zh-CN');
  }

  function renderList(values, fallback) {
    var items = Array.isArray(values) && values.length ? values : [fallback || '\u6682\u65e0\u989d\u5916\u4fe1\u606f'];
    return '<ul>' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function renderTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return '';
    return '<div class="result-tags">' + tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('') + '</div>';
  }

  function extractBudget(text) {
    var match = String(text || '').match(/(?:\u9884\u7b97|\u4e0d\u8d85\u8fc7|\u4ee5\u5185|\u5143\u5185)[^0-9]{0,8}(\d{3,7})/) || String(text || '').match(/(\d{3,7})\s*\u5143/);
    return match ? Number(match[1]) : null;
  }

  function inferScenario(text) {
    var source = String(text || '');
    var rules = [
      [/\u6e38\u620f|\u5f00\u9ed1|\u7ade\u6280/, '\u6e38\u620f\u4e0e\u9ad8\u6027\u80fd\u4f7f\u7528'],
      [/\u901a\u52e4|\u51fa\u5dee|\u65c5\u884c/, '\u901a\u52e4\u3001\u51fa\u5dee\u6216\u65c5\u884c'],
      [/\u529e\u516c|\u5b66\u4e60|\u4e0a\u8bfe|\u7b14\u8bb0/, '\u65e5\u5e38\u529e\u516c\u4e0e\u5b66\u4e60'],
      [/\u62cd\u7167|\u5f71\u50cf|\u4eba\u50cf/, '\u62cd\u7167\u4e0e\u5f71\u50cf\u8bb0\u5f55'],
      [/\u5ba0\u7269|\u732b|\u72d7/, '\u5ba0\u7269\u65e5\u5e38\u996e\u98df\u4e0e\u62a4\u7406'],
      [/\u793c\u7269|\u9001\u793c|\u751f\u65e5/, '\u9001\u793c\u4e0e\u7eaa\u5ff5\u573a\u666f']
    ];

    for (var i = 0; i < rules.length; i += 1) {
      if (rules[i][0].test(source)) return rules[i][1];
    }
    return '\u7ed3\u5408\u4f7f\u7528\u573a\u666f\u8fdb\u884c\u7efc\u5408\u9009\u8d2d';
  }

  function decisionLabel(score) {
    if (score >= 90) return '\u503c\u5f97\u4f18\u5148\u8d2d\u4e70';
    if (score >= 80) return '\u503c\u5f97\u8ba4\u771f\u8003\u8651';
    return '\u5efa\u8bae\u6bd4\u8f83\u540e\u8d2d\u4e70';
  }

  function buildReport(userQuery, products) {
    var primary = products[0] || {};
    var score = Math.max(0, Math.min(100, Number(primary.score) || 80));
    var budget = extractBudget(userQuery);
    var coreNeeds = Array.isArray(primary.tags) && primary.tags.length
      ? primary.tags.slice(0, 3)
      : [primary.category || primary.type || '\u7efc\u5408\u4f53\u9a8c'];
    var primaryPrice = numberFromPrice(primary.price);
    var budgetAssessment = budget && primaryPrice !== null
      ? (primaryPrice <= budget ? '\u9996\u9009\u5546\u54c1\u672a\u8d85\u51fa\u4f60\u7684\u9884\u7b97\u3002' : '\u9996\u9009\u5546\u54c1\u8d85\u51fa\u4e86\u4f60\u7684\u9884\u7b97\uff0c\u8bf7\u8c28\u614e\u6bd4\u8f83\u3002')
      : '\u672a\u63d0\u4f9b\u660e\u786e\u9884\u7b97\uff0c\u5efa\u8bae\u8d2d\u4e70\u524d\u4ee5\u5b9e\u65f6\u4ef7\u683c\u4e3a\u51c6\u3002';

    return {
      requirement: {
        budget: budget ? '\u00a5' + budget.toLocaleString('zh-CN') : '\u672a\u8bbe\u5b9a',
        scenario: inferScenario(userQuery),
        coreNeeds: coreNeeds
      },
      reason: primary.reason || primary.description || '\u6839\u636e\u5546\u54c1\u4fe1\u606f\u4e0e\u4f60\u7684\u9700\u6c42\u8fdb\u884c\u5339\u914d\u3002',
      pros: primary.pros || [],
      cons: primary.cons || [],
      worthiness: {
        label: decisionLabel(score),
        text: budgetAssessment,
        score: score
      },
      alternatives: products.slice(1, 3)
    };
  }

  function renderDecisionReport(report) {
    var alternatives = report.alternatives.length
      ? report.alternatives.map(function (item) {
        return '<a class="alternative-item" href="detail.html?id=' + encodeURIComponent(item.id || '') + '">' +
          '<span>' + escapeHtml(item.name || '\u66ff\u4ee3\u5546\u54c1') + '</span><b>' + escapeHtml(formatPrice(item.price)) + '</b>' +
          '<small>' + escapeHtml(item.reason || item.description || '\u53ef\u4f5c\u4e3a\u66ff\u4ee3\u9009\u62e9\u3002') + '</small></a>';
      }).join('')
      : '<p class="report-empty">\u6682\u65e0\u5176\u4ed6\u540c\u7c7b\u66ff\u4ee3\u9009\u62e9\u3002</p>';

    return '<div class="decision-report__heading"><p class="eyebrow">AI PURCHASE DECISION</p><h2>AI \u8d2d\u4e70\u51b3\u7b56\u62a5\u544a</h2></div>' +
      '<div class="requirement-summary"><div><span>\u9884\u7b97</span><strong>' + escapeHtml(report.requirement.budget) + '</strong></div>' +
      '<div><span>\u4f7f\u7528\u573a\u666f</span><strong>' + escapeHtml(report.requirement.scenario) + '</strong></div>' +
      '<div><span>\u6838\u5fc3\u9700\u6c42</span><strong>' + escapeHtml(report.requirement.coreNeeds.join(' \u00b7 ')) + '</strong></div></div>' +
      '<div class="report-grid"><article class="report-card report-card--reason"><span>01</span><h3>AI \u63a8\u8350\u7406\u7531</h3><p>' + escapeHtml(report.reason) + '</p></article>' +
      '<article class="report-card"><span>02</span><h3>\u4f18\u70b9</h3>' + renderList(report.pros, '\u8be6\u60c5\u8bf7\u53c2\u8003\u5546\u54c1\u53c2\u6570') + '</article>' +
      '<article class="report-card"><span>03</span><h3>\u7f3a\u70b9\u4e0e\u98ce\u9669</h3>' + renderList(report.cons, '\u8d2d\u4e70\u524d\u8bf7\u6838\u5bf9\u8be6\u7ec6\u89c4\u683c') + '</article></div>' +
      '<article class="purchase-decision"><div><p>\u662f\u5426\u503c\u5f97\u8d2d\u4e70</p><h3>' + escapeHtml(report.worthiness.label) + '</h3><span>\u63a8\u8350\u6307\u6570 ' + report.worthiness.score + '</span></div><p>' + escapeHtml(report.worthiness.text) + '</p></article>' +
      '<section class="alternatives"><div><p class="eyebrow">ALTERNATIVES</p><h3>\u66ff\u4ee3\u9009\u62e9</h3></div><div class="alternative-list">' + alternatives + '</div></section>';
  }

  function renderLoading(target) {
    var index = 0;
    target.innerHTML = '<section class="ai-loading" role="status"><span class="ai-loading-orb" aria-hidden="true"><i></i><i></i><i></i></span><div><p class="eyebrow">NOVA AI</p><h3 data-loading-message></h3><p>\u4e3a\u4f60\u7b5b\u9009\u66f4\u5339\u914d\u7684\u5546\u54c1\u9009\u62e9</p></div></section>';
    var message = target.querySelector('[data-loading-message]');
    message.textContent = loadingMessages[index];
    return window.setInterval(function () {
      index = (index + 1) % loadingMessages.length;
      message.textContent = loadingMessages[index];
    }, 1100);
  }

  function renderAlert(type, title, detail) {
    return '<section class="recommendation-alert recommendation-alert--' + type + '" role="status"><strong>' + escapeHtml(title) + '</strong>' +
      (detail ? '<span>' + escapeHtml(detail) + '</span>' : '') + '</section>';
  }

  function renderProduct(product, index) {
    var item = product || {};
    var score = Math.max(0, Math.min(100, Number(item.score) || 80));
    return '<article class="recommendation-card"><div class="result-image ' + safeImageClass(item.image) + '"></div><div class="result-main">' +
      '<div class="result-meta"><span class="result-type">' + (index === 0 ? 'AI \u9996\u9009 \u00b7 ' : '') + escapeHtml(item.type || item.category || '\u5546\u54c1\u63a8\u8350') + '</span><span class="score">\u63a8\u8350\u6307\u6570 ' + score + '</span></div>' +
      '<h4>' + escapeHtml(item.name || '\u672a\u547d\u540d\u5546\u54c1') + '</h4><strong class="result-price">' + escapeHtml(formatPrice(item.price)) + '</strong>' + renderTags(item.tags) +
      '<div class="result-reason"><b>\u63a8\u8350\u7406\u7531</b><p>' + escapeHtml(item.reason || item.description || '\u7ed3\u5408\u9700\u6c42\u8fdb\u884c\u7b5b\u9009\u3002') + '</p></div>' +
      '<div class="result-details"><div><b>\u4f18\u70b9</b>' + renderList(item.pros) + '</div><div><b>\u6ce8\u610f\u70b9</b>' + renderList(item.cons) + '</div></div>' +
      '<p class="audience"><b>\u9002\u5408\u4eba\u7fa4\uff1a</b>' + escapeHtml(item.people || item.suitableFor || '\u5e0c\u671b\u6839\u636e\u9700\u6c42\u7b5b\u9009\u7684\u7528\u6237') + '</p>' +
      '<div class="buy-links"><a href="detail.html?id=' + encodeURIComponent(item.id || '') + '">\u67e5\u770b\u8be6\u60c5</a><button type="button" data-store="\u4eac\u4e1c">\u4eac\u4e1c\u8d2d\u4e70</button><button type="button" data-store="\u6dd8\u5b9d">\u6dd8\u5b9d\u8d2d\u4e70</button></div></div></article>';
  }

  async function render() {
    var target = document.querySelector('#recommendationResult');
    var reportTarget = document.querySelector('#decisionReport');
    document.querySelector('#querySummary').textContent = '\u4f60\u7684\u9700\u6c42\uff1a' + query;
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

      reportTarget.innerHTML = renderDecisionReport(buildReport(query, products));
      reportTarget.hidden = false;
      target.innerHTML = alerts + '<div class="result-intro"><p>AI \u7b5b\u9009\u7ed3\u679c \u00b7 ' + (result.source === 'ai' ? '\u771f\u5b9e\u6a21\u578b\u7ed3\u679c' : '\u5019\u9009\u5546\u54c1\u793a\u4f8b') + '</p><h3>\u4e3a\u4f60\u7b5b\u9009\u51fa ' + products.length + ' \u4e2a\u4f18\u5148\u9009\u62e9</h3></div><div class="result-list">' + products.map(renderProduct).join('') + '</div><p class="result-note">\u5546\u54c1\u4ef7\u683c\u548c\u8d2d\u4e70\u5165\u53e3\u8bf7\u4ee5\u5e73\u53f0\u5b9e\u9645\u4fe1\u606f\u4e3a\u51c6\u3002</p>';

      target.querySelectorAll('[data-store]').forEach(function (button) {
        button.addEventListener('click', function () { button.textContent = button.dataset.store + '\u5165\u53e3\uff08\u6a21\u62df\uff09'; });
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
