(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var rawChannel = params.get('channel') || params.get('category') || '';
  var originalQuery = params.get('q') || rawChannel.replace(/;$/, '') || '\u8d2d\u7269\u63a8\u8350';
  var service = window.shoppingFilterService;
  var key = service.channelKey(rawChannel || originalQuery);
  var config = service.channels[key] || {
    label: rawChannel.replace(/;$/, '') || '\u7cbe\u9009\u8d2d\u7269',
    groups: [
      { key: 'type', label: '\u7c7b\u522b', options: ['\u65e5\u5e38', '\u8fdb\u9636', '\u793c\u7269', '\u70ed\u95e8'] },
      { key: 'budget', label: '\u4ef7\u683c', options: ['300\u4ee5\u4e0b', '300-1000', '1000+'] },
      { key: 'priority', label: '\u504f\u597d', options: ['\u6027\u4ef7\u6bd4', '\u54c1\u8d28', '\u989c\u503c', '\u5b9e\u7528'] }
    ]
  };
  var values = service.autoSelections(originalQuery, config);
  var groups = document.querySelector('#filterGroups');
  var submit = document.querySelector('#filterSubmit');
  var summary = document.querySelector('#selectionSummary');

  document.querySelector('#channelName').textContent = config.label + '\u9891\u9053';
  document.querySelector('#originalQuery').textContent = originalQuery;

  function selectedValues() {
    return Object.keys(values).map(function (name) { return values[name]; }).filter(Boolean);
  }

  function refresh() {
    var selected = selectedValues();
    submit.disabled = selected.length === 0;
    summary.textContent = selected.length ? selected.join(' \u00b7 ') : '\u8bf7\u9009\u62e9\u81f3\u5c11\u4e00\u4e2a\u7b5b\u9009\u6807\u7b7e';
  }

  config.groups.forEach(function (group, index) {
    var section = document.createElement('section');
    section.className = 'filter-group';
    var title = document.createElement('h3');
    title.textContent = String(index + 1).padStart(2, '0') + ' ' + group.label;
    var options = document.createElement('div');
    options.className = 'filter-options';
    options.setAttribute('role', 'group');
    options.setAttribute('aria-label', group.label);
    group.options.forEach(function (value) {
      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'filter-option' + (values[group.key] === value ? ' is-selected' : '');
      option.textContent = value;
      option.addEventListener('click', function () {
        values[group.key] = values[group.key] === value ? '' : value;
        options.querySelectorAll('.filter-option').forEach(function (button) {
          button.classList.toggle('is-selected', button === option && values[group.key] === value);
        });
        refresh();
      });
      options.appendChild(option);
    });
    section.appendChild(title);
    section.appendChild(options);
    groups.appendChild(section);
  });

  function budgetText(value) {
    if (!value) return '';
    var range = value.match(/(\d+)-(\d+)/);
    if (range) return '\u9884\u7b97' + range[2] + '\u5143\u4ee5\u5185';
    if (value.indexOf('+') !== -1) return '\u9884\u7b97' + value.replace(/\D/g, '') + '\u5143\u4ee5\u4e0a';
    return '\u9884\u7b97' + value.replace(/\D/g, '') + '\u5143\u4ee5\u5185';
  }

  document.querySelector('#channelFilterForm').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!selectedValues().length) return;
    var extra = document.querySelector('#extraRequirement').value.trim();
    var finalQuery = [originalQuery, config.label].concat(selectedValues()).concat(extra ? [extra] : []).join('\uff0c');
    var usage = values.usage || values.type || values.style || values.taste || values.need || '';
    var priority = values.brand || values.style || values.taste || values.need || values.priority || '';
    var result = {
      query: finalQuery,
      originalQuery: originalQuery,
      category: config.label,
      budget: budgetText(values.budget),
      usage: usage,
      priority: priority,
      channelFilters: Object.assign({}, values)
    };
    window.localStorage.setItem('clarificationResult', JSON.stringify(result));
    window.localStorage.setItem('shoppingClarification', JSON.stringify(result));
    window.sessionStorage.setItem('shoppingChannelFilters', JSON.stringify(result));
    window.sessionStorage.setItem('shoppingRecommendationEntry', JSON.stringify({ source: 'channel_filter', query: finalQuery, candidates: [] }));
    submit.disabled = true;
    submit.textContent = '\u6b63\u5728\u5339\u914d...';
    window.location.href = 'result.html?q=' + encodeURIComponent(finalQuery);
  });

  refresh();
}());
