const form = document.querySelector('#assistantForm');
const input = document.querySelector('#recommendationInput');
const button = document.querySelector('#recommendButton');
let entrySource = 'search';

input.placeholder = '\u63cf\u8ff0\u4f60\u7684\u9700\u6c42\uff0cAI\u5e2e\u4f60\u505a\u9009\u62e9';

function saveEntry(source, query) {
  const entry = { source, query, candidates: [] };
  window.sessionStorage.setItem('shoppingRecommendationEntry', JSON.stringify(entry));
  console.info('[ENTRY] source=', entry.source);
  console.info('[ENTRY] query=', entry.query);
  console.info('[ENTRY] candidates length=', entry.candidates.length);
  return entry;
}

function openChannel(source, query, channel) {
  saveEntry(source, query);
  const params = new URLSearchParams({ channel: channel || '', q: query });
  window.location.href = `channel.html?${params.toString()}`;
}

function openResult(source, query) {
  const entry = saveEntry(source, query);
  window.location.href = `result.html?q=${encodeURIComponent(entry.query)}`;
}

function beginRecommendation(source, query) {
  const cleanQuery = String(query || '').trim();
  if (source === 'product_feed') {
    openResult(source, cleanQuery);
    return;
  }
  const filterDecision = window.shoppingFilterService
    ? window.shoppingFilterService.decide(cleanQuery, { source })
    : { mode: 'direct', channel: '' };

  if (filterDecision.mode === 'channel') {
    openChannel(source, cleanQuery, filterDecision.channel);
    return;
  }

  const entry = saveEntry(source, cleanQuery);
  const route = filterDecision.mode === 'clarify' ? 'clarification.html' : 'result.html';
  window.sessionStorage.setItem('shoppingClarificationDecision', JSON.stringify({
    state: filterDecision.mode === 'clarify' ? 'CLARIFY' : 'INPUT',
    query: cleanQuery,
    source: source
  }));
  window.location.href = `${route}?q=${encodeURIComponent(entry.query)}`;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const query = input.value.trim() || '\u9884\u7b97 5000 \u5143\uff0c\u63a8\u8350\u4e00\u53f0\u8f7b\u8584\u7b14\u8bb0\u672c';
  button.disabled = true;
  button.querySelector('span').textContent = '\u5206\u6790\u4e2d';
  window.setTimeout(() => beginRecommendation(entrySource, query), 240);
});

document.querySelectorAll('[data-prompt]').forEach(chip => {
  chip.addEventListener('click', () => {
    entrySource = 'quick_prompt';
    input.value = chip.dataset.prompt;
    form.requestSubmit();
  });
});

document.querySelectorAll('[data-recommendation-query]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const source = link.classList.contains('idea-card') ? 'ai_discovery' : 'product_feed';
    beginRecommendation(source, link.dataset.recommendationQuery || link.textContent.trim());
  });
});
