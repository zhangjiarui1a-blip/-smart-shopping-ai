const products = [
  { id: 1, name: "Apple iPhone 17 Pro 256GB 钛金属手机", category: "数码", original: 7999, price: 6799, subsidy: 700, coupon: 500, saved: 1200, updated: "10分钟前", palette: ["#E6E2D6", "#B6A995"], icon: "⌁", hot: 98, drop: 15 },
  { id: 2, name: "小米 15 Ultra 徕卡旗舰影像手机 16+512GB", category: "数码", original: 6999, price: 5499, subsidy: 500, coupon: 1000, saved: 1500, updated: "18分钟前", palette: ["#DCE5E1", "#7F9A90"], icon: "◉", hot: 94, drop: 19 },
  { id: 3, name: "索尼 WH-1000XM6 降噪蓝牙头戴耳机", category: "影音", original: 3199, price: 2499, subsidy: 0, coupon: 700, saved: 700, updated: "26分钟前", palette: ["#E3E7EC", "#8293A2"], icon: "◖", hot: 89, drop: 22 },
  { id: 4, name: "美的 1.5匹 一级能效变频空调", category: "家电", original: 3299, price: 2299, subsidy: 300, coupon: 700, saved: 1000, updated: "31分钟前", palette: ["#EAE5DD", "#BCA98B"], icon: "❄", hot: 93, drop: 18 },
  { id: 5, name: "戴森 V12 Detect Slim 无线吸尘器", category: "家电", original: 3990, price: 2790, subsidy: 0, coupon: 1200, saved: 1200, updated: "42分钟前", palette: ["#EFE0DD", "#B87570"], icon: "◒", hot: 81, drop: 30 },
  { id: 6, name: "联想拯救者 Y9000P 游戏笔记本电脑", category: "电脑", original: 10999, price: 8799, subsidy: 700, coupon: 1500, saved: 2200, updated: "1小时前", palette: ["#E1E4E2", "#66776F"], icon: "▱", hot: 96, drop: 20 },
  { id: 7, name: "乐高花束系列 玫瑰花积木礼物", category: "礼物", original: 369, price: 259, subsidy: 0, coupon: 110, saved: 110, updated: "12分钟前", palette: ["#F3E2E1", "#BD8081"], icon: "✿", hot: 90, drop: 29 },
  { id: 8, name: "猫咪互动羽毛逗猫棒玩具套装", category: "宠物", original: 89, price: 49, subsidy: 0, coupon: 40, saved: 40, updated: "8分钟前", palette: ["#E8E1D1", "#A9946E"], icon: "♧", hot: 87, drop: 45 }
];

const rankings = {
  mustBuy: { title: "综合优惠力度与热度，为你挑出今天最值得买的商品。", items: [1, 6, 2, 4] },
  saving: { title: "按<strong>预计节省金额</strong>排序，省得最多的都在这里。", items: [6, 2, 1, 5] },
  priceDrop: { title: "按<strong>近期降价幅度</strong>排序，把握好价出现的时机。", items: [5, 3, 6, 2] },
  popular: { title: "按<strong>关注热度</strong>排序，大家都在看的优选商品。", items: [1, 6, 2, 4] }
};

