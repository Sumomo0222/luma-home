/* 购物袋、产品详情面板、结算与预约表单。
   下单与留资按 site.config.js 里的 integrations 配置走真实渠道：
     email —— 调起访客的邮件应用（不需要后端）
     api   —— 提交到 endpoint（见 README 的接口约定） */
import { site } from './site.js';
import { productById, finishById, money, telHref, mailHref, esc, isLinkMode } from './tpl/core.js';
import { sheet as sheetTpl, bagItem as bagItemTpl, checkout as checkoutTpl, checkoutDone } from './tpl/shop.js';
import { $, $$, store, lockScroll, escapeHtml } from './util.js';
import { track } from './chrome.js';

const KEY = 'luma-home-bag';
const svg = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const PHONE = /^1\d{10}$/;

let bag = load();
let locks = 0;
let toastTimer = 0;
const focusStack = [];
const link = isLinkMode(site);

function load() {
  const v = store.get(KEY, []);
  return Array.isArray(v) ? v.filter((i) => i && productById(site, i.id) && i.qty > 0) : [];
}
const save = () => store.set(KEY, bag);
const toItems = () => bag.map((i) => ({ ...i, product: productById(site, i.id) }));
const countOf = (id) => bag.filter((i) => i.id === id).reduce((n, i) => n + i.qty, 0);
export const bagCount = () => bag.reduce((n, i) => n + i.qty, 0);
export const bagSubtotal = () => toItems().reduce((s, i) => s + i.product.price * i.qty, 0);

/** 凑齐某个套装或某个房间的整套搭配时，返回优惠金额（取最大）。 */
export function bundleDiscount() {
  const sets = [
    ...site.buy.bundles.map((b) => b.items),
    ...site.space.rooms.map((r) => r.items.map((it) => [it.product, it.qty])),
  ];
  let best = 0;
  for (const items of sets) {
    if (items.every(([id, qty]) => countOf(id) >= qty)) {
      best = Math.max(best, items.reduce((s, [id, qty]) => s + (productById(site, id)?.price || 0) * qty, 0) * (1 - site.buy.bundleDiscount));
    }
  }
  return best;
}

/* ---------- 提示与弹层 ---------- */
export function toast(html) {
  const el = $('[data-toast]');
  el.innerHTML = svg('i-check') + `<span>${html}</span>`;
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
}
function openLayer(el, focusSel) {
  focusStack.push(document.activeElement);
  el.hidden = false;
  if (++locks === 1) lockScroll(true);
  requestAnimationFrame(() => $(focusSel, el)?.focus());
}
function closeLayer(el) {
  if (el.hidden) return;
  el.hidden = true;
  if (locks > 0 && --locks === 0) lockScroll(false);
  const prev = focusStack.pop();
  if (prev && prev.focus) prev.focus();
}

/* ---------- 购物袋 ---------- */
function renderBag() {
  const list = $('[data-bag-list]');
  const empty = $('[data-bag-empty]');
  const foot = $('[data-bag-foot]');
  const n = bagCount();
  $$('[data-bag-count]').forEach((b) => { b.hidden = n === 0; b.textContent = n > 99 ? '99+' : String(n); });
  const text = $('[data-bag-count-text]');
  if (text) text.textContent = n + ' 件';
  if (!bag.length) {
    list.hidden = true; empty.hidden = false; if (foot) foot.hidden = true;
    list.innerHTML = '';
    return;
  }
  list.hidden = false; empty.hidden = true; if (foot) foot.hidden = false;
  list.innerHTML = toItems().map((it, idx) => bagItemTpl(site, it, idx)).join('');
  const sub = bagSubtotal();
  const off = bundleDiscount();
  const totalEl = $('[data-bag-subtotal]');
  if (totalEl) totalEl.textContent = money(sub - off);
  const hint = $('[data-bag-hint]');
  if (hint) hint.textContent = off > 0 ? `已享套装 ${Math.round(site.buy.bundleDiscount * 100)} 折，省 ${money(off)}` : sub >= site.buy.freeInstallThreshold ? '已赠上门安装 · 全场包邮' : `再买 ${money(site.buy.freeInstallThreshold - sub)} 即赠上门安装`;
}

