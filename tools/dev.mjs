#!/usr/bin/env node
/* 本地预览：node tools/dev.mjs   （或 npm run dev，可用 PORT=9000 换端口）
   启动一个本地服务器（默认 http://localhost:8080），修改 site.config.js、src、js、css
   后自动重新构建并刷新浏览器页面。零依赖，Ctrl+C 结束。 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync, watch } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const PORT = Number(process.env.PORT || 8080);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};
const RELOAD_SCRIPT = "<script>new EventSource('/__reload').onmessage = (e) => { if (e.data === 'reload') location.reload(); };</script>";
const clients = new Set();
let building = null;
let again = false;

async function rebuild(reason) {
  if (building) { again = true; return building; }
  building = (async () => {
    do {
      again = false;
      const t = Date.now();
      await import(pathToFileURL(join(ROOT, 'build.mjs')).href + '?t=' + t).catch((err) => console.error('构建失败：', err.message));
      console.log(`已重新构建（${reason}），用时 ${Date.now() - t} ms\n`);
      for (const res of clients) res.write('data: reload\n\n');
    } while (again);
    building = null;
  })();
  return building;
}

createServer((req, res) => {
  if (req.url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('data: connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = normalize(join(ROOT, path === '/' ? '/index.html' : path));
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 ' + path);
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (extname(file) === '.html') res.end(readFileSync(file, 'utf8').replace('</body>', RELOAD_SCRIPT + '</body>'));
  else createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Luma Home 本地预览：http://localhost:${PORT}\n修改 site.config.js、src、js、css 会自动重建并刷新。Ctrl+C 结束。\n`);
  rebuild('启动');
});

let timer = 0;
for (const target of ['site.config.js', 'build.mjs', 'src', 'js', 'css']) {
  const full = join(ROOT, target);
  if (!existsSync(full)) continue;
  watch(full, { recursive: true }, (_event, file) => {
    clearTimeout(timer);
    timer = setTimeout(() => rebuild(file || target), 160);
  });
}
