(function () {
  'use strict';
  var type = document.body.dataset.promotion;
  var rules = {
    subsidy: { ids: ['home-clean', 'air-14', 'nova-phone'], title: '国补专区', subtitle: '家电数码换新，补贴好价一次看清。' },
    special: { ids: ['snack-box', 'sport-bottle', 'home-lamp', 'style-bag'], title: '特价好物', subtitle: '精选低价好物，每天发现一点值得。' },
    flash: { ids: ['home-clean', 'classic-watch', 'style-bag', 'snack-box'], title: '限时折扣', subtitle: '折扣力度已标明，趁好价做出更明智的选择。' },
    summer: { ids: ['style-bag', 'sport-bottle', 'snack-box', 'home-lamp'], title: '夏日新品', subtitle: '轻盈、清爽、提前入手的夏日好物。' }
  };
  var config = rules[type] || rules.special;
  document.querySelector('#promotionTitle').textContent = config.title;
  document.querySelector('#promotionSubtitle').textContent = config.subtitle;
  var products = config.ids.map(function (id) {
    return (window.commerceProducts || []).find(function (product) { return product.id === id; });
  }).filter(Boolean);
  document.querySelector('#promotionGrid').innerHTML = products.map(function (product) {
    var saved = product.originalPrice - product.price;
    return '<a class="promotion-card" href="detail.html?id=' + product.id + '"><div class="promotion-image ' + product.image + '"></div><span>' + product.tag + '</span><h2>' + product.name + '</h2><div class="price-row"><strong>¥' + product.price.toLocaleString() + '</strong><del>¥' + product.originalPrice.toLocaleString() + '</del></div><b class="saving">立省 ¥' + saved.toLocaleString() + '</b><small>已售 ' + product.sales + ' · ' + product.reason + '</small></a>';
  }).join('');
}());
