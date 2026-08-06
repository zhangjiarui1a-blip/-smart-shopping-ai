const form = document.querySelector('#assistantForm');
const input = document.querySelector('#recommendationInput');
const button = document.querySelector('#recommendButton');
let entrySource = 'search';

input.placeholder = '\u63cf\u8ff0\u4f60\u7684\u9700\u6c42\uff0cAI\u5e2e\u4f60\u505a\u9009\u62e9';

function beginRecommendation(source, query) {
  const cleanQuery = String(query || '').trim();
  const clarification = window.clarificationService
    ? window.clarificationService.evaluate(cleanQuery)
    : { needClarification: false, questions: [], query: cleanQuery };
  const entry = { source, query: cleanQuery, candidates: [] };
  window.sessionStorage.setItem('shoppingRecommendationEntry', JSON.stringify(entry));
  window.sessionStorage.setItem('shoppingClarificationDecision', JSON.stringify(clarification));
  console.info('[ENTRY] source=', entry.source);
  console.info('[ENTRY] query=', entry.query);
  console.info('[ENTRY] candidates length=', entry.candidates.length);
  window.location.href = `${clarification.needClarification ? 'clarification.html' : 'result.html'}?q=${encodeURIComponent(entry.query)}`;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const query = input.value.trim() || '预算 5000 元，推荐一台轻薄笔记本';
  button.disabled = true;
  button.querySelector('span').textContent = '分析中';
  window.setTimeout(() => {
    beginRecommendation(entrySource, query);
  }, 320);
});

document.querySelectorAll('[data-prompt]').forEach(chip => {
  chip.addEventListener('click', () => {
    entrySource = 'quick_prompt';
    input.value = chip.dataset.prompt;
    form.requestSubmit();
  });
});

document.querySelectorAll('.categories a').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const query = new URL(link.href).searchParams.get('q') || link.textContent.trim();
    beginRecommendation('category', query);
  });
});
