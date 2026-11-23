#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   Luma Home 落地页 · 构建脚本（零依赖，Node 18+）
   ───────────────────────────────────────────────────────────────────────────
   node build.mjs            生成页面并检查占位信息、图片是否齐全
   node build.mjs --check    只检查，不生成

   做了什么：
     1. 读取 site.config.js，把全部文字与图片路径渲染进静态 HTML（搜索引擎可直接读取）
     2. 生成隐私政策 / 购买条款页、站点地图、robots.txt、404 页
     3. 输出 canonical、Open Graph 与 JSON-LD 结构化数据
     4. 逐项检查「还没替换的占位信息」和「缺失或尺寸不符的图片」
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './site.config.js';
import * as T from './js/templates.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHECK_ONLY = process.argv.includes('--check');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => {
  if (CHECK_ONLY) return;
  mkdirSync(dirname(join(ROOT, p)), { recursive: true });
  writeFileSync(join(ROOT, p), s);
};
const errors = [];
const warns = [];
let robotsTxt = '';
const infos = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);
const info = (m) => infos.push(m);

/* ───────────── 1. 渲染页面 ───────────── */
const themeCss = () => {
  const c = config.theme.colors;
  const f = config.theme.fonts;
  return `<style>:root{--bg:${c.bg};--bg-soft:${c.bgSoft};--bg-card:${c.bgCard};--ink:${c.ink};--ink-2:${c.ink2};--ink-3:${c.ink3};--accent:${c.accent};--font-display:${f.display};--font-body:${f.body};--font-mono:${f.mono}}</style>`;
};
const renderers = {
  head: () => T.head(config),
  theme: themeCss,
  nav: () => T.nav(config),
  hero: () => T.hero(config),
  statement: () => T.statement(config),
  collection: () => T.collection(config),
  design: () => T.design(config),
  space: () => T.space(config),
  smart: () => T.smart(config),
  energy: () => T.energy(config),
  install: () => T.install(config),
  reviews: () => T.reviews(config),
  buy: () => T.buy(config),
  care: () => T.care(config),
  footer: () => T.footer(config),
  overlays: () => T.overlays(config),
  'site-data': () => `<script type="application/json" id="site-data">${JSON.stringify(config).replace(/</g, '\\u003c')}</script>`,
};

let html = read('src/page.html');
html = html.replace(/<!--@([\w-]+)-->/g, (_, name) => {
  if (!renderers[name]) { err(`页面外壳里有未知的占位符 <!--@${name}-->`); return ''; }
  return renderers[name]();
});
html = html.replace(/\{\{([\w.]+)\}\}/g, (_, path) => T.esc(T.get(config, path)));
html = html.replace(/\n{3,}/g, '\n\n');

const legal = {
  'privacy.html': T.legalPage(config, 'privacy'),
  'terms.html': T.legalPage(config, 'terms'),
};
const today = new Date().toISOString().slice(0, 10);
const base = config.meta.url.replace(/\/$/, '');
const notFound = `<!doctype html>
<html lang="${T.esc(config.meta.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>页面不存在｜${T.esc(config.brand.name)}</title>
<link rel="icon" href="${T.favicon(config)}">
<link rel="stylesheet" href="css/style.css">
${themeCss()}
</head>
<body class="page-legal">
<main class="legal container" style="text-align:center">
  <p class="eyebrow" style="justify-content:center">404</p>
  <h1 class="legal__title">这个页面不存在</h1>
  <p class="legal__intro">你访问的页面可能已被移动或删除。</p>
  <p><a class="btn btn--metal" href="index.html">返回首页</a></p>
</main>
</body>
</html>`;
const noindex = /noindex/.test(config.meta.robots || '');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', 'privacy.html', 'terms.html'].map((p) => `  <url><loc>${base}/${p}</loc><lastmod>${today}</lastmod>${p ? '' : '<priority>1.0</priority>'}</url>`).join('\n')}
</urlset>
`;
const robots = noindex
  ? `User-agent: *
Disallow: /
`
  : `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

if (!CHECK_ONLY) {
  write('index.html', html);
  write('privacy.html', legal['privacy.html']);
  write('terms.html', legal['terms.html']);
  write('404.html', notFound);
  if (!noindex) write('sitemap.xml', sitemap);
  robotsTxt = robots;
  write('robots.txt', robots);
}