export function addToBag(item, { quiet = false } = {}) {
  const p = productById(site, item.id);
  if (!p) return;
  const qty = item.qty || 1;
  const finish = p.finishes.includes(item.finish) ? item.finish : p.finish;
  const hit = bag.find((i) => i.id === item.id && i.finish === finish);
  if (hit) hit.qty = Math.min(99, hit.qty + qty); else bag.push({ id: item.id, finish, qty });
  save();
  renderBag();
  $$('[data-bag-count]').forEach((b) => { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
  if (!quiet) toast(`${escapeHtml(p.name)} 已加入购物袋`);
}

export function addItems(list) {
  let pieces = 0;
  for (const [id, qty] of list) { addToBag({ id, qty }, { quiet: true }); pieces += qty; }
  toast(`已加入 ${pieces} 件搭配`);
  openBag();
}

function openBag() { renderBag(); openLayer($('[data-bag]'), '[data-bag-close]'); }
function closeBag() { closeLayer($('[data-bag]')); }

/* ---------- 产品详情 ---------- */
let unregisterSheetKey = null;

export function openSheet(id) {
  const p = productById(site, id);
  const root = $('.sheet[data-sheet]');
  if (!p || !root) return;
  const panel = $('[data-sheet-panel]', root);
  panel.innerHTML = sheetTpl(site, p);
  panel.scrollTop = 0;

  let finish = p.finish;
  let qty = 1;
  let lit = false;
  const image = $('[data-sheet-img]', panel);
  const stage = $('.sheet__stage', panel);
  const show = () => { if (image) image.src = lit ? (stage.dataset.lit || stage.dataset.main) : (p.images.finishes?.[finish] || stage.dataset.main); };
  $('[data-sheet-lit]', panel)?.addEventListener('click', (e) => {
    lit = !lit;
    e.currentTarget.setAttribute('aria-pressed', String(lit));
    show();
  });
  $$('[data-finish]', panel).forEach((b) => b.addEventListener('click', () => {
    finish = b.dataset.finish;
    $$('[data-finish]', panel).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    show();
  }));
  $$('[data-qty]', panel).forEach((b) => b.addEventListener('click', () => {
    qty = Math.max(1, Math.min(9, qty + Number(b.dataset.qty)));
    const v = $('[data-qty-value]', panel);
    if (v) v.textContent = qty;
  }));
  $('[data-sheet-add]', panel)?.addEventListener('click', () => { addToBag({ id, finish, qty }); closeSheet(); openBag(); });
  root.hidden = false;
  unregisterSheetKey = (e) => { if (e.key === 'Escape') closeSheet(); };
  addEventListener('keydown', unregisterSheetKey);
  openLayer(root, '[data-sheet-close]');
}

function closeSheet() {
  const root = $('.sheet[data-sheet]');
  if (!root || root.hidden) return;
  closeLayer(root);
  if (unregisterSheetKey) { removeEventListener('keydown', unregisterSheetKey); unregisterSheetKey = null; }
}

/* ---------- 结算 ---------- */
async function postLead(type, payload) {
  const conf = type === 'order' ? site.integrations.checkout : site.integrations.forms;
  const res = await fetch(conf.endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, ...payload }), signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined,
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json().catch(() => ({}));
}

function readForm(form, { minName = 2 } = {}) {
  const data = new FormData(form);
  const bad = [];
  const mark = (name, ok, msg) => { form.querySelector(`[name="${name}"]`)?.closest('label, .check')?.classList.toggle('is-bad', !ok); if (!ok) bad.push(msg); };
  const val = (k) => String(data.get(k) || '').trim();
  const phone = val('phone').replace(/\s/g, '');
  mark('name', val('name').length >= minName, minName > 1 ? '姓名至少 2 个字' : '请填写称呼');
  mark('phone', PHONE.test(phone), '手机号需为 11 位');
  mark('consent', data.get('consent') === 'on', '请先阅读并同意相关条款');
  return { data, val, phone, bad };
}

async function submitCheckout(form, panel) {
  const { data, val, phone, bad } = readForm(form);
  const address = val('address');
  if (address.length < 6) { form.querySelector('[name="address"]')?.closest('label')?.classList.add('is-bad'); bad.push('请填写完整地址'); }
  const err = $('[data-co-error]', panel);
  if (bad.length) { err.textContent = bad.join('；'); err.hidden = false; return; }
  err.hidden = true;
  const items = toItems().map((it) => ({ id: it.id, name: it.product.name, finish: finishById(site, it.finish).name, qty: it.qty, price: it.product.price }));
  const off = bundleDiscount();
  const payload = { items, customer: { name: val('name'), phone, address, note: val('note') }, subtotal: bagSubtotal(), discount: off, total: bagSubtotal() - off, page: location.href, submittedAt: new Date().toISOString() };
  const btn = $('button[type="submit"]', form);
  const phoneText = `也可以直接致电 <a href="${esc(telHref(site.contact.phone))}">${esc(site.contact.phone)}</a> 下单`;
  if (site.integrations.checkout.mode === 'api') {
    btn.disabled = true;
    try {
      const out = await postLead('order', payload);
      panel.innerHTML = checkoutDone(site, { title: '订单已提交', text: `订单编号 <b>${esc(out.ref || out.orderNo || '')}</b>。顾问会在 ${esc(site.contact.serviceHours)} 联系你，确认商品、支付方式与安装时间。` });
      bag = []; save(); renderBag();
    } catch {
      err.innerHTML = `提交没有成功，请稍后再试，或${phoneText}。`;
      err.hidden = false;
    }
    btn.disabled = false;
  } else {
    const lines = [`订单意向 — ${site.brand.name}`, '', ...items.map((it) => `${it.name}（${it.finish}）× ${it.qty}　${money(it.price * it.qty)}`), '', `合计：${money(payload.total)}${off ? `（已含套装优惠 −${money(off)}）` : ''}`, '', `姓名：${payload.customer.name}`, `手机：${phone}`, `地址：${payload.customer.address}`, payload.customer.note ? `备注：${payload.customer.note}` : ''];
    location.href = mailHref(site.contact.email, `${site.brand.name} 订单意向 — ${bagCount()} 件`, lines.join('\n'));
    panel.innerHTML = checkoutDone(site, { title: '订单邮件已生成', text: `已为你生成一封订单意向邮件，收件人是 <b>${esc(site.contact.email)}</b>。如果没有自动打开邮件应用，${phoneText}。` });
    bag = []; save(); renderBag();
  }
}

function openCheckout() {
  if (!bag.length) return;
  closeBag();
  const root = $('[data-checkout]');
  const panel = $('[data-checkout-panel]', root);
  panel.innerHTML = checkoutTpl(site, toItems(), bundleDiscount());
  const bindClose = () => $$('[data-checkout-close]', root).forEach((b) => b.addEventListener('click', () => closeLayer(root)));
  bindClose();
  const form = $('[data-checkout-form]', panel);
  form?.addEventListener('submit', (e) => { e.preventDefault(); submitCheckout(form, panel).then(bindClose); track('checkout_submit'); });
  openLayer(root, '[name="name"]');
}

/* ---------- 预约灯光顾问 ---------- */
function initAdvisor() {
  const form = $('[data-care-form]');
  if (!form) return;
  const done = $('[data-form-done]');
  const error = $('[data-form-error]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data, val, phone, bad } = readForm(form, { minName: 1 });
    if (bad.length) { error.textContent = bad.join('；'); error.hidden = false; return; }
    error.hidden = true;
    const payload = { name: val('name'), phone, city: val('city'), room: String(data.get('room') || ''), note: val('note'), page: location.href, submittedAt: new Date().toISOString() };
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    const doneText = $('[data-form-done-text]', done);
    if (site.integrations.forms.mode === 'api') {
      try {
        const out = await postLead('advisor', payload);
        doneText.innerHTML = `登记编号 <b>${esc(out.ref || '')}</b>。顾问会在 ${esc(site.contact.serviceHours)} 联系你。`;
        form.hidden = true; done.hidden = false; form.reset();
      } catch {
        error.innerHTML = `提交没有成功，请稍后再试，或直接致电 <a href="${esc(telHref(site.contact.phone))}">${esc(site.contact.phone)}</a>。`;
        error.hidden = false;
      }
    } else {
      const lines = [`预约灯光顾问 — ${site.brand.name}`, '', `称呼：${payload.name}`, `手机：${phone}`, `城市：${payload.city}`, `房间：${payload.room}`, `问题：${payload.note}`];
      location.href = mailHref(site.contact.email, `${site.brand.name} 预约灯光顾问`, lines.join('\n'));
      doneText.innerHTML = `已为你生成一封预约邮件，收件人是 <b>${esc(site.contact.email)}</b>。如果没有自动打开邮件应用，也可以直接致电 <a href="${esc(telHref(site.contact.phone))}">${esc(site.contact.phone)}</a>。`;
      form.hidden = true; done.hidden = false; form.reset();
    }
    btn.disabled = false;
    done.querySelector('button')?.focus();
  });
  $('[data-form-reset]')?.addEventListener('click', () => { done.hidden = true; form.hidden = false; form.querySelector('input')?.focus(); });
}

