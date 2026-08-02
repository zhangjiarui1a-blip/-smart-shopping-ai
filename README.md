# 智能优惠助手 Demo

一个可部署的静态网页 Demo，包含模拟 AI 推荐、值得买指数与优惠榜单。

## 本地运行

使用 Node.js 18 或更高版本执行 `npm start`，然后访问 `http://localhost:4173`。

## 部署

无需构建步骤。将整个目录部署至任意静态托管服务即可，入口文件为 `index.html`。项目已提供 `vercel.json`，在 Vercel 导入该目录时选择 Framework Preset 为 `Other`，并保持 Build Command 为空即可。

## 当前范围

商品、价格、评分和 AI 推荐均为模拟数据；不含真实电商 API、购买跳转、用户账号或支付能力。
