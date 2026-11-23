/* 占位图渲染台：在无界面浏览器里运行，由 tools/render-assets.mjs 通过 DevTools 协议调用。
   对外只暴露 window.studio，四个方法都返回图片的 dataURL：
     product({ id, finish, lit, … })  单件产品图（透明背景）
     spin({ id, finish, frames, … })  360° 序列图
     room({ s, w, h, … })             首屏房间场景（s: 0 清晨 … 1 夜间）
     design({ step, finish, … })      设计理念细节图 */
import { createRenderer, makeEnvironment, Studio, buildProduct, whenLoaded } from './models.js';
import { createRoom } from './room.js';
import { sample } from './scenes.js';

const off = document.createElement('canvas');
const renderer = createRenderer(off, { alpha: true, dprCap: 1 });
renderer.setPixelRatio(1);
renderer.setSize(1024, 1280, false);
const studio = new Studio(renderer, makeEnvironment(renderer, 'studio'));

const models = new Map();
const model = (id) => {
  if (!models.has(id)) models.set(id, buildProduct(id, 'champagne'));
  return models.get(id);
};

let room = null;
const getRoom = () => (room ||= createRoom(document.createElement('canvas'), { manual: true }));

/* 细微的胶片颗粒，让画面更接近实拍 */
const noise = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const d = g.createImageData(256, 256);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 110 + rnd() * 90;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return c;
})();

