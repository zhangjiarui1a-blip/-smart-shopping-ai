(function () {
  'use strict';

  var defaultQuery = '\u9884\u7b97 5000 \u5143\uff0c\u63a8\u8350\u4e00\u53f0\u8f7b\u8584\u7b14\u8bb0\u672c';
  var query = new URLSearchParams(window.location.search).get('q') || defaultQuery;
  var form = document.querySelector('#clarificationForm');
  var submit = document.querySelector('#continueButton');
  var hint = document.querySelector('#clarifyHint');
  var values = { query: query, budget: '', usage: '', priority: '' };

  if (/\u6444\u5f71|\u76f8\u673a/.test(query)) {
    var experienceField = document.querySelector('[data-field="priority"]');
    experienceField.querySelector('legend').textContent = '03 \u7ecf\u9a8c';
    experienceField.querySelector('p').textContent = '\u4f60\u76ee\u524d\u7684\u6444\u5f71\u7ecf\u9a8c\u5982\u4f55\uff1f';
    var experienceOptions = experienceField.querySelector('.clarify-options');
    experienceOptions.innerHTML = '<button type="button" data-value="\u6444\u5f71\u65b0\u624b">\u65b0\u624b</button>' +
      '<button type="button" data-value="\u6444\u5f71\u8fdb\u9636">\u8fdb\u9636</button>' +
      '<button type="button" data-value="\u6444\u5f71\u4e13\u4e1a">\u4e13\u4e1a</button>';
    experienceField.querySelector('[data-custom-field]').placeholder = '\u6216\u8f93\u5165\u4f60\u7684\u6444\u5f71\u7ecf\u9a8c';
  }

  function entryForQuery() {
    try {
      var saved = JSON.parse(window.sessionStorage.getItem('shoppingRecommendationEntry') || 'null');
      if (saved && saved.query === query && Array.isArray(saved.candidates)) return saved;
    } catch (error) {
      console.warn('[ENTRY] unable to read saved entry', error);
    }
    return { source: 'search', query: query, candidates: [] };
  }

  document.querySelector('#originalQuery').textContent = query;

  function updateSubmitState() {
    var complete = values.budget && values.usage && values.priority;
    submit.disabled = !complete;
    hint.textContent = complete ? '\u4fe1\u606f\u5df2\u5b8c\u6574\uff0c\u53ef\u4ee5\u751f\u6210\u4e13\u5c5e\u63a8\u8350\u3002' : '\u8bf7\u7ee7\u7eed\u5b8c\u6210\u4e09\u9879\u9009\u62e9\u3002';
  }

  document.querySelectorAll('[data-field]').forEach(function (field) {
    var name = field.dataset.field;
    field.querySelectorAll('[data-value]').forEach(function (option) {
      option.addEventListener('click', function () {
        values[name] = option.dataset.value;
        field.querySelectorAll('[data-value]').forEach(function (button) {
          button.classList.toggle('is-selected', button === option);
        });
        var custom = field.querySelector('[data-custom-field]');
        if (custom) custom.value = '';
        updateSubmitState();
      });
    });
    var customInput = field.querySelector('[data-custom-field]');
    if (customInput) customInput.addEventListener('input', function () {
      var value = customInput.value.trim();
      if (value) {
        values[name] = value;
        field.querySelectorAll('[data-value]').forEach(function (button) { button.classList.remove('is-selected'); });
      }
      updateSubmitState();
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!values.budget || !values.usage || !values.priority) return;
    var clarificationResult = { query: query, budget: values.budget, usage: values.usage, priority: values.priority };
    window.localStorage.setItem('clarificationResult', JSON.stringify(clarificationResult));
    window.localStorage.setItem('shoppingClarification', JSON.stringify(clarificationResult));
    window.sessionStorage.setItem('shoppingRecommendationEntry', JSON.stringify(entryForQuery()));
    submit.disabled = true;
    submit.textContent = '\u6b63\u5728\u751f\u6210...';
    window.location.href = 'result.html?q=' + encodeURIComponent(query);
  });
}());
