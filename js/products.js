/* 产品系列：开灯预览、拖动旋转（有序列图时）、材质换图、加入购物袋、详情。 */
import { site } from './site.js';
import { $, $$, clamp } from './util.js';
import { addToBag, openSheet } from './shop.js';

const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IDLE = 4; // 空闲时每秒转过的帧数

/* ── 序列图旋转：把序列图作为背景，按帧移动 background-position ── */
function startSpin(st, spinEl, li) {
  if (st.raf || !spinEl || st.failed) return;
  const frames = Number(spinEl.dataset.frames) || 24;
  const cols = Number(spinEl.dataset.cols) || 6;
  const rows = Number(spinEl.dataset.rows) || 4;
  if (!st.preload) {
    st.preload = new Image();
    st.preload.onload = () => { spinEl.style.backgroundImage = `url("${spinEl.dataset.spinSheet}")`; li.classList.add('is-spin'); st.loaded = true; };
    st.preload.onerror = () => { st.failed = true; stopSpin(st, li); };
    st.preload.src = spinEl.dataset.spinSheet;
  }
  let last = 0;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (!st.dragging) {
      st.rot += st.vel * dt;
      st.vel += ((still ? 0 : IDLE) - st.vel) * Math.min(1, dt * 2);
    }
    const f = ((Math.round(st.rot) % frames) + frames) % frames;
    if (f !== st.frame && st.loaded) {
      st.frame = f;
      spinEl.style.backgroundPosition = `${((f % cols) / (cols - 1)) * 100}% ${(Math.floor(f / cols) / (rows - 1)) * 100}%`;
    }
    st.raf = requestAnimationFrame(tick);
  };
  st.raf = requestAnimationFrame(tick);
}
function stopSpin(st, li) {
  cancelAnimationFrame(st.raf);
  st.raf = 0;
  li.classList.remove('is-spin');
  st.frame = -1;
}

function bindCard(li) {
  const p = site.collection.products.find((x) => x.id === li.dataset.id);
  if (!p) return null;
  const media = $('[data-media]', li);
  const power = $('[data-power]', li);
  const main = $('[data-img-role="main"]', li);
  const spinEl = $('[data-spin-el]', li);
  const st = { hover: false, pinned: false, finish: p.finish, rot: 0, vel: 0, raf: 0, frame: -1, loaded: false, failed: false, dragging: false };
  const sync = () => li.classList.toggle('is-lit', st.hover || st.pinned);

  const setFinish = (id) => {
    st.finish = id;
    $$('[data-finish]', li).forEach((x) => x.setAttribute('aria-checked', String(x.dataset.finish === id)));
    const src = p.images.finishes?.[id];
    if (!src || !main || main.getAttribute('src') === src) return;
    const pre = new Image();
    pre.onload = () => { main.src = src; li.classList.remove('is-swap'); };
    pre.onerror = () => li.classList.remove('is-swap');
    li.classList.add('is-swap');
    pre.src = src;
  };

  if (canHover) {
    media.addEventListener('pointerenter', () => { st.hover = true; sync(); startSpin(st, spinEl, li); });
    media.addEventListener('pointerleave', () => {
      st.hover = false;
      sync();
      if (!st.pinned) setTimeout(() => { if (!st.hover && !st.pinned && !st.dragging) stopSpin(st, li); }, 260);
    });
    // 照片轻微跟随指针倾斜
    if (!still) {
      media.addEventListener('pointermove', (e) => {
        const r = media.getBoundingClientRect();
        media.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2) + 'deg');
        media.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 7).toFixed(2) + 'deg');
      });
      media.addEventListener('pointerleave', () => { media.style.setProperty('--ry', '0deg'); media.style.setProperty('--rx', '0deg'); });
    }
  }
  const togglePower = () => { st.pinned = !st.pinned; if (power) power.setAttribute('aria-pressed', String(st.pinned)); sync(); };
  power?.addEventListener('click', (e) => { e.stopPropagation(); togglePower(); });

  media.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    media.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const r0 = st.rot;
    let lastX = x0;
    let lastT = performance.now();
    let travel = 0;
    st.dragging = true;
    st.vel = 0;
    startSpin(st, spinEl, li);
    const move = (ev) => {
      const now = performance.now();
      const dx = ev.clientX - lastX;
      st.rot = r0 + (ev.clientX - x0) * 0.055;
      st.vel = st.vel * 0.4 + ((dx * 0.055 / Math.max(1, now - lastT)) * 1000) * 0.6;
      travel += Math.abs(dx);
      lastX = ev.clientX;
      lastT = now;
    };
    const up = () => {
      media.removeEventListener('pointermove', move);
      media.removeEventListener('pointerup', up);
      media.removeEventListener('pointercancel', up);
      st.dragging = false;
      st.vel = clamp(st.vel, -40, 40);
      if (travel < 5 && !canHover) togglePower();
      if (!canHover && !st.pinned) setTimeout(() => { if (!st.dragging && !st.pinned) stopSpin(st, li); }, 1400);
    };
    media.addEventListener('pointermove', move);
    media.addEventListener('pointerup', up);
    media.addEventListener('pointercancel', up);
  });

  $$('[data-finish]', li).forEach((b) => b.addEventListener('click', () => setFinish(b.dataset.finish)));
  const add = $('[data-add]', li);
  add?.addEventListener('click', () => {
    addToBag({ id: p.id, finish: st.finish, qty: 1 });
    const label = add.textContent;
    add.textContent = '已加入 ✓';
    setTimeout(() => { add.textContent = label; }, 1400);
  });
  $$('[data-detail]', li).forEach((b) => b.addEventListener('click', () => openSheet(p.id)));
  return { li, st };
}

export function initProducts() {
  const grid = $('[data-products]');
  if (!grid) return;
  const cards = $$('.pcard', grid).map(bindCard).filter(Boolean);
  const filterBtns = $$('[data-filters] [data-filter]');
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    const key = btn.dataset.filter;
    filterBtns.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    let n = 0;
    cards.forEach(({ li, st }) => {
      li.hidden = !(key === 'all' || li.dataset.series === key);
      if (li.hidden) { stopSpin(st, li); return; }
      li.style.setProperty('--i', n++ % 4);
      li.classList.remove('rise');
      void li.offsetWidth;
      li.classList.add('rise');
    });
  }));
}
