(function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  var rawChannel = params.get('channel') || params.get('category') || '';
  var originalQuery = params.get('q') || rawChannel || '购物推荐';
  var service = window.shoppingFilterService;
  var key = service.channelKey(rawChannel || originalQuery);
  var config = service.channels[key] || { label: rawChannel || '精选购物', groups: [] };
  var values = service.autoSelections(originalQuery, config);
  var groups = document.querySelector('#filterGroups');
  var submit = document.querySelector('#filterSubmit');
  var summary = document.querySelector('#selectionSummary');
  var sortOptions = [
    { key: 'all', label: '综合' }, { key: 'sales', label: '销量' }, { key: 'price', label: '价格' },
    { key: 'new', label: '新品' }, { key: 'ai', label: 'AI推荐' }
  ];
  var selectedSort = 'all';
  var channelProducts = (window.commerceProducts || []).filter(function (product) { return product.category === key; });

  document.querySelector('#channelName').textContent = config.label + '频道';
  document.querySelector('#originalQuery').textContent = originalQuery;
  document.querySelector('#channelDescription').textContent = '专属筛选标签和商品排序，帮你更快逛到适合的选择。';

  function salesNumber(value) { return Number(String(value).replace(/[^\d.]/g, '')) || 0; }
  function renderProducts() {
    var products = channelProducts.slice();
    if (selectedSort === 'sales') products.sort(function (a, b) { return salesNumber(b.sales) - salesNumber(a.sales); });
    if (selectedSort === 'price') products.sort(function (a, b) { return a.price - b.price; });
    if (selectedSort === 'new') products.sort(function (a, b) { return b.id.localeCompare(a.id); });
    if (selectedSort === 'ai') products.sort(function (a, b) { return String(b.tag).indexOf('AI') - String(a.tag).indexOf('AI'); });
    document.querySelector('#channelProducts').innerHTML = products.length ? products.map(function (product) {
      return '<a href="detail.html?id=' + product.id + '"><div class="channel-product-image ' + product.image + '"></div><span>' + product.tag + '</span><h3>' + product.name + '</h3><strong>¥' + product.price.toLocaleString() + '</strong><small>已售 ' + product.sales + ' · ' + product.reason + '</small></a>';
    }).join('') : '<div class="channel-products__empty">该频道的精选商品正在上新，先用筛选标签告诉 AI 你的需求吧。</div>';
  }
  document.querySelector('#channelSort').innerHTML = sortOptions.map(function (item) {
    return '<button type="button" data-sort="' + item.key + '" class="' + (item.key === selectedSort ? 'is-active' : '') + '">' + item.label + '</button>';
  }).join('');
  document.querySelector('#channelSort').addEventListener('click', function (event) {
    var button = event.target.closest('[data-sort]');
    if (!button) return;
    selectedSort = button.dataset.sort;
    document.querySelectorAll('#channelSort button').forEach(function (item) { item.classList.toggle('is-active', item === button); });
    renderProducts();
  });

  function selectedValues() { return Object.keys(values).map(function (name) { return values[name]; }).filter(Boolean); }
  function refresh() {
    var selected = selectedValues();
    submit.disabled = selected.length === 0;
    summary.textContent = selected.length ? selected.join(' · ') : '请选择至少一个筛选标签';
  }
  (config.groups || []).forEach(function (group, index) {
    var section = document.createElement('section'); section.className = 'filter-group';
    var title = document.createElement('h3'); title.textContent = String(index + 1).padStart(2, '0') + ' ' + group.label;
    var options = document.createElement('div'); options.className = 'filter-options';
    group.options.forEach(function (value) {
      var option = document.createElement('button'); option.type = 'button'; option.className = 'filter-option' + (values[group.key] === value ? ' is-selected' : ''); option.textContent = value;
      option.addEventListener('click', function () { values[group.key] = values[group.key] === value ? '' : value; options.querySelectorAll('.filter-option').forEach(function (item) { item.classList.toggle('is-selected', item === option && values[group.key] === value); }); refresh(); });
      options.appendChild(option);
    });
    section.appendChild(title); section.appendChild(options); groups.appendChild(section);
  });
  function budgetText(value) { if (!value) return ''; var range = value.match(/(\d+)-(\d+)/); if (range) return '预算' + range[2] + '元以内'; return '预算' + value.replace(/\D/g, '') + (value.indexOf('+') !== -1 ? '元以上' : '元以内'); }
  document.querySelector('#channelFilterForm').addEventListener('submit', function (event) {
    event.preventDefault(); if (!selectedValues().length) return;
    var extra = document.querySelector('#extraRequirement').value.trim();
    var finalQuery = [originalQuery, config.label].concat(selectedValues()).concat(extra ? [extra] : []).join('，');
    var result = { query: finalQuery, originalQuery: originalQuery, category: config.label, budget: budgetText(values.budget), usage: values.usage || values.scene || values.type || '', priority: values.performance || values.brand || values.style || values.need || '', channelFilters: Object.assign({}, values) };
    window.localStorage.setItem('clarificationResult', JSON.stringify(result));
    window.localStorage.setItem('shoppingClarification', JSON.stringify(result));
    window.sessionStorage.setItem('shoppingChannelFilters', JSON.stringify(result));
    window.sessionStorage.setItem('shoppingRecommendationEntry', JSON.stringify({ source: 'channel_filter', query: finalQuery, candidates: [] }));
    submit.disabled = true; submit.textContent = '正在匹配...'; window.router.go('result.html?q=' + encodeURIComponent(finalQuery));
  });
  renderProducts(); refresh();
}());
