/* 运行时动态生成的模板：产品详情面板、购物袋条目、结算弹层。 */
import { esc, icon, img, money, num, finishById, seriesOf, accentOf, isLinkMode, productTotal } from './core.js';

const ACCENT_BG = { dawn: '#f6d9c4', day: '#dce6ef', dinner: '#f2d2b0', night: '#d6daea' };

/** 商品在空间示意图与 App 示意里的线描图例（按 symbol 取）。 */
export function symbolGlyph(symbol) {
  const MINI = {
    floor: '<path d="M8 34h12M14 34V10"/><ellipse class="g-glow" cx="14" cy="9" rx="9" ry="2.8"/>',
    table: '<path d="M7 34h14"/><circle class="g-glow" cx="14" cy="24" r="7.5"/>',
    pendant: '<path d="M14 2v12"/><ellipse class="g-glow" cx="14" cy="17" rx="11" ry="3"/>',
    panel: '<rect class="g-glow" x="4" y="6" width="20" height="20" rx="2"/><rect x="8" y="10" width="12" height="12" rx="1" opacity=".45"/>',
    mirror: '<circle class="g-glow" cx="14" cy="16" r="13" opacity=".7"/><circle cx="14" cy="16" r="10.5"/>',
    strip: '<path d="M2 34V12a8 8 0 0 1 8-8h16"/><path class="g-glow" d="M6 34V13a4 4 0 0 1 4-4h16"/>',
    hub: '<path d="M3 25c0-7 5-12 11-12s11 5 11 12"/><path d="M3 25c0 4 5 7 11 7s11-3 11-7"/><circle class="g-glow" cx="14" cy="17" r="2.4"/>',
    shade: '<path d="M2 4h24"/><path d="M4 7v24M9 7v24M14 7v24M19 7v24M24 7v24" opacity=".75"/>',
  };
  return `<svg class="glyph glyph--mini" viewBox="0 0 28 38" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[symbol] || MINI.hub}</svg>`;
}

/* ---------- 产品详情面板 ---------- */
export function sheet(site, p) {
  const finishes = p.finishes.map((id) => finishById(site, id));
  const series = seriesOf(site, p);
  const isLight = p.kind === 'light';
  const cols = isLight
    ? [['色温', p.light.kelvin], ['光通量', p.light.lumens], ['显色指数', 'CRI ' + p.light.cri], ['调光范围', p.light.dim], ['功率', p.light.power], ['频闪深度', '< 0.5%']]
    : (p.sensors
      ? [['光照感应', p.sensors[0]], ['温湿度', p.sensors[1]], ['存在感应', p.sensors[2]], ['噪声', p.sensors[3]], ['连接', 'Thread · Matter'], ['待机功率', p.light?.power || p.standby || '—']]
      : [['噪音', p.motor?.[0] || '—'], ['续航', p.motor?.[2] || '—'], ['透光率', '62%'], ['安装', p.install], ['待机功率', p.standby || p.light?.power || '—'], ['控制', p.control[0]]]);
  const link = isLinkMode(site);
  const buyHref = p.buyUrl || site.integrations.checkout.storeUrl || '#buy';
  return `<div class="sheet__head">
      <p class="eyebrow">${esc(series ? `${series.name} ${series.cn}` : '')}系列 · ${esc(p.tag)}${p.sku ? ' · 型号 ' + esc(p.sku) : ''}</p>
      <button type="button" class="iconbtn" data-sheet-close aria-label="关闭详情">${icon('close')}</button>
    </div>
    <div class="sheet__stage" data-accent="${accentOf(site, p)}" data-main="${esc(p.images.main)}" data-lit="${esc(p.images.lit || '')}">
      ${img(p.images.main, `${p.name} ${p.cn} 产品图`, { cls: 'sheet__img', loading: 'eager', extra: 'data-sheet-img' })}
      ${p.images.lit ? `<button type="button" class="sheet__lit" data-sheet-lit aria-pressed="false">${icon('power')}开灯效果</button>` : ''}
      ${finishes.length > 1 ? `<div class="swatches" role="radiogroup" aria-label="选择表面材质">${finishes.map((f, i) => `<button type="button" class="swatch" role="radio" data-finish="${esc(f.id)}" data-image="${esc(p.images.finishes?.[f.id] || '')}" aria-checked="${f.id === p.finish}" style="--sw:${esc(f.swatch)}" aria-label="${esc(f.name)}"></button>`).join('')}</div>` : ''}
    </div>
    <div class="sheet__body">
      <h3>${esc(p.name)}<span>${esc(p.cn)}</span></h3>
      <p class="sheet__price">${money(p.price)}${p.originalPrice ? `<s>${money(p.originalPrice)}</s>` : ''}</p>
      ${p.rating ? `<p class="sheet__rating"><span class="score__stars">${'★'.repeat(Math.round(p.rating))}</span>${num(p.rating)} · ${num(p.reviews)} 条评价</p>` : ''}
      <p class="sheet__story">${esc(p.story)}</p>
      <section class="sheet__sec">
        <h4>${isLight ? '光线参数' : p.sensors ? '感应与连接' : '电机与参数'}</h4>
        <dl class="speccols">${cols.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </section>
      <section class="sheet__sec"><h4>材质</h4><ul class="tags">${(p.materials || []).map((m) => `<li>${esc(m)}</li>`).join('')}</ul></section>
      <section class="sheet__sec">
        <h4>尺寸与安装</h4>
        <p>${esc(p.size)}${p.sizeNote ? ' · ' + esc(p.sizeNote) : ''}${p.weight && p.weight !== '—' ? ' · ' + esc(p.weight) : ''}<br>${esc(p.install)} · 用时 ${esc(p.installTime)}${p.wiring ? ' · 需要预留电源' : ''}</p>
      </section>
      <section class="sheet__sec"><h4>使用方式</h4><ul class="tags">${(p.control || []).map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>
      <div class="sheet__buy">
        ${link
          ? `<a class="btn btn--metal btn--block" href="${esc(buyHref)}" target="_blank" rel="noopener" data-track="buy_link" data-product="${esc(p.id)}">${esc(site.buy.buyNowLabel)}</a>`
          : `<div class="stepper"><button type="button" data-qty="-1" aria-label="减少一件">${icon('minus')}</button><i data-qty-value>1</i><button type="button" data-qty="1" aria-label="增加一件">${icon('plus')}</button></div>
             <button type="button" class="btn btn--metal" data-sheet-add data-track="add_to_bag" data-product="${esc(p.id)}">${esc(site.buy.addLabel)}</button>`}
      </div>
      <p class="sheet__ask">有疑问？<a href="tel:${esc(site.contact.phone).replace(/[^\d+]/g, '')}">致电 ${esc(site.contact.phone)}</a>，${esc(site.contact.serviceHours)}</p>
    </div>`;
}

