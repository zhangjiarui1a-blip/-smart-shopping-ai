# CloudBase + 腾讯混元部署说明

## 1. 创建 HTTP 云函数

在 CloudBase 控制台创建 `recommendations` HTTP 云函数，运行时选择 Node.js 18 或更高版本。上传 `cloudfunctions/recommendations/` 目录中的文件，入口为 `index.main`。

## 2. 配置环境变量

在函数配置中设置：

- `HUNYUAN_API_KEY`：腾讯混元 API Key（必填，不要写进前端代码）
- `HUNYUAN_MODEL`：可选，默认 `hunyuan-turbos-latest`
- `ALLOWED_ORIGIN`：静态站点域名，用于限制 CORS 来源

## 3. 配置 HTTP 路由

将函数 HTTP 访问地址映射为静态网站同域的 `/api/recommendations`；或者在静态站点加载前设置：

```html
<script>window.RECOMMENDATIONS_API_URL = 'https://你的函数访问地址';</script>
```

前端的 `recommendation-service.js` 会优先调用此接口。如果函数不可用、返回错误或未配置路由，则自动继续使用本地模拟数据。

## 4. 验证

向接口 POST JSON：`{ "query": "预算 5000 元，推荐轻薄笔记本" }`。成功时应返回商品数组，字段与 `data.js` 中的商品结构一致。
