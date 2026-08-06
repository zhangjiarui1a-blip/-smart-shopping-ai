(function () {
  'use strict';

  function hasChinese(value) {
    return /[\u4e00-\u9fff]/.test(String(value || ''));
  }

  function displayName(product) {
    var item = product || {};
    if (item.name_cn) return item.name_cn;
    if (hasChinese(item.title)) return item.title;
    return item.name || item.english_name || '\u672a\u547d\u540d\u5546\u54c1';
  }

  function toDisplayProduct(product) {
    var item = product || {};
    return Object.assign({}, item, { displayName: displayName(item) });
  }

  window.productDisplayService = {
    displayName: displayName,
    toDisplayProduct: toDisplayProduct
  };
}());