/* ---------- 入口 ---------- */
export function initShop() {
  if (link) return;
  renderBag();
  $$('[data-bag-open]').forEach((b) => b.addEventListener('click', openBag));
  $$('[data-bag-close]').forEach((b) => b.addEventListener('click', closeBag));
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sheet-close]')) closeSheet();
    if (e.target.closest('[data-bag-close]') && !$('[data-bag]').hidden) closeBag();
  });
  $('[data-bag-checkout]')?.addEventListener('click', openCheckout);
  // 套装加入购物袋
  $('[data-bundles]')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bundle]');
    const bundle = site.buy.bundles.find((x) => x.id === b?.dataset.bundle);
    if (bundle) addItems(bundle.items);
  });
  $('[data-bag-list]').addEventListener('click', (e) => {
    const li = e.target.closest('.bagitem');
    if (!li) return;
    const item = bag[Number(li.dataset.idx)];
    if (!item) return;
    if (e.target.closest('[data-rm]')) bag.splice(Number(li.dataset.idx), 1);
    else if (e.target.closest('[data-qty]')) item.qty = Math.max(1, Math.min(99, item.qty + Number(e.target.closest('[data-qty]').dataset.qty)));
    else return;
    save();
    renderBag();
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const co = $('[data-checkout]');
    if (!co.hidden) closeLayer(co);
    else if (!$('[data-bag]').hidden) closeBag();
  });
  initAdvisor();
}
