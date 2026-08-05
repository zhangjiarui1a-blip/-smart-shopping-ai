(function () {
  'use strict';

  var directTerms = ['\u72d7\u7cae', '\u732b\u7cae', '\u96f6\u98df', '\u98df\u54c1', '\u73a9\u5177', '\u5ba0\u7269', '\u732b', '\u72d7'];
  var computerTerms = ['\u7535\u8111', '\u7b14\u8bb0\u672c', '\u53f0\u5f0f'];
  var budgetPattern = /\d{3,7}\s*\u5143|\u9884\u7b97|\u4ee5\u5185|\u4e0d\u8d85\u8fc7/;
  var usageTerms = ['\u529e\u516c', '\u5b66\u4e60', '\u6e38\u620f', '\u8bbe\u8ba1', '\u526a\u8f91', '\u901a\u52e4', '\u65c5\u884c'];

  function includesAny(text, terms) {
    return terms.some(function (term) { return text.indexOf(term) !== -1; });
  }

  function evaluate(query) {
    var cleanQuery = String(query || '').trim();
    var isComputer = includesAny(cleanQuery, computerTerms);
    var hasBudget = budgetPattern.test(cleanQuery);
    var hasUsage = includesAny(cleanQuery, usageTerms);
    var isDirectPetRequest = includesAny(cleanQuery, directTerms);
    var needClarification = isComputer && !isDirectPetRequest && (!hasBudget || !hasUsage);

    return {
      needClarification: needClarification,
      questions: needClarification ? ['\u9884\u7b97\u662f\u591a\u5c11\uff1f', '\u4e3b\u8981\u7528\u9014\uff1f', '\u54c1\u724c\u504f\u597d\uff1f'] : [],
      query: cleanQuery
    };
  }

  window.clarificationService = { evaluate: evaluate };
}());
