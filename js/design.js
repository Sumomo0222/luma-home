/* 设计理念：滚动时逐张切换细节图；选择表面材质时，换成对应材质的细节图。 */
import { site } from './site.js';
import { finishById } from './tpl/core.js';
import { $, $$, clamp, onScrollResize, whenInView } from './util.js';

export function initDesign() {
  const section = $('[data-scrolly]');
  if (!section) return;
  const imgs = $$('[data-step-img]', section);
  const steps = $$('[data-step]', section);
  const swatches = $('[data-finish-swatches]', section);
  const desc = $('[data-finish-desc]', section);
  if (!imgs.length) return;

  const cache = new Map();
  const preload = (src) => new Promise((resolve) => {
    if (cache.has(src)) return resolve(cache.get(src));
    const im = new Image();
    im.onload = () => { cache.set(src, im); resolve(im); };
    im.onerror = () => resolve(null);
    im.src = src;
  });
  const swap = async (img, src) => {
    img.dataset.want = src;
    if (await preload(src)) { if (img.dataset.want === src) img.src = src; }
    else delete img.dataset.want;
  };

  swatches?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-finish]');
    if (!b) return;
    const f = finishById(site, b.dataset.finish);
    if (desc) desc.textContent = `${f.name} · ${f.desc}`;
    $$('[data-finish]', swatches).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    imgs.forEach((img) => {
      const src = img.dataset.finishes ? JSON.parse(img.dataset.finishes)[b.dataset.finish] : null;
      if (src && img.getAttribute('src') !== src) swap(img, src);
    });
  });

  let active = -1;
  const update = () => {
    const rect = section.getBoundingClientRect();
    const offset = matchMedia('(max-width: 980px)').matches ? 70 : 84;
    const span = rect.height - innerHeight + offset;
    const p = span > 40 ? clamp((offset - rect.top) / span) : 1;
    const i = Math.min(steps.length - 1, Math.floor(p * steps.length + 1e-4));
    if (i === active) return;
    active = i;
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
  };
  onScrollResize(update);
  update();
}