/** 先以 ss 倍超采样绘制，再缩小到目标尺寸；可选背景、暗角、颗粒。 */
function compose(w, h, paint, { ss = 2, type = 'image/webp', quality = 0.9, backdrop = null, vignette = 0, grain = 0, contrast = 1 } = {}) {
  const big = document.createElement('canvas');
  big.width = Math.round(w * ss);
  big.height = Math.round(h * ss);
  paint(big.getContext('2d'), big.width, big.height);
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  if (backdrop) backdrop(ctx, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (contrast !== 1) ctx.filter = `contrast(${contrast}) saturate(1.04)`;
  ctx.drawImage(big, 0, 0, w, h);
  ctx.filter = 'none';
  if (vignette > 0) {
    const g = ctx.createRadialGradient(w / 2, h * 0.46, Math.min(w, h) * 0.36, w / 2, h / 2, Math.max(w, h) * 0.76);
    g.addColorStop(0, 'rgba(22,13,6,0)');
    g.addColorStop(1, `rgba(22,13,6,${vignette})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  if (grain > 0) {
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = grain;
    ctx.fillStyle = ctx.createPattern(noise, 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  return out.toDataURL(type, quality);
}

const GLOW_KELVIN = { dawn: 2200, night: 1800, day: 5000, dinner: 2600 };
const glowKelvin = (id) => ({ 'halo-floor': 2600, 'halo-orb': 2200, 'halo-pendant': 2600, 'veil-panel': 5000, 'veil-mirror': 2600, 'tide-strip': 1800 }[id] || 2600);

async function product({ id, finish = 'champagne', lit = 0.3, angle = 0, w = 1000, h = 1250, quality = 0.9 }) {
  const m = model(id);
  m.setFinish(finish);
  await whenLoaded();
  m.setGlow(lit, glowKelvin(id));
  return compose(w, h, (ctx, W, H) => studio.draw(ctx, m, { w: W, h: H, rotY: angle, lit, cam: m.cam }), { ss: 2, type: 'image/webp', quality });
}

async function spin({ id, finish = 'champagne', frames = 24, cols = 6, rows = 4, fw = 240, fh = 300, lit = 0.3, quality = 0.84 }) {
  const m = model(id);
  m.setFinish(finish);
  await whenLoaded();
  m.setGlow(lit, glowKelvin(id));
  const ss = 2;
  const cell = document.createElement('canvas');
  cell.width = fw * ss;
  cell.height = fh * ss;
  const cctx = cell.getContext('2d');
  const sheet = document.createElement('canvas');
  sheet.width = fw * cols;
  sheet.height = fh * rows;
  const sctx = sheet.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  for (let f = 0; f < frames; f++) {
    // 第 0 帧与主图同一角度，卡片从静态切到旋转时不会跳；负号让「向右拖动 = 正面向右转」
    cctx.clearRect(0, 0, cell.width, cell.height);
    studio.draw(cctx, m, { w: cell.width, h: cell.height, rotY: -(f / frames) * Math.PI * 2, lit, cam: m.cam });
    sctx.drawImage(cell, (f % cols) * fw, Math.floor(f / cols) * fh, fw, fh);
  }
  return sheet.toDataURL('image/webp', quality);
}

async function roomShot({ s = 0, w = 2400, h = 1350, pos, target, fov, quality = 0.86 }) {
  const r = getRoom();
  await r.ready;
  const ss = 1.25;
  const src = r.still(sample(s), { w, h, ss, pos, target, fov });
  return compose(w, h, (ctx, W, H) => ctx.drawImage(src, 0, 0, W, H), { ss, type: 'image/jpeg', quality, vignette: 0.2, grain: 0.05, contrast: 1.02 });
}

async function og({ quality = 0.86 }) {
  const r = getRoom();
  await r.ready;
  const w = 1200;
  const h = 630;
  const ss = 1.25;
  const src = r.still(sample(0), { w: Math.round(w * 1.1), h: Math.round(h * 1.1), ss, pos: [-1.5, 1.32, 4.5], target: [0.7, 1.05, -1.3], fov: 40 });
  return compose(w, h, (ctx, W, H) => ctx.drawImage(src, 0, 0, W, H), { ss, type: 'image/jpeg', quality, vignette: 0.24, grain: 0.05, contrast: 1.02 });
}

/* 设计理念：每一步的镜头与灯头状态 */
const STEPS = [
  { dist: 2.75, ty: 0.83, elev: 0.14, az: -0.3, lift: 0, glow: 0.5, fov: 26, tx: 0.16, face: false },
  { dist: 1.0, ty: 1.5, elev: -0.12, az: -0.55, lift: 0, glow: 1, fov: 32, tx: 0.1, face: true },
  { dist: 0.9, ty: 1.52, elev: 0.2, az: 0.4, lift: 0.11, glow: 0.75, fov: 32, tx: 0.08, face: true },
  { dist: 1.3, ty: 0.2, elev: 0.2, az: -0.25, lift: 0, glow: 0.25, fov: 32, tx: 0, face: false },
];
const designBackdrop = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#f1e9dc');
  g.addColorStop(1, '#d6c8b3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = ctx.createRadialGradient(w * 0.5, h * 0.36, 0, w * 0.5, h * 0.36, w * 0.78);
  r.addColorStop(0, 'rgba(255,226,188,.6)');
  r.addColorStop(1, 'rgba(255,238,214,0)');
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, w, h);
};
async function design({ step = 0, finish = 'champagne', id = 'halo-floor', w = 1200, h = 1500, quality = 0.86 }) {
  const m = model(id);
  const k = STEPS[step] || STEPS[0];
  m.setFinish(finish);
  await whenLoaded();
  m.head.position.y = 1.585 + k.lift;
  // 特写时让灯头转向镜头
  const rotY = k.face ? -Math.PI / 2 + 0.25 : 0.4;
  return compose(w, h, (ctx, W, H) => studio.draw(ctx, m, { w: W, h: H, rotY, lit: k.glow, cam: { dist: k.dist, targetY: k.ty, elev: k.elev, az: k.az, fov: k.fov, refAspect: 0.8, tx: k.tx, ground: step !== 1 } }),
    { ss: 1.5, type: 'image/jpeg', quality, backdrop: designBackdrop, vignette: 0.22, grain: 0.05 });
}

/* 渲染必须串行（共用一个渲染器） */
let queue = Promise.resolve();
const serialize = (fn) => (...args) => (queue = queue.then(() => fn(...args), () => fn(...args)));

window.studio = {
  ready: Promise.resolve(true),
  product: serialize(product),
  spin: serialize(spin),
  room: serialize(roomShot),
  og: serialize(og),
  design: serialize(design),
};
