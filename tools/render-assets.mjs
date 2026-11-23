#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   Luma Home — 占位图渲染（把 3D 场景渲染成 assets/img 下的图片）
   ───────────────────────────────────────────────────────────────────────────
   node tools/render-assets.mjs [--only hero|products|design|og]

   网站本身不依赖这个脚本：占位图已经生成好放在 assets/img 里。
   只有想重新生成占位图时才需要运行它，要求：
     · 本机装有 Google Chrome（或用环境变量 CHROME_PATH 指定浏览器）
     · 无界面浏览器能使用显卡（否则渲染会很慢）
   用真实照片替换占位图后，这个脚本和 tools/studio 目录都可以直接删除。
   ═══════════════════════════════════════════════════════════════════════════ */
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import config from '../site.config.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css', '.json': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(CHROME)) {
  console.error(`找不到浏览器：${CHROME}\n请安装 Google Chrome，或用 CHROME_PATH 环境变量指定浏览器的可执行文件。`);
  process.exit(1);
}

/* ── 任务清单：直接来自 site.config.js，所以改了配置再运行，生成的文件名自动对上 ── */
/* 手机首屏：竖幅构图，把沙发和灯放在画面中上部，给底部文字留出空间 */
const MOBILE_POS = [-0.2, 1.35, 4.6];
const MOBILE_TARGET = [1.35, 0.2, -1.0];
const MOBILE_FOV = 62;
/* 桌面首屏：左侧留出墙面给标题，家具集中在右半边 */
const DESKTOP_POS = [-1.3, 1.3, 4.05];
const DESKTOP_TARGET = [0.6, 1.0, -1.25];
const DESKTOP_FOV = 40;
const jobs = [];
const n = config.hero.scenes.length;
const sOf = (i) => (n > 1 ? i / (n - 1) : 0);
if (!only || only === 'hero') {
  config.hero.scenes.forEach((sc, i) => {
    jobs.push({ out: sc.image, group: 'hero', call: 'room', args: { s: sOf(i), w: 2400, h: 1350, pos: DESKTOP_POS, target: DESKTOP_TARGET, fov: DESKTOP_FOV } });
    if (sc.imageMobile) jobs.push({ out: sc.imageMobile, group: 'hero', call: 'room', args: { s: sOf(i), w: 1350, h: 1800, pos: MOBILE_POS, target: MOBILE_TARGET, fov: MOBILE_FOV } });
  });
}
if (!only || only === 'og') jobs.push({ out: config.meta.ogImage, group: 'og', call: 'og', args: {} });
if (!only || only === 'products') {
  for (const p of config.collection.products) {
    jobs.push({ out: p.images.main, group: 'products', call: 'product', args: { id: p.id, finish: p.finish } });
    if (p.images.lit) jobs.push({ out: p.images.lit, group: 'products', call: 'product', args: { id: p.id, finish: p.finish, lit: 1 } });
    for (const [finish, path] of Object.entries(p.images.finishes || {})) jobs.push({ out: path, group: 'products', call: 'product', args: { id: p.id, finish } });
    if (p.spin) jobs.push({ out: p.spin.sheet, group: 'products', call: 'spin', args: { id: p.id, finish: p.finish, frames: p.spin.frames, cols: p.spin.cols, rows: p.spin.rows, fw: p.spin.width, fh: p.spin.height } });
  }
}
if (!only || only === 'design') {
  const hero = config.collection.products.find((p) => p.id === config.design.product) || config.collection.products[0];
  config.design.steps.forEach((st, i) => {
    jobs.push({ out: st.image, group: 'design', call: 'design', args: { step: i, finish: hero.finish, id: hero.id } });
    for (const [finish, path] of Object.entries(st.finishImages || {})) jobs.push({ out: path, group: 'design', call: 'design', args: { step: i, finish, id: hero.id } });
  });
}


/* ── 本地静态服务器（浏览器要加载模块和贴图，不能直接用 file://）── */
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, path === '/' ? 'tools/studio/index.html' : path);
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

/* ── 启动无界面浏览器并连上调试协议 ── */
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--user-data-dir=/tmp/luma-studio-profile', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--disable-extensions', '--disable-background-timer-throttling', '--window-size=1600,1200', 'about:blank'], { stdio: 'ignore' });
let info = null;
for (let i = 0; i < 60 && !info; i++) {
  await sleep(250);
  try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) info = await r.json(); } catch { /* 还没起来 */ }
}
if (!info) { chrome.kill(); server.close(); console.error('浏览器启动失败'); process.exit(1); }
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('调试连接失败')); });
let seq = 0;
const pending = new Map();
const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (!msg.id || !pending.has(msg.id)) return;
  const { resolve, reject } = pending.get(msg.id);
  pending.delete(msg.id);
  if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
};
const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
const evaluate = async (expression) => {
  const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
await call('Page.navigate', { url: `${base}/tools/studio/index.html` }, sessionId);
for (let i = 0; i < 80; i++) {
  await sleep(250);
  if (await evaluate('!!window.studio').catch(() => false)) break;
}
const gpu = await evaluate("(() => { const c = document.createElement('canvas'); const gl = c.getContext('webgl2'); if (!gl) return 'no-webgl2'; const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'webgl2'; })()");

console.log(`\nLuma Home 占位图渲染 · 共 ${jobs.length} 张\n  渲染器：${gpu}\n`);
const started = Date.now();
let failed = 0;
for (let i = 0; i < jobs.length; i++) {
  const job = jobs[i];
  const out = join(ROOT, job.out);
  const t = Date.now();
  try {
    const dataUrl = await evaluate(`window.studio.${job.call}(${JSON.stringify(job.args)})`);
    const [, mime, b64] = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl) || [];
    if (!b64) throw new Error('没有拿到图片数据');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log(`  ✓ ${String(i + 1).padStart(2)} / ${jobs.length}  ${job.out.padEnd(52)} ${(Buffer.from(b64, 'base64').length / 1024).toFixed(0).padStart(4)} KB  ${String(Date.now() - t).padStart(4)} ms`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${String(i + 1).padStart(2)} / ${jobs.length}  ${job.out}  失败：${err.message}`);
  }
}
console.log(`\n  完成：${jobs.length - failed} 张成功，用时 ${((Date.now() - started) / 1000).toFixed(0)} 秒。接下来运行 npm run build 检查尺寸。${failed ? `\n  有 ${failed} 张失败。\n` : '\n'}`);

await call('Target.closeTarget', { targetId }).catch(() => {});
ws.close();
chrome.kill();
server.close();
process.exit(failed ? 1 : 0);
