const form = document.querySelector('#assistantForm');
const input = document.querySelector('#recommendationInput');
const button = document.querySelector('#recommendButton');

form.addEventListener('submit', event => {
  event.preventDefault();
  const query = input.value.trim() || '预算 5000 元，推荐一台轻薄笔记本';
  button.disabled = true;
  button.querySelector('span').textContent = '分析中';
  window.setTimeout(() => {
    window.location.href = `result.html?q=${encodeURIComponent(query)}`;
  }, 320);
});

document.querySelectorAll('[data-prompt]').forEach(chip => {
  chip.addEventListener('click', () => {
    input.value = chip.dataset.prompt;
    form.requestSubmit();
  });
});
