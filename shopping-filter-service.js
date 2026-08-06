(function () {
  'use strict';

  var CHANNELS = {
    digital: {
      label: '\u6570\u7801\u79d1\u6280',
      terms: ['\u6570\u7801', '\u624b\u673a', '\u7535\u8111', '\u7b14\u8bb0\u672c', '\u5e73\u677f', '\u8033\u673a', '\u76f8\u673a', '\u6444\u5f71', '\u667a\u80fd\u8bbe\u5907'],
      groups: [
        { key: 'type', label: '\u54c1\u7c7b', options: ['\u624b\u673a', '\u7535\u8111', '\u5e73\u677f', '\u8033\u673a', '\u76f8\u673a', '\u667a\u80fd\u8bbe\u5907'] },
        { key: 'brand', label: '\u54c1\u724c', options: ['Apple', '\u534e\u4e3a', '\u5c0f\u7c73', '\u8054\u60f3'] },
        { key: 'budget', label: '\u4ef7\u683c', options: ['1000\u4ee5\u4e0b', '3000-5000', '5000+'] },
        { key: 'performance', label: '\u6027\u80fd', options: ['\u7a33\u5b9a\u65e5\u5e38', '\u6027\u80fd\u4f18\u5148', '\u4e13\u4e1a\u521b\u4f5c'] },
        { key: 'usage', label: '\u7528\u9014', options: ['\u529e\u516c', '\u6e38\u620f', '\u8bbe\u8ba1', '\u6444\u5f71'] }
      ]
    },
    fashion: {
      label: '\u7a7f\u642d\u670d\u9970',
      terms: ['\u7a7f\u642d', '\u670d\u9970', '\u7537\u88c5', '\u5973\u88c5', '\u978b', '\u5305', '\u914d\u9970'],
      groups: [
        { key: 'type', label: '\u7c7b\u522b', options: ['\u7537\u88c5', '\u5973\u88c5', '\u978b\u9774', '\u5305\u888b', '\u914d\u9970'] },
        { key: 'style', label: '\u98ce\u683c', options: ['\u7b80\u7ea6', '\u6f6e\u6d41', '\u8fd0\u52a8', '\u901a\u52e4'] },
        { key: 'budget', label: '\u4ef7\u683c', options: ['300\u4ee5\u4e0b', '300-1000', '1000+'] }
      ]
    },
    food: {
      label: '\u7f8e\u98df\u996e\u54c1',
      terms: ['\u7f8e\u98df', '\u96f6\u98df', '\u98df\u54c1', '\u996e\u6599', '\u575a\u679c', '\u8089\u7c7b', '\u5403'],
      groups: [
        { key: 'type', label: '\u7c7b\u578b', options: ['\u96f6\u98df', '\u996e\u6599', '\u575a\u679c', '\u8089\u7c7b'] },
        { key: 'taste', label: '\u53e3\u5473', options: ['\u8fa3', '\u751c', '\u54b8\u9999', '\u4f4e\u7cd6'] },
        { key: 'scene', label: '\u573a\u666f', options: ['\u8ffd\u5267', '\u529e\u516c\u5ba4', '\u901a\u52e4', '\u9001\u793c'] },
        { key: 'budget', label: '\u4ef7\u683c', options: ['100\u4ee5\u4e0b', '100-300', '300+'] }
      ]
    },
    appliance: {
      label: '\u5bb6\u7528\u7535\u5668',
      terms: ['\u5bb6\u7535', '\u7535\u5668', '\u7a7a\u8c03', '\u51b0\u7bb1', '\u6d17\u8863\u673a', '\u5438\u5c18\u5668', '\u53a8\u623f\u7535\u5668'],
      groups: [
        { key: 'type', label: '\u7c7b\u522b', options: ['\u6e05\u6d01\u7535\u5668', '\u53a8\u623f\u7535\u5668', '\u5927\u5bb6\u7535', '\u5f71\u97f3\u7535\u5668'] },
        { key: 'need', label: '\u9700\u6c42', options: ['\u8282\u80fd', '\u667a\u80fd', '\u5c0f\u6237\u578b', '\u5927\u5bb9\u91cf'] },
        { key: 'budget', label: '\u4ef7\u683c', options: ['1000\u4ee5\u4e0b', '1000-5000', '5000+'] }
      ]
    },
    collectibles: {
      label: '\u6f6e\u73a9\u6536\u85cf',
      terms: ['\u6f6e\u73a9', '\u6536\u85cf', '\u624b\u529e', '\u76f2\u76d2', '\u6a21\u578b'],
      groups: [
        { key: 'type', label: '\u7c7b\u522b', options: ['\u624b\u529e', '\u76f2\u76d2', '\u6a21\u578b', '\u827a\u672f\u73a9\u5177'] },
        { key: 'style', label: '\u504f\u597d', options: ['\u70ed\u95e8IP', '\u9650\u5b9a', '\u53ef\u7231', '\u673a\u7532'] },
        { key: 'budget', label: '\u4ef7\u683c', options: ['300\u4ee5\u4e0b', '300-1000', '1000+'] }
      ]
    }
  };

  var LABEL_ALIASES = {
    '\u6570\u7801\u79d1\u6280': 'digital',
    '\u7a7f\u642d\u670d\u9970': 'fashion',
    '\u7f8e\u98df\u996e\u54c1': 'food',
    '\u5bb6\u7528\u7535\u5668': 'appliance',
    '\u6f6e\u73a9\u6536\u85cf': 'collectibles'
  };
  var budgetPattern = /\d{2,7}\s*\u5143|\u9884\u7b97|\u4ee5\u5185|\u4e0d\u8d85\u8fc7/;
  var detailTerms = ['\u529e\u516c', '\u6e38\u620f', '\u8bbe\u8ba1', '\u901a\u52e4', '\u5b66\u4e60', '\u65e5\u5e38', '\u9001\u793c', '\u751f\u65e5', '\u4f4e\u7cd6', '\u8fa3', '\u751c', '\u7b80\u7ea6', '\u6f6e\u6d41', '\u8fd0\u52a8'];

  function includesAny(text, terms) {
    return terms.some(function (term) { return text.indexOf(term) !== -1; });
  }

  function channelKey(value) {
    var clean = String(value || '').replace(/;$/, '');
    if (CHANNELS[clean]) return clean;
    if (LABEL_ALIASES[clean]) return LABEL_ALIASES[clean];
    return Object.keys(CHANNELS).find(function (key) {
      return includesAny(clean, CHANNELS[key].terms);
    }) || '';
  }

  function isComplete(query) {
    var text = String(query || '');
    return budgetPattern.test(text) && includesAny(text, detailTerms);
  }

  function isComplex(query) {
    var text = String(query || '');
    var highValue = text.match(/(\d{4,7})\s*\u5143/);
    return includesAny(text, ['\u6444\u5f71\u8bbe\u5907', '\u6444\u5f71\u5168\u5957', '\u76f8\u673a\u5168\u5957', '\u6c7d\u8f66', '\u88c5\u4fee', '\u5168\u5c4b']) ||
      (highValue && Number(highValue[1]) >= 10000);
  }

  function autoSelections(query, config) {
    var text = String(query || '');
    var selections = {};
    (config.groups || []).forEach(function (group) {
      var found = group.options.find(function (option) {
        return text.toLowerCase().indexOf(option.toLowerCase()) !== -1;
      });
      if (found) selections[group.key] = found;
    });
    var numberMatch = text.match(/(\d{2,7})\s*\u5143/);
    if (numberMatch && config.groups.some(function (group) { return group.key === 'budget'; })) {
      var amount = Number(numberMatch[1]);
      var options = config.groups.filter(function (group) { return group.key === 'budget'; })[0].options;
      selections.budget = options.find(function (option) {
        if (option.indexOf('+') !== -1) return amount >= Number(option.replace(/\D/g, ''));
        var range = option.match(/(\d+)-(\d+)/);
        if (range) return amount >= Number(range[1]) && amount <= Number(range[2]);
        if (option.indexOf('\u4ee5\u4e0b') !== -1) return amount <= Number(option.replace(/\D/g, ''));
        return false;
      }) || selections.budget;
    }
    return selections;
  }

  function decide(query, options) {
    var cleanQuery = String(query || '').trim();
    var source = options && options.source ? options.source : 'search';
    var key = channelKey((options && options.category) || cleanQuery);
    if (source === 'category' || source === 'ai_discovery') return { mode: 'channel', channel: key, query: cleanQuery };
    if (isComplex(cleanQuery)) return { mode: 'clarify', channel: key, query: cleanQuery };
    if (key && !isComplete(cleanQuery)) return { mode: 'channel', channel: key, query: cleanQuery };
    return { mode: 'direct', channel: key, query: cleanQuery };
  }

  window.shoppingFilterService = {
    channels: CHANNELS,
    channelKey: channelKey,
    isComplete: isComplete,
    autoSelections: autoSelections,
    decide: decide
  };
}());