/* ---------- 购物袋 ---------- */
export function bagItem(site, item, idx) {
  const p = item.product;
  const f = finishById(site, item.finish);
  return `<li class="bagitem" data-idx="${idx}">
    <span class="bagitem__thumb" data-accent="${accentOf(site, p)}">${img(p.images.main, '', { cls: 'bagitem__img', loading: 'lazy' })}</span>
    <div><b>${esc(p.name)}</b><span>${esc(p.cn)}${p.finishes.length > 1 ? ' · ' + esc(f.name) : ''}</span>
      <div class="stepper"><button type="button" data-qty="-1" aria-label="减少一件">${icon('minus')}</button><i>${item.qty}</i><button type="button" data-qty="1" aria-label="增加一件">${icon('plus')}</button></div>
    </div>
    <div class="bagitem__price">${money(p.price * item.qty)}<button type="button" class="bagitem__rm" data-rm>移除</button></div>
  </li>`;
}

/** 结算弹层。items: [{product, finish, qty}]；off: 套装优惠金额。 */
export function checkout(site, items, off) {
  const { checkout: co } = site.integrations;
  const c = site.contact;
  const sub = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  const free = sub - off >= site.buy.freeInstallThreshold;
  const note = co.mode === 'api'
    ? '提交后，顾问会在工作时间内联系你确认商品、价格与支付方式。'
    : `提交后会调起你的邮件应用，把这封订单意向发到 ${c.email}；没有弹出邮件应用时，也可以直接致电 ${c.phone}。`;
  return `<div class="modal__head"><h3>结算</h3><button type="button" class="iconbtn" data-checkout-close aria-label="关闭结算">${icon('close')}</button></div>
    <form class="modal__body" novalidate data-checkout-form>
      <div>
        <h4>收货信息</h4>
        <div class="form" style="margin-top:10px">
          <label>姓名<input type="text" name="name" autocomplete="name" required placeholder="收件人"></label>
          <label>手机号<input type="tel" name="phone" autocomplete="tel" inputmode="numeric" required placeholder="11 位手机号"></label>
          <label>收货地址<textarea name="address" rows="2" autocomplete="street-address" required placeholder="省 / 市 / 区 · 街道门牌"></textarea></label>
          <label>备注<textarea name="note" rows="2" placeholder="安装时间、发票等（选填）"></textarea></label>
        </div>
        <p class="form__error" data-co-error hidden></p>
      </div>
      <div>
        <h4>订单摘要</h4>
        <ul class="sumlist">${items.map((it) => `<li>${esc(it.product.name)} <span>× ${it.qty}</span><b>${money(it.product.price * it.qty)}</b></li>`).join('')}</ul>
        <ul class="sumlist">${off ? `<li>套装 ${Math.round(site.buy.bundleDiscount * 100)} 折 <span></span><b>− ${money(off)}</b></li>` : ''}<li>运费 <span></span><b>免费</b></li>${free ? `<li>上门安装 <span></span><b>赠送</b></li>` : ''}</ul>
        <div class="modal__total"><span>应付合计</span><b>${money(sub - off)}</b></div>
      </div>
      <p class="modal__note">${esc(note)}</p>
      <label class="check"><input type="checkbox" name="consent" required><span>我已阅读并同意<a href="terms.html" target="_blank" rel="noopener">《购买与服务条款》</a>与<a href="privacy.html" target="_blank" rel="noopener">《隐私政策》</a></span></label>
      <button type="submit" class="btn btn--metal btn--block" data-track="checkout_submit">${co.mode === 'api' ? '提交订单' : '生成订单邮件'}</button>
    </form>`;
}

export function checkoutDone(site, { title, text }) {
  return `<div class="modal__head"><h3>${esc(title)}</h3><button type="button" class="iconbtn" data-checkout-close aria-label="关闭">${icon('close')}</button></div>
    <div class="modal__body"><div class="modal__done">${icon('check')}<h4>${esc(title)}</h4><p>${text}</p></div>
      <button type="button" class="btn btn--metal btn--block" data-checkout-close data-track="checkout_close">继续浏览</button></div>`;
}

export const accentBg = (accent) => ACCENT_BG[accent] || ACCENT_BG.day;
export { productTotal };
