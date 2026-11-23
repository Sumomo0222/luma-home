# Luma Home 落地页

一个可以直接投入商用的家居品牌落地页。**换图片、改一个配置文件，就能当成你自己品牌的官网首页上线。**

- 在线地址：<https://sumomo0222.github.io/luma-home/>
- 纯静态站点：没有框架、没有后端、构建零依赖，任何静态托管都能部署
- 当前页面里的品牌、商品与评价都是示例内容，图片是 3D 渲染的占位图，全部可以替换

## 三步上线

1. **换图片**：把 `assets/img/` 里的图片换成同名文件（尺寸建议见下表）
2. **改信息**：编辑 `site.config.js`（品牌、联系方式、备案号、商品、价格、评价、条款……都在这一个文件里）
3. **构建并部署**：

   ```bash
   npm run build     # 生成 index.html、隐私政策页、条款页、站点地图、robots.txt，并检查还有哪些占位信息没换
   ```

   然后把整个目录上传到任意静态托管（GitHub Pages、对象存储 + CDN、Nginx 等）即可。

构建时会逐项提醒「仍是占位内容」的信息（电话、邮箱、地址、备案号、域名）以及缺失或尺寸不符的图片，全部处理完会显示「所有检查通过，可以部署」。

> 只换图片、不改文字时，不需要重新构建。

## 本地预览

```bash
npm run dev        # 打开 http://localhost:8080，改配置或样式后自动重建并刷新
npm run check      # 只检查，不生成文件
```

需要 Node.js 18 或更高版本。不需要 `npm install`。

## 换图指南

所有图片都在 `assets/img/`。保持文件名不变直接覆盖即可；想用别的文件名或格式，改 `site.config.js` 里对应的路径。

| 位置 | 文件 | 建议尺寸 | 拍摄建议 |
| --- | --- | --- | --- |
| 首屏四个时段 | `hero/dawn.jpg` `day.jpg` `dinner.jpg` `night.jpg` | 2400×1350 | **三脚架固定同一机位**拍四个时段，拖动滑块切换时空间才不会跳动。画面左侧约 40% 留给标题，尽量是干净的墙面 |
| 首屏（手机） | `hero/*-m.jpg` | 1350×1800 | 竖幅，主体放在画面中上部，底部留给文字。不需要可以删掉并把 `imageMobile` 留空 |
| 分享缩略图 | `hero/og.jpg` | 1200×630 | 发到微信、社交平台时的卡片图 |
| 商品主图 | `products/<商品id>.webp` | 1000×1250，透明背景 | 白底或透明底的正面 3/4 角度，产品占画面高度约八成。透明背景用 WebP 或 PNG |
| 商品开灯图（可选） | `products/<商品id>-lit.webp` | 同上 | 开灯或使用中的状态，鼠标悬停时切换 |
| 材质图（可选） | `products/<商品id>-<材质id>.webp` | 同上 | 每种材质一张，点材质色点时切换 |
| 360° 序列图（可选） | `products/spin/<商品id>.webp` | 24 帧拼成 6 列 × 4 行 | 没有序列图就删掉商品配置里的 `spin`，卡片自动变成普通图片 + 轻微倾斜 |
| 设计细节图 | `design/step-1.jpg` … `step-4.jpg` | 1200×1500 | 四张材质、工艺的特写。`step-N-<材质id>.jpg` 是可选的各材质版本 |
| 客服二维码（可选） | `contact/wechat-qr.png` | 480×480 | 在 `contact.wechatQr` 里填写路径后显示 |

图片格式随意（JPG / PNG / WebP），构建时会检查尺寸是否合适。商品主图建议控制在 200 KB 以内，首屏图 400 KB 以内。

## 配置说明（`site.config.js`）

文件里有逐项注释，下面是最常改的几处：

| 配置项 | 说明 |
| --- | --- |
| `meta` | 浏览器标题、搜索摘要、正式域名、分享缩略图。**域名会用于 canonical、站点地图与分享卡片**。`robots` 默认是 `noindex`（示例数据不收录），**正式上线时改成 `'index, follow'`**，构建才会生成站点地图 |
| `brand` | 品牌名、口号、Logo（默认用文字标识，`logoImage` 可换成图片） |
| `contact` | 客服电话、邮箱、服务时间、地址。电话和邮箱会出现在页脚、客服浮窗、表单兜底 |
| `company` | 营业执照名称、ICP 备案号（页脚显示并链接到工信部网站）、公安备案 |
| `theme.colors` `theme.fonts` | 整站配色与字体，改这里即可换肤 |
| `hero` | 首屏标题、副标题、按钮，以及四个时段各自的图片、文案与读数 |
| `collection.products` | 商品数组：增删条目后重新构建，卡片、套装、安装表格会自动跟着变 |
| `design` `space` `smart` `energy` `install` `reviews` `buy` `care` | 各区块的文字与数据 |
| `legal` | 隐私政策、购买与服务条款（会生成 `privacy.html`、`terms.html`） |