/* ───────────── 2. 检查：占位信息 ───────────── */
const ph = (label, value, re, tip) => (re.test(String(value || '')) ? warn(`${label} 仍是占位内容（${tip}）`) : null);
ph('meta.url 联系域名', config.meta.url, /github\.io|example\./, '上线前换成正式域名');
ph('contact.phone 客服电话', config.contact.phone, /0{4,}|X/i, '换成真实客服电话');
ph('contact.email 邮箱', config.contact.email, /\.example$/i, '换成真实邮箱');
ph('contact.address 地址', config.contact.address, /示例/, '换成真实地址');
ph('company.legalName 公司名', config.company.legalName, /示例|XX/i, '换成营业执照名称');
ph('company.icp 备案号', config.company.icp, /X{3,}|备案号$/i, '换成真实 ICP 备案号');

/* ───────────── 3. 检查：接口配置 ───────────── */
const it = config.integrations;
if (it.forms?.mode === 'api' && !it.forms?.endpoint) err('forms.mode 是 api，但没有填写 forms.endpoint');
if (it.checkout?.mode === 'api' && !it.checkout?.endpoint) err('checkout.mode 是 api，但没有填写 checkout.endpoint');
if (it.checkout?.mode === 'link' && !it.checkout?.storeUrl && !config.collection.products.some((p) => p.buyUrl)) err('checkout.mode 是 link，但没有 storeUrl，商品也没有 buyUrl');
if (!['email', 'api', 'link'].includes(it.checkout?.mode)) err(`checkout.mode "${it.checkout?.mode}" 无效，只能是 email / api / link`);
if (noindex) info('meta.robots 为 noindex：搜索引擎不会收录，也不会生成站点地图。正式上线时改成 index, follow');
if (robotsTxt && existsSync(join(ROOT, 'sitemap.xml')) && noindex) { rmSync(join(ROOT, 'sitemap.xml'), { force: true }); }
if (config.reviews.seo !== true) info('评价的结构化数据默认不输出；确认评价为真实数据后，把 reviews.seo 改为 true');

/* ───────────── 4. 检查：引用关系 ───────────── */
const product = (id) => config.collection.products.find((p) => p.id === id);
const refProduct = (id, where) => { if (!product(id)) err(`${where} 引用了不存在的商品 "${id}"`); return product(id); };
config.space.rooms.forEach((room) => {
  const slots = T.layoutSlots(room.layout);
  if (!['living', 'bedroom', 'dining', 'study'].includes(room.layout)) err(`房间 "${room.name}" 的 layout "${room.layout}" 无效`);
  room.items.forEach((it) => {
    refProduct(it.product, `空间搭配「${room.name}」`);
    if (!slots.includes(it.slot)) err(`空间搭配「${room.name}」里 "${it.product}" 的 slot "${it.slot}" 在 ${room.layout} 户型里不存在（可用：${slots.join(' / ')}）`);
  });
});
config.smart.automations.forEach((a) => {
  if (!T.hasIcon(a.icon)) warn(`联动场景「${a.name}」的图标 "${a.icon}" 不存在`);
  a.devices.forEach((d) => refProduct(d.product, `联动场景「${a.name}」`));
});
config.buy.bundles.forEach((b) => b.items.forEach(([id, qty]) => { refProduct(id, `套装「${b.name}」`); if (!(qty > 0)) err(`套装「${b.name}」里 "${id}" 的数量无效`); }));
config.install.steps.forEach((s) => { if (!T.hasIcon(s.icon)) warn(`安装步骤「${s.title}」的图标 "${s.icon}" 不存在`); });
config.care.services.forEach((s) => { if (!T.hasIcon(s.icon)) warn(`服务「${s.title}」的图标 "${s.icon}" 不存在`); });
config.buy.perks.forEach((s) => { if (!T.hasIcon(s.icon)) warn(`购买保障的图标 "${s.icon}" 不存在`); });
config.hero.scenes.forEach((sc) => { if (!['light', 'dark'].includes(sc.theme)) warn(`场景「${sc.name}」的 theme 应为 light 或 dark`); });
if (config.hero.scenes.length < 2) err('hero.scenes 至少需要 2 个场景，滑块才有意义');
refProduct(config.design.product, 'design.product');
config.design.steps.forEach((st, i) => {
  if (!st.image) err(`设计理念第 ${i + 1} 步缺少 image`);
  const f = st.finishImages || {};
  (product(config.design.product)?.finishes || []).forEach((id) => { if (!f[id]) info(`设计理念第 ${i + 1} 步没有 "${id}" 材质的细节图，切换材质时保持原图`); });
});
const finishIds = new Set(config.collection.finishes.map((f) => f.id));
config.collection.products.forEach((p) => {
  p.finishes.forEach((id) => { if (!finishIds.has(id)) err(`商品 "${p.name}" 的材质 "${id}" 不在 collection.finishes 里`); });
  if (!p.images?.main) err(`商品 "${p.name}" 缺少 images.main`);
  if (p.finish && !p.finishes.includes(p.finish)) err(`商品 "${p.name}" 的默认材质 "${p.finish}" 不在它的 finishes 里`);
});

