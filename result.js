const query = new URLSearchParams(location.search).get('q') || '预算 5000 元，推荐一台轻薄笔记本';
const list = values => `<ul>${values.map(value => `<li>${value}</li>`).join('')}</ul>`;

async function renderRecommendations() {
  document.querySelector('#querySummary').textContent = `你的需求：${query}`;
  const target = document.querySelector('#recommendationResult');
  target.innerHTML = '<p class="result-note">AI 正在整理推荐…</p>';
  try {
    const products = await window.recommendationService.getRecommendations(query);
    target.innerHTML = `<div class="result-intro"><p>AI 推荐结论 · 模拟数据</p><h3>为你筛选出 ${products.length} 个优先选择</h3></div><div class="result-list">${products.map((product, index) => `<article class="recommendation-card"><div class="result-image ${product.image}"></div><div class="result-main"><span class="result-type">${index === 0 ? 'AI 首选 · ' : ''}${product.type}</span><span class="score">推荐指数 ${product.score}</span><h4>${product.name}</h4><strong class="result-price">${product.price}</strong><div class="result-reason"><b>推荐理由</b><p>${product.reason}</p></div><div class="result-details"><div><b>优点</b>${list(product.pros)}</div><div><b>缺点</b>${list(product.cons)}</div></div><p class="audience"><b>适合人群：</b>${product.people}</p><div class="buy-links"><a href="detail.html?id=${product.id}">查看详情</a><button data-store="京东">京东购买</button><button data-store="淘宝">淘宝购买</button></div></div></article>`).join('')}</div><p class="result-note">价格、商品与购买入口均为模拟内容，购买前请以平台实际信息为准。</p>`;
    target.querySelectorAll('[data-store]').forEach(button => button.addEventListener('click', () => { button.textContent = `${button.dataset.store}入口（模拟）`; }));
  } catch {
    target.innerHTML = '<p class="result-note">暂时无法生成推荐，请稍后重试。</p>';
  }
}
renderRecommendations();