### 关于首屏的四个时段

每个时段包含：图片、名称、时间、一句话标题、说明文字，以及滑块旁显示的四个读数。拖动滑块时图片交叉淡入、时间和读数连续变化；时段多于或少于四个也可以，滑块会自动适应。

### 添加一件商品

在 `collection.products` 里加一条即可，必填项只有 `id`、`name`、`cn`、`price`、`series`、`kind`、`images.main` 和各项参数。`spin`、`images.lit`、`images.finishes` 都是可选的增强。

## 下单与表单怎么走

在 `site.config.js` 的 `integrations` 里配置，三种模式按需选择：

| 模式 | 下单 `checkout.mode` | 预约表单 `forms.mode` | 说明 |
| --- | --- | --- | --- |
| `email`（默认） | 支持 | 支持 | 调起访客的邮件应用，把订单意向 / 预约信息发到 `contact.email`。**不需要后端**，页面会如实提示「订单邮件已生成」，并给出电话兜底 |
| `api` | 支持 | 支持 | 提交到 `endpoint`，需要你提供一个接口（约定见下） |
| `link` | 支持 | — | 跳转到外部商城：`checkout.storeUrl`，或商品各自的 `buyUrl`。此时页面不显示购物袋 |

**接口约定（`api` 模式）**：页面以 `POST` 发送 JSON，成功时返回 2xx 状态码和 `{ "ref": "订单或预约编号" }`。

```json
{ "type": "order", "items": [{ "id": "halo-floor", "name": "Halo Floor", "finish": "香槟", "qty": 1, "price": 2980 }],
  "customer": { "name": "…", "phone": "…", "address": "…", "note": "…" }, "total": 2980, "submittedAt": "…" }
```

预约表单的 `type` 为 `advisor`。提交失败时页面会提示访客改用电话联系，不会假装提交成功。

## 统计与埋点

- `integrations.analytics.baidu` / `gtag`：填入统计 ID 后自动加载对应脚本，留空则不加载任何第三方统计
- 所有按钮都带有 `data-track` 属性（如 `add_to_bag`、`checkout_submit`、`cs_phone`）。定义 `window.lumaTrack(event, data)` 函数即可接入任意统计系统

## 已包含的上线必备项

- **SEO**：全部内容在构建时渲染为静态 HTML；自动输出标题、描述、canonical、Open Graph，以及组织、商品列表、常见问题的 JSON-LD 结构化数据；开放收录后生成 `sitemap.xml` 与 `robots.txt`
- **法务页面**：`privacy.html`、`terms.html`，表单提交前需要勾选同意
- **性能**：首屏图预加载、其余图片懒加载、字体自托管并按需分片加载（替换任何中文文案都不会缺字）
- **可用性**：键盘可操作、带 ARIA 标注、尊重系统的「减少动态效果」设置、图片缺失时在原位显示文件名
- **响应式**：桌面与手机各有布局，手机端底部有「客服 / 购物袋 / 预约顾问」快捷栏

## 上线前请确认

- 评价、评分、销量、「省 62%」等数据需要真实、可举证；评价确认为真实数据后，把 `reviews.seo` 改为 `true` 才会输出评价的结构化数据
- 文案请按《广告法》自查（示例文案已避免「最」「第一」等绝对化用语，替换时请注意）
- 隐私政策与服务条款为通用模板，请由法务核对后使用
- 中国大陆境内托管需要完成 ICP 备案

## 目录结构

```
site.config.js        ★ 唯一需要编辑的内容文件
assets/img/           ★ 图片位（同名替换）
build.mjs             构建脚本：预渲染 + 校验
index.html            构建产物（请勿直接编辑，会被覆盖）
src/page.html         页面外壳
js/tpl/               各区块的渲染模板（构建与浏览器共用）
js/                   页面交互：首屏滑块、商品卡片、购物袋、结算、空间搭配……
css/style.css         样式；css/fonts.css 字体声明
tools/dev.mjs         本地预览服务器
tools/render-assets.mjs + tools/studio/   占位图渲染工具（可删除）
```

## 关于占位图

`assets/img` 里的图片是由 `tools/studio` 里的 3D 场景渲染生成的，只为让页面开箱即见成品效果。它们**不是**实拍照片，正式上线前请换成品牌自己的图片。换完之后 `tools/studio/`、`tools/render-assets.mjs` 可以直接删除，不影响网站运行（网页本身不加载 Three.js，也不依赖任何 3D）。

想调整占位图：`npm run assets`（需要本机装有 Google Chrome）。

字体为思源宋体（Noto Serif SC）、Newsreader、Geologica、DM Mono，均以 SIL Open Font License 授权，可商用。
