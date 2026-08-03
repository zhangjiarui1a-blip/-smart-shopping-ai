const form = document.querySelector('#assistantForm');
const input = document.querySelector('#recommendationInput');
const result = document.querySelector('#recommendationResult');
const sendButton = document.querySelector('#recommendButton');

const recommendations = {
  '推荐狗粮': { icon: '🐶', title: '狗狗主粮建议', product: '天然肉源全价犬粮', text: '优先选择配料表中肉类排在前列、标注“全价犬粮”的产品。幼犬可关注较高蛋白与 DHA，成犬则按体型和活动量选择合适颗粒。' },
  '推荐猫粮': { icon: '🐱', title: '猫咪主粮建议', product: '高蛋白低敏全价猫粮', text: '猫咪需要优质动物蛋白，建议选择肉类原料清晰、牛磺酸充足的全价猫粮；换粮时请用 7 天逐步过渡。' },
  '推荐零食': { icon: '🦴', title: '健康零食建议', product: '冻干肉粒与洁齿零食组合', text: '零食适合做训练奖励，建议控制在每日总热量的 10% 以内。选择单一肉源冻干，更容易观察宠物是否适应。' },
  '推荐玩具': { icon: '🧶', title: '互动玩具建议', product: '益智漏食玩具或耐咬玩具', text: '精力旺盛的宠物适合益智漏食玩具；啃咬需求较高时选择尺寸匹配、材质扎实的玩具，并在首次使用时陪同观察。' }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function chooseRecommendation(query) {
  if (/猫|喵/.test(query)) return recommendations['推荐猫粮'];
  if (/零食|冻干|奖励/.test(query)) return recommendations['推荐零食'];
  if (/玩具|逗|磨牙/.test(query)) return recommendations['推荐玩具'];
  return recommendations['推荐狗粮'];
}

function showReply(query) {
  const item = recommendations[query] || chooseRecommendation(query);
  result.hidden = false;
  result.innerHTML = `
    <article class="ai-response">
      <div class="response-avatar" aria-hidden="true">${item.icon}</div>
      <div class="response-content">
        <p class="response-label">PETWISE AI · 模拟推荐</p>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
        <div class="product-suggestion"><span>${item.icon}</span><div><small>为你优先推荐</small><strong>${item.product}</strong></div></div>
        <p class="reply-note">已根据“${escapeHtml(query)}”生成建议。购买前请结合宠物健康状况、配料表和实际预算确认。</p>
      </div>
    </article>`;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const query = input.value.trim() || '推荐狗粮';
  sendButton.disabled = true;
  sendButton.querySelector('span').textContent = '思考中';
  window.setTimeout(() => {
    showReply(query);
    sendButton.disabled = false;
    sendButton.querySelector('span').textContent = '发送';
  }, 420);
});

document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => {
    input.value = button.dataset.prompt;
    form.requestSubmit();
  });
});
