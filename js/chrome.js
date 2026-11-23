/* 导航、滚动出现、客服浮窗、点击埋点、缺失图片提示。 */
import { site } from './site.js';
import { $, $$, onScrollResize, lockScroll, reducedMotion, whenInView } from './util.js';

/** 埋点：有 data-track 属性的元素被点击时触发，可接任意统计系统。 */
export function track(event, data = {}) {
  if (!site.integrations.trackHook) return;
  const payload = { event, ...data, page: location.pathname };
  try {
    if (typeof window.lumaTrack === 'function') window.lumaTrack(event, payload);
    if (site.integrations.analytics.baidu && Array.isArray(window._hmt)) window._hmt.push(['_trackEvent', 'site', event, data.product || data.label || '']);
    if (site.integrations.analytics.gtag && typeof window.gtag === 'function') window.gtag('event', event, data);
  } catch { /* 统计失败不影响页面 */ }
}

function initNav() {
  const nav = $('[data-nav]');
  const toggle = $('[data-nav-toggle]');
  const links = $('[data-nav-links]');
  if (!nav) return;
  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', '打开菜单');
    lockScroll(false);
  };
  onScrollResize(() => nav.classList.toggle('is-floating', scrollY > 36));
  toggle?.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    lockScroll(open);
  });
  $$('a', links).forEach((a) => a.addEventListener('click', closeMenu));
}

function initReveal() {
  const items = $$('.reveal');
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  items.forEach((el) => io.observe(el));
}

/** 右下角客服浮窗：滚过首屏后出现。 */
function initService() {
  const box = $('[data-cs]');
  if (!box) return;
  const panel = $('.cs__panel', box);
  const toggles = $$('[data-cs-toggle]');
  const set = (open) => {
    panel.hidden = !open;
    toggles.forEach((b) => b.setAttribute('aria-expanded', String(open)));
    box.classList.toggle('is-open', open);
  };
  toggles.forEach((btn) => btn.addEventListener('click', () => set(panel.hidden)));
  addEventListener('click', (e) => { if (!box.classList.contains('is-open') || e.target.closest('[data-cs], [data-cs-toggle]')) return; set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  const hero = $('[data-hero]');
  const mbar = $('[data-mbar]');
  onScrollResize(() => {
    const past = scrollY > (hero?.offsetHeight || 600) * 0.7;
    box.classList.toggle('is-visible', past);
    mbar?.classList.toggle('is-visible', past);
  });
}

/** 图片没替换上或路径写错时，在原位显示文件名，方便定位。 */
function initImageGuard() {
  const mark = (img) => {
    if (!(img instanceof HTMLImageElement) || !img.hasAttribute('data-img') || !img.isConnected) return;
    const name = decodeURIComponent(String(img.getAttribute('src') || '').split('/').pop() || '图片');
    const box = document.createElement('span');
    box.className = `${img.className} is-missing`;
    for (const attr of img.attributes) if (attr.name.startsWith('data-') || attr.name === 'style' || attr.name === 'width' || attr.name === 'height') box.setAttribute(attr.name, attr.value);
    box.textContent = `缺少图片：${name}`;
    img.replaceWith(box);
  };
  document.addEventListener('error', (e) => mark(e.target), true);
  $$('img[data-img]').forEach((img) => { if (img.complete && img.naturalWidth === 0) mark(img); });
}

export function initChrome() {
  initNav();
  initReveal();
  initService();
  initImageGuard();
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) track(el.dataset.track, { product: el.dataset.product, label: (el.textContent || '').trim().slice(0, 30) });
  }, { passive: true });
}

export { whenInView };
