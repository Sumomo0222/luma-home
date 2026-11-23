/* 模板公共函数：纯字符串处理，构建脚本（Node）与浏览器都可调用。 */

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 按路径取配置值，如 get(site, 'contact.phone')。 */
export const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

export const money = (n) => '¥' + Math.round(Number(n) || 0).toLocaleString('en-US');
export const num = (n, decimals = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
export const icon = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${id}"/></svg>`;

/** 文本里的 {…} 会排成强调样式。 */
export const em = (s) => esc(s).replace(/\{([^}]+)\}/g, '<em>$1</em>');

export const productById = (site, id) => site.collection.products.find((p) => p.id === id) || null;
export const finishById = (site, id) => site.collection.finishes.find((f) => f.id === id) || site.collection.finishes[0];
export const seriesOf = (site, p) => site.collection.series.find((s) => s.id === p.series) || null;

const SERIES_ACCENT = { halo: 'dinner', veil: 'day', tide: 'night', luma: 'dawn' };
/** 卡片背景色调：商品可用 accent 字段覆盖（dawn / day / dinner / night），默认跟随系列。 */
export const accentOf = (site, p) => p.accent || SERIES_ACCENT[p.series] || 'day';

export const checkoutMode = (site) => site.integrations?.checkout?.mode || 'email';
export const isLinkMode = (site) => checkoutMode(site) === 'link';
export const telHref = (phone) => 'tel:' + String(phone || '').replace(/[^\d+]/g, '');
export const mailHref = (email, subject, body) => `mailto:${email}?subject=${encodeURIComponent(subject || '')}${body ? '&body=' + encodeURIComponent(body).replace(/%20/g, '+') : ''}`;

/** 图片标签。没有宽高要求：图片都放在固定比例的容器里，不会引起布局抖动。 */
export function img(src, alt, { cls = '', loading = 'lazy', extra = '' } = {}) {
  if (!src) return '';
  return `<img src="${esc(src)}" alt="${esc(alt)}" loading="${loading}" decoding="async"${cls ? ` class="${cls}"` : ''}${extra ? ' ' + extra : ''} data-img>`;
}

export const sum = (list, fn) => list.reduce((s, x) => s + fn(x), 0);
export const productTotal = (site, items) => sum(items, ([id, qty]) => (productById(site, id)?.price || 0) * qty);