/* ───────────── 5. 检查：图片是否存在、尺寸是否合适 ───────────── */
function imageSize(buf) {
  if (buf.length < 32) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0x47 && buf[1] === 0x49) return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off < buf.length - 9) {
      if (buf[off] !== 0xff) { off++; continue; }
      const m = buf[off + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(off + 5), w: buf.readUInt16BE(off + 7) };
      off += 2 + buf.readUInt16BE(off + 2);
    }
    return null;
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const fmt = buf.toString('ascii', 12, 16);
    if (fmt === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (fmt === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
    if (fmt === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  return null;
}
const refs = [];
function collectImages(node, path) {
  if (typeof node === 'string') {
    if (node.startsWith('assets/img/')) refs.push([node, path]);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) collectImages(value, path ? path + '.' + key : key);
  }
}
collectImages(config, '');
const ratio = (s) => s.w / s.h;
const advice = (file, where, s) => {
  if (where === 'meta.ogImage') return ratio(s) > 1.85 && ratio(s) < 1.98 ? '' : '建议 1200×630（约 1.9:1）';
  if (/^hero\.scenes\.\d+\.image$/.test(where)) return s.w >= 2000 && ratio(s) > 1.7 && ratio(s) < 1.85 ? '' : '建议 2400×1350（16:9）';
  if (/^hero\.scenes\.\d+\.imageMobile$/.test(where)) return s.w >= 1000 && ratio(s) > 0.7 && ratio(s) < 0.8 ? '' : '建议 1350×1800（3:4）';
  if (/\.spin\.sheet$/.test(where)) return s.w % 6 === 0 && s.h % 4 === 0 ? '' : '宽应是列数的整数倍、高是行数的整数倍';
  if (/^collection\.products\.\d+\.images/.test(where)) return s.w >= 800 && ratio(s) > 0.76 && ratio(s) < 0.84 ? '' : '建议 1000×1250（4:5），透明背景用 WebP 或 PNG';
  if (/^design\.steps\.\d+\./.test(where)) return s.w >= 900 && ratio(s) > 0.76 && ratio(s) < 0.84 ? '' : '建议 1200×1500（4:5）';
  if (/wechatQr$/.test(where)) return s.w >= 300 && s.w === s.h ? '' : '建议 480×480 的正方形';
  return '';
};
const seen = new Map();
refs.forEach(([file, where]) => seen.set(file, [...(seen.get(file) || []), where]));
[...seen.entries()].sort().forEach(([file, wheres]) => {
  const full = join(ROOT, file);
  if (!existsSync(full)) { err(`缺少图片 ${file}（用于 ${wheres[0]}）`); return; }
  const s = imageSize(readFileSync(full));
  if (!s) { warn(`读不出图片尺寸：${file}`); return; }
  const tip = advice(file, wheres[0], s);
  if (tip) warn(`图片尺寸不合适：${file} 现为 ${s.w}×${s.h}，${tip}`);
});

/* ───────────── 6. 输出结果 ───────────── */
const pad = (s) => String(s).padStart(2, '0');
const line = (mark, m) => console.log(`  ${mark} ${m}`);
console.log(`\nLuma Home 构建${CHECK_ONLY ? '检查' : '完成'}  ${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`);
if (!CHECK_ONLY) console.log(`  ✓ index.html ${(html.length / 1024).toFixed(1)} KB · privacy.html · terms.html · 404.html · ${noindex ? '' : 'sitemap.xml · '}robots.txt`);
console.log(`  ✓ 引用图片 ${seen.size} 张，商品 ${config.collection.products.length} 件，场景 ${config.hero.scenes.length} 个`);
infos.forEach((m) => line('·', m));
warns.forEach((m) => line('!', m));
errors.forEach((m) => line('✗', m));
if (warns.length) console.log(`\n  有 ${warns.length} 项提示。标「仍是占位内容」的，上线前记得替换；图片直接用同名文件覆盖即可。\n`);
if (errors.length) { console.error(`\n  构建有 ${errors.length} 个错误，请先修正。\n`); process.exit(1); }
if (!warns.length) console.log('  所有检查通过，可以部署。\n');
