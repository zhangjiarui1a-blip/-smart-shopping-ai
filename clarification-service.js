(function () {
  'use strict';

  var shoppingTerms = ['\u7535\u8111', '\u7b14\u8bb0\u672c', '\u624b\u673a', '\u6570\u7801', '\u96f6\u98df', '\u5ba0\u7269', '\u5bb6\u5c45', '\u793c\u7269', '\u4e70', '\u63a8\u8350'];
  var budgetPattern = /\d{3,7}\s*\u5143|\u9884\u7b97|\u4ee5\u5185|\u4e0d\u8d85\u8fc7/;
  var usageTerms = ['\u529e\u516c', '\u5b66\u4e60', '\u6e38\u620f', '\u8bbe\u8ba1', '\u526a\u8f91', '\u901a\u52e4', '\u65c5\u884c'];
  var preferenceTerms = ['\u6027\u80fd', '\u4ef7\u683c', '\u6027\u4ef7\u6bd4', '\u4fbf\u643a', '\u8f7b\u8584', '\u62cd\u7167', '\u7eed\u822a'];

  function includesAny(text, terms) {
    return terms.some(function (term) { return text.indexOf(term) !== -1; });
  }

  function evaluate(query) {
    var cleanQuery = String(query || '').trim();
    var hasBudget = budgetPattern.test(cleanQuery);
    var hasUsage = includesAny(cleanQuery, usageTerms);
    var hasPreference = includesAny(cleanQuery, preferenceTerms);
    var isShoppingRequest = includesAny(cleanQuery, shoppingTerms);
    var detailCount = [hasBudget, hasUsage, hasPreference].filter(Boolean).length;
    var needClarification = isShoppingRequest && detailCount < 2;

    return {
      needClarification: needClarification,
      questions: needClarification ? ['\u9884\u7b97\u662f\u591a\u5c11\uff1f', '\u4e3b\u8981\u7528\u9014\uff1f', '\u54c1\u724c\u504f\u597d\uff1f'] : [],
      query: cleanQuery
    };
  }

  window.clarificationService = { evaluate: evaluate };
}());
