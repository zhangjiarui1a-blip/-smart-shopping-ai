# CloudBase 商品库配置

## 1. 创建集合

在当前 CloudBase 环境的数据库中创建集合：`products`。

建议权限：仅管理端可写、所有人不可直接读取。网站通过 `products` HTTP 云函数读取，避免浏览器直连数据库。

## 2. 初始化商品

使用 `cloudfunctions/products/products.seed.json` 作为导入内容，或逐条新增。该文件包含 18 条示例商品：手机、电脑、数码、家居、宠物用品、礼物各 3 条。

每条商品的统一字段：

```json
{
  "id": "pc-air14",
  "name": "Air 14 轻薄笔记本",
  "category": "电脑",
  "brand": "Air",
  "price": "¥4999",
  "image": "laptop",
  "description": "轻薄办公笔记本",
  "specs": { "memory": "16GB" },
  "tags": ["轻薄", "办公"],
  "pros": ["便携"],
  "cons": ["接口较少"],
  "suitableFor": "通勤办公用户",
  "purchaseUrl": { "jd": "", "taobao": "" }
}
```

CloudBase 会自动创建 `_id`；应用会优先使用 `id`，没有时使用 `_id`。

## 3. 部署 products 云函数

创建 HTTP 云函数 `products`，入口设置为 `index.main`，运行时选择 Node.js 18+。上传 `cloudfunctions/products/`；部署时安装 `package.json` 中的 `@cloudbase/node-sdk` 依赖。

配置可选环境变量：

```text
ALLOWED_ORIGIN=https://你的静态网站域名
```

## 4. 连接前端

将 products 云函数 HTTP 访问地址填写到：

```js
// runtime-config.js
window.PRODUCTS_API_URL = 'https://你的-products-云函数-地址';
```

未配置或函数报错时，页面会继续使用原有本地商品库作为 fallback。