const grid = document.querySelector('#productGrid');
const intro = document.querySelector('#rankingIntro');
const money = value => `¥${value.toLocaleString('zh-CN')}`;
const productById = id => products.find(product => product.id === id);
function productImage(product) {
  const [light, dark] = product.palette;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><circle cx="455" cy="92" r="110" fill="#ffffff" fill-opacity=".17"/><circle cx="151" cy="343" r="150" fill="#ffffff" fill-opacity=".10"/><text x="300" y="235" text-anchor="middle" font-size="146" fill="#ffffff" fill-opacity=".9" font-family="Arial">${product.icon}</text><text x="300" y="326" text-anchor="middle" font-size="22" font-weight="700" fill="#ffffff" font-family="Arial">SMART PICK</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function renderRanking(key) {
  const ranking = rankings[key];
  intro.innerHTML = ranking.title;
  grid.innerHTML = ranking.items.map((id, index) => {
    const item = productById(id);
    return `<article class="product-card"><div class="image-wrap"><img src="${productImage(item)}" alt="${item.name} 模拟商品图"/><span class="rank-badge ${index === 0 ? 'top' : ''}">TOP ${index + 1}</span></div><div class="product-body"><span class="product-category">${item.category}</span><h3 class="product-name">${item.name}</h3><div class="price-row"><span class="now-price">${money(item.price)}</span><span class="original-price">${money(item.original)}</span></div><div class="discount-line"><span>优惠 ${money(item.coupon + item.subsidy)}</span><strong>省 ${money(item.saved)}</strong></div><div class="benefits"><span>国补 ${money(item.subsidy)}</span><span>平台优惠 ${money(item.coupon)}</span></div><time class="time">更新于 ${item.updated}</time><div class="buy-actions"><button class="jd" data-action="buy" data-platform="京东" data-id="${item.id}" type="button">京东购买</button><button class="tb" data-action="buy" data-platform="淘宝" data-id="${item.id}" type="button">淘宝购买</button><button class="copy" aria-label="复制商品链接" data-action="copy" data-id="${item.id}" type="button">⧉</button></div></div></article>`;
  }).join('');
}
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('visible'), 2300); }
const assistantForm = document.querySelector('#assistantForm');
const recommendationInput = document.querySelector('#recommendationInput');
const recommendationResult = document.querySelector('#recommendationResult');
const recommendButton = document.querySelector('#recommendButton');
function getRecommendedProduct(query) { const text = query.toLowerCase(); if (/猫|宠物|玩具/.test(text)) return productById(8); if (/礼物|送女生|送女/.test(text)) return productById(7); if (/耳机|降噪|音乐/.test(text)) return productById(3); if (/吸尘|清洁|小户型/.test(text)) return productById(5); if (/电脑|游戏|笔记本/.test(text)) return productById(6); if (/空调|家电/.test(text)) return productById(4); return productById(1); }
function escapeHTML(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function renderRecommendation(item, query) { const price = Math.min(98, 80 + Math.round(item.saved / 150)); const reviews = Math.min(98, item.hot); const value = Math.min(98, 76 + Math.round(item.saved / 100)); const total = Math.round((price + reviews + value) / 3); const audiences = { 3: '通勤、差旅与重视安静体验的人群', 5: '小户型、养宠家庭与需要轻量清洁的人群', 6: '游戏、设计创作与高性能办公人群', 4: '夏季刚需、在意能耗的家庭用户', 7: '送礼、纪念日或偏好有仪式感的人群', 8: '养猫家庭与需要互动消耗精力的猫咪' }; const audience = audiences[item.id] || '重视影像、性能与长期使用体验的人群'; const safeQuery = escapeHTML(query); recommendationResult.hidden = false; recommendationResult.innerHTML = `<div class="result-panel"><p class="result-label">针对「<strong>${safeQuery}</strong>」的模拟 AI 推荐</p><article class="recommendation-card"><div class="recommendation-image"><img src="${productImage(item)}" alt="${item.name} 模拟商品图" /></div><div class="recommendation-body"><div class="recommendation-top"><div><span class="recommendation-category">AI 首选推荐 · ${item.category}</span><h3 class="recommendation-title">${item.name}</h3><p class="recommendation-price">预计到手价 <strong>${money(item.price)}</strong></p></div><div class="recommendation-index" style="--score:${total}"><span>值得买<strong>${total}</strong></span></div></div><div class="recommendation-copy"><div><strong>推荐理由</strong>当前优惠叠加后节省 ${money(item.saved)}，在同类商品中价格与热度表现突出。</div><div><strong>适合人群</strong>${audience}</div><div><strong>购买建议</strong>当前为模拟好价，若预算匹配，建议优先对比京东与淘宝入口后下单。</div><div><strong>避坑提醒</strong>本页价格、评分和推荐均为演示数据；真实购买前请核对规格、评价、售后与最终结算价。</div></div><div class="score-board" aria-label="值得买指数评分"><div class="score-cell"><span>性价比评分</span><strong>${value}</strong></div><div class="score-cell"><span>用户评价评分</span><strong>${reviews}</strong></div><div class="score-cell"><span>价格优势评分</span><strong>${price}</strong></div><div class="score-cell total"><span>综合推荐指数</span><strong>${total}</strong></div></div></div></article></div>`; recommendationResult.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
assistantForm.addEventListener('submit', event => { event.preventDefault(); const query = recommendationInput.value.trim() || '想买一件值得入手的数码产品'; recommendButton.disabled = true; recommendButton.classList.add('is-loading'); setTimeout(() => { renderRecommendation(getRecommendedProduct(query), query); recommendButton.disabled = false; recommendButton.classList.remove('is-loading'); }, 820); });
document.querySelectorAll('.prompt-chip').forEach(chip => chip.addEventListener('click', () => { recommendationInput.value = chip.textContent; recommendationInput.focus(); }));
document.querySelector('.rank-tabs').addEventListener('click', event => { const button = event.target.closest('[data-ranking]'); if (!button) return; document.querySelectorAll('.rank-tab').forEach(tab => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-selected', tab === button); }); renderRanking(button.dataset.ranking); });
grid.addEventListener('click', async event => { const button = event.target.closest('[data-action]'); if (!button) return; const item = productById(Number(button.dataset.id)); if (button.dataset.action === 'copy') { const text = `【模拟商品】${item.name}，当前价格 ${money(item.price)}`; try { await navigator.clipboard.writeText(text); toast('模拟商品信息已复制'); } catch { const input = document.createElement('textarea'); input.value = text; input.setAttribute('readonly', ''); input.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(input); input.select(); const copied = document.execCommand('copy'); input.remove(); toast(copied ? '模拟商品信息已复制' : '复制失败，请手动复制商品信息'); } } else { toast(`${button.dataset.platform}购买入口为演示状态，暂不跳转`); } });
document.querySelector('#refreshButton').addEventListener('click', () => { const now = new Date(); document.querySelector('#updatedAt').textContent = `模拟数据更新于 今天 ${now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})}`; toast('榜单已更新（模拟数据）'); });
renderRanking('mustBuy');
