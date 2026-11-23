/* Luma Home — 通用小工具。 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarsePointer = () => matchMedia('(hover: none), (pointer: coarse)').matches;

/** 基于时间的补间，可取消。 */
export function animate(duration, onUpdate, ease = easeInOut) {
  let raf = 0;
  let start;
  let cancelled = false;
  const done = new Promise((resolve) => {
    const step = (now) => {
      if (cancelled) return resolve(false);
      if (start === undefined) start = now;
      const t = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
      onUpdate(ease(t), t);
      if (t < 1) raf = requestAnimationFrame(step);
      else resolve(true);
    };
    raf = requestAnimationFrame(step);
  });
  return {
    cancel() { cancelled = true; cancelAnimationFrame(raf); },
    done,
  };
}

/** 按名字管理的补间集合：同名补间会互相取代。 */
export function tweens() {
  const map = new Map();
  return {
    run(key, duration, onUpdate, ease) {
      map.get(key)?.cancel();
      const a = animate(duration, onUpdate, ease);
      map.set(key, a);
      a.done.then(() => { if (map.get(key) === a) map.delete(key); });
      return a.done;
    },
    cancel(key) { map.get(key)?.cancel(); map.delete(key); },
    cancelAll() { map.forEach((a) => a.cancel()); map.clear(); },
  };
}

/** rAF 节流的滚动 + resize 监听。 */
export function onScrollResize(cb) {
  let raf = 0;
  let alive = true;
  const schedule = () => {
    if (raf || !alive) return;
    raf = requestAnimationFrame(() => { raf = 0; if (alive) cb(); });
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  schedule();
  return () => { alive = false; removeEventListener('scroll', schedule); removeEventListener('resize', schedule); };
}

export function whenInView(el, cb, margin = '0px 0px -8% 0px') {
  if (!('IntersectionObserver' in window)) { cb(true, 1); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) cb(e.isIntersecting, e.intersectionRatio);
  }, { rootMargin: margin, threshold: [0, 0.08, 0.25, 0.5, 0.75, 1] });
  io.observe(el);
  return () => io.disconnect();
}

export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 隐私模式下忽略 */ }
  },
};

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 简易路由节流：限制每秒调用次数。 */
export function lockScroll(lock) {
  document.body.classList.toggle('is-locked', lock);
}
