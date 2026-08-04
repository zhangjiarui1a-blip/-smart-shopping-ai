const catalog = [
  { id: 'air-14', image: 'laptop', type: '轻薄笔记本', name: 'Air 14 轻薄笔记本', price: '¥ 4,999', score: 96, intro: '14 英寸轻薄办公本，兼顾移动便携与日常生产力。', reason: '轻薄机身、长续航和日常性能兼顾，是 5000 元级移动办公的稳妥选择。', pros: ['1.24kg 轻薄便携', '16GB 内存，多任务流畅', '续航可覆盖全天轻办公'], cons: ['不适合大型 3D 渲染', '接口数量较少'], people: '学生、通勤办公、文字与轻度创作用户', advice: '如你更看重便携和稳定体验，可优先选择；购买时建议确认内存容量和保修服务。', worth: '值得购买' },
  { id: 'quiet-pro', image: 'headphones', type: '降噪耳机', name: 'Quiet Pro 无线耳机', price: '¥ 1,299', score: 92, intro: '面向通勤与专注场景的主动降噪无线耳机。', reason: '降噪、佩戴与连接体验表现均衡。', pros: ['主动降噪稳定', '佩戴舒适', '多设备切换方便'], cons: ['音色偏均衡', '不支持有线高解析'], people: '通勤族、远程办公与旅行用户', advice: '适合通勤和会议为主的场景。', worth: '值得购买' },
  { id: 'one-pro', image: 'phone', type: '旗舰手机', name: 'One Pro 智能手机', price: '¥ 5,699', score: 89, intro: '均衡旗舰手机，强调影像、性能与屏幕体验。', reason: '影像、屏幕和性能没有明显短板。', pros: ['旗舰级影像系统', '高亮度屏幕', '性能冗余充足'], cons: ['机身偏重', '价格较高'], people: '重视拍照、性能和长期体验的用户', advice: '对比存储版本与补贴后购买。', worth: '推荐购买' },
  { id: 'fit-watch-3', image: 'watch', type: '智能穿戴', name: 'Fit Watch Series 3', price: '¥ 1,899', score: 86, intro: '轻巧智能手表，提供健康记录与日常通知能力。', reason: '健康记录与日常提醒体验完整。', pros: ['健康数据记录完整', '续航可靠', '轻巧耐用'], cons: ['专业运动数据有限', '部分功能依赖手机'], people: '关注健康、运动与通知效率的用户', advice: '适合希望强化健康提醒的人群。', worth: '按需购买' }
];

const json = (statusCode, data) => ({ statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*' }, body: JSON.stringify(data) });
const parseQuery = event => { const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || event); return String(body.query || '').trim(); };
const parseModelJson = content => { const match = content.match(/\[[\s\S]*\]/); if (!match) throw new Error('Model did not return a JSON array'); return JSON.parse(match[0]); };

exports.main = async event => {
  if (event.httpMethod === 'OPTIONS') return json(204, '');
  try {
    const query = parseQuery(event);
    if (!query || query.length > 300) return json(400, { error: 'query is required and must be 300 characters or fewer' });
    if (!process.env.HUNYUAN_API_KEY) return json(500, { error: 'HUNYUAN_API_KEY is not configured' });
    const prompt = `你是购物助手。用户需求：${query}\n从候选商品中选 3 个最适合的，并只输出 JSON 数组。每项必须包含 id、reason、score。score 为 0-100 整数。候选：${JSON.stringify(catalog.map(({ id, name, type, price }) => ({ id, name, type, price })))}。`;
    const response = await fetch('https://api.hunyuan.cloud.tencent.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.HUNYUAN_API_KEY}` }, body: JSON.stringify({ model: process.env.HUNYUAN_MODEL || 'hunyuan-turbos-latest', messages: [{ role: 'user', content: prompt }], temperature: 0.3 }) });
    if (!response.ok) throw new Error(`Hunyuan returned ${response.status}`);
    const payload = await response.json(); const picks = parseModelJson(payload.choices?.[0]?.message?.content || '');
    const recommendations = picks.map(pick => { const product = catalog.find(item => item.id === pick.id); return product && { ...product, reason: String(pick.reason || product.reason), score: Math.max(0, Math.min(100, Number(pick.score) || product.score)) }; }).filter(Boolean).slice(0, 3);
    if (!recommendations.length) throw new Error('No valid catalog matches returned');
    return json(200, recommendations);
  } catch (error) { console.error('recommendations function failed', error); return json(500, { error: 'Failed to generate recommendations' }); }
};
