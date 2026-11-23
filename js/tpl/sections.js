/* 各内容区块的模板：产品系列、设计理念、空间搭配、智能联动、节能、安装、评价、选购、售后。 */
import { esc, icon, img, money, num, productById, finishById, accentOf, isLinkMode, sum, productTotal, telHref } from './core.js';
import { secHead } from './page.js';
import { roomSvg } from './rooms.js';
import { symbolGlyph } from './shop.js';

const stars = (n) => '★'.repeat(Math.max(0, Math.min(5, n)));

/* ───────────── 01 产品系列 ───────────── */
function specsHtml(p) {
  const rows = p.kind === 'light'
    ? [['光线参数', `${p.light.kelvin} · ${p.light.lumens} · CRI ${p.light.cri}`],
       ['材质', p.materials.slice(0, 2).join(' · ')],
       ['尺寸', p.size],
       ['使用方式', `${p.install.split('，')[0]} · ${p.control.slice(0, 3).join(' / ')}`]]
    : [['感应与连接', p.sensors ? p.sensors.slice(0, 2).join(' · ') + ' · Thread' : (p.motor || []).slice(0, 2).join(' · ')],
       ['材质', p.materials.slice(0, 2).join(' · ')],
       ['尺寸', p.size],
       ['使用方式', `${p.install.split('，')[0]} · ${p.control.slice(0, 2).join(' / ')}`]];
  return `<dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

function card(site, p, i) {
  const link = isLinkMode(site);
  const buyHref = p.buyUrl || site.integrations.checkout.storeUrl || '#buy';
  const lit = !!p.images.lit;
  return `<li class="pcard reveal" id="product-${esc(p.id)}" data-id="${esc(p.id)}" data-series="${esc(p.series)}" data-accent="${accentOf(site, p)}" data-spin="${p.spin ? '1' : '0'}" style="--i:${i % 4}">
      <div class="pcard__media" data-media>
        <div class="pcard__bg"></div>
        <div class="pcard__dark"></div>
        ${img(p.images.main, `${p.name} ${p.cn} 产品图`, { cls: 'pcard__img', extra: 'data-img-role="main"' })}
        ${lit ? img(p.images.lit, `${p.name} ${p.cn} 开灯效果`, { cls: 'pcard__img pcard__img--lit', extra: 'data-img-role="lit"' }) : ''}
        ${p.spin ? `<div class="pcard__spin" data-spin-el data-spin-sheet="${esc(p.spin.sheet)}" data-frames="${Number(p.spin.frames) || 24}" data-cols="${Number(p.spin.cols) || 6}" data-rows="${Number(p.spin.rows) || 4}" style="--fw:${Number(p.spin.width) || 240};--fh:${Number(p.spin.height) || 300};--cols:${Number(p.spin.cols) || 6};--rows:${Number(p.spin.rows) || 4}" aria-hidden="true"></div>` : ''}
        <div class="pcard__tools">
          ${lit ? `<button type="button" class="iconbtn pcard__power" data-power aria-pressed="false" aria-label="开关灯预览">${icon('power')}</button>` : ''}
          <button type="button" class="iconbtn" data-detail aria-label="查看 ${esc(p.name)} 的详情">${icon('expand')}</button>
        </div>
        <div class="pcard__specs" aria-hidden="true">${specsHtml(p)}</div>
      </div>
      <div class="pcard__body">
        <div class="pcard__head"><h3>${esc(p.name)}<span>${esc(p.cn)}</span></h3><p class="pcard__price">${money(p.price)}${p.originalPrice ? `<s>${money(p.originalPrice)}</s>` : ''}</p></div>
        <p class="pcard__desc">${esc(p.desc)}</p>
        <div class="pcard__row">
          <div class="swatches" role="radiogroup" aria-label="选择 ${esc(p.name)} 的表面材质">
            ${p.finishes.map((id) => { const f = finishById(site, id); return `<button type="button" class="swatch" role="radio" data-finish="${esc(id)}" aria-checked="${id === p.finish}" style="--sw:${esc(f.swatch)}" aria-label="${esc(f.name)}：${esc(f.desc)}"></button>`; }).join('')}
          </div>
          ${link
            ? `<a class="btn btn--line btn--xs" href="${esc(buyHref)}" target="_blank" rel="noopener" data-track="buy_link" data-product="${esc(p.id)}">${esc(site.buy.buyNowLabel)}</a>`
            : `<button type="button" class="btn btn--line btn--xs" data-add data-track="add_to_bag" data-product="${esc(p.id)}">${esc(site.buy.addLabel)}</button>`}
        </div>
      </div>
    </li>`;
}

export function collection(site) {
  const col = site.collection;
  const count = (id) => (id === 'all' ? col.products.length : col.products.filter((p) => p.series === id).length);
  return `<section class="section products" id="collection">
  <div class="container">
    ${secHead('01', col.eyebrow, col.eyebrowEn, esc(col.title), col.lead)}
    <div class="filters reveal" data-filters role="group" aria-label="${esc(col.filtersLabel)}">
      <button type="button" class="chip is-active" data-filter="all" aria-pressed="true">全部 <i>${count('all')}</i></button>
      ${col.series.map((s) => `<button type="button" class="chip" data-filter="${esc(s.id)}" aria-pressed="false">${esc(s.name)} ${esc(s.cn)} <i>${count(s.id)}</i></button>`).join('')}
    </div>
    <ul class="grid" data-products>
      ${col.products.map((p, i) => card(site, p, i)).join('\n      ')}
    </ul>
  </div>
</section>`;
}

/* ───────────── 02 设计理念 ───────────── */
export function design(site) {
  const d = site.design;
  const p = productById(site, d.product) || site.collection.products[0];
  const finishes = p.finishes.map((id) => finishById(site, id));
  const pick = finishes.length > 1;
  return `<section class="section design" id="design">
  <div class="container">
    ${secHead('02', d.eyebrow, d.eyebrowEn, esc(d.title), d.lead)}
    <div class="scrolly" data-scrolly>
      <div class="scrolly__stage">
        <div class="stage" data-stage>
          <div class="stage__imgs" data-design-stage>
            ${d.steps.map((st, i) => img(st.image, st.alt, { cls: 'stage__img' + (i === 0 ? ' is-active' : ''), extra: `data-step-img="${i}"${st.finishImages ? ` data-finishes='${esc(JSON.stringify(st.finishImages))}'` : ''}` })).join('\n            ')}
          </div>
          ${pick ? `<div class="stage__finish">
            <div class="stage__finish-head"><p class="stage__label">选择表面</p><p class="stage__finish-desc" data-finish-desc>${esc(finishes[0].name)} · ${esc(finishes[0].desc)}</p></div>
            <div class="swatches swatches--lg" data-finish-swatches role="radiogroup" aria-label="选择表面材质">
              ${finishes.map((f, i) => `<button type="button" class="swatchlg" role="radio" data-finish="${esc(f.id)}" aria-checked="${i === 0}"><span class="swatch" style="--sw:${esc(f.swatch)}"></span>${esc(f.name)} ${esc(f.en)}</button>`).join('')}
            </div>
          </div>` : ''}
        </div>
      </div>
      <ol class="scrolly__steps">
        ${d.steps.map((st, i) => `<li class="step${i === 0 ? ' is-active' : ''}" data-step="${i}">
          <span class="step__n">${String(i + 1).padStart(2, '0')}</span>
          <h3>${esc(st.title)}</h3>
          <p>${esc(st.text)}</p>
          ${st.specs?.length ? `<dl class="step__spec">${st.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        </li>`).join('\n        ')}
      </ol>
    </div>
  </div>
</section>`;
}

/* ───────────── 03 空间搭配 ───────────── */
export function kitHtml(site, room, off = []) {
  return room.items.map((it) => {
    const p = productById(site, it.product);
    if (!p) return '';
    const on = !off.includes(it.slot);
    return `<li class="${on ? 'is-on' : 'is-off'}" data-kit-slot="${esc(it.slot)}">
      <button type="button" class="kit__check" data-kit-toggle aria-pressed="${on}" aria-label="在房间中${on ? '关闭' : '开启'} ${esc(p.name)}"${it.fixed ? ' disabled' : ''}>${icon('check')}</button>
      <div class="kit__name"><b>${esc(p.name)}</b><span>${esc(p.cn)}${it.qty > 1 ? ' × ' + it.qty : ''}${it.note ? ' · ' + esc(it.note) : ''}${it.fixed ? ' · 房间必备' : ''}</span></div>
      <span class="kit__price">${money(p.price * it.qty)}</span>
    </li>`;
  }).join('');
}

export function totalsHtml(site, room, off = []) {
  const on = room.items.filter((it) => !off.includes(it.slot) && productById(site, it.product));
  const full = on.length === room.items.length;
  const total = sum(on, (it) => productById(site, it.product).price * it.qty);
  const discount = full ? total * (1 - site.buy.bundleDiscount) : 0;
  const watts = sum(on, (it) => (productById(site, it.product).powerW || 0) * it.qty);
  const lumens = sum(on, (it) => (parseInt(productById(site, it.product).light?.lumens, 10) || 0) * it.qty);
  return `<div><dt>${full ? '整套价' : '合计'}</dt><dd>${full ? `<s>${money(total)}</s>` : ''}${money(total - discount)}${full ? `<i>省 ${money(discount)}</i>` : ''}</dd></div>
    <div><dt>总功率</dt><dd>${watts % 1 ? watts.toFixed(1) : watts}<small> W</small></dd></div>
    <div><dt>安装点位</dt><dd>${sum(on, (it) => it.qty)}<small> 处</small></dd></div>
    <div><dt>平均照度</dt><dd>${Math.round(lumens / (room.area || 1))}<small> lx</small></dd></div>`;
}

export function space(site) {
  const s = site.space;
  const room = s.rooms[0];
  const link = isLinkMode(site);
  return `<section class="section space" id="space">
  <div class="container">
    ${secHead('03', s.eyebrow, s.eyebrowEn, esc(s.title), s.lead)}
    <div class="pairing reveal">
      <div class="pairing__view">
        <div class="pairing__top">
          <div class="tabs" role="tablist" aria-label="选择房间" data-room-tabs>
            ${s.rooms.map((r, i) => `<button type="button" role="tab" data-room="${esc(r.id)}" aria-selected="${i === 0}" class="${i === 0 ? 'is-active' : ''}">${esc(r.name)} <i>${r.area} m²</i></button>`).join('')}
          </div>
          <div class="seg" role="group" aria-label="预览时段">
            <button type="button" class="is-active" data-mode="day" aria-pressed="true">${icon('sun')}白天</button>
            <button type="button" data-mode="night" aria-pressed="false">${icon('moon')}夜晚</button>
          </div>
        </div>
        <div class="room" data-room-view data-mode="day">${roomSvg(room)}</div>
      </div>
      <aside class="pairing__panel">
        <p class="eyebrow" data-room-en>${esc(room.en)} · ${room.area} m²</p>
        <h3 class="pairing__title" data-room-name>${esc(room.name)}</h3>
        <p class="pairing__note" data-room-note>${esc(room.note)}</p>
        <ul class="kit" data-kit>${kitHtml(site, room)}</ul>
        <dl class="totals" data-totals>${totalsHtml(site, room)}</dl>
        <div class="pairing__actions">
          ${link ? '' : `<button type="button" class="btn btn--metal" data-add-kit data-track="add_kit">${esc(s.addLabel)}</button>`}
          <a class="linkbtn" href="#install">${esc(s.moreLabel)} ${icon('arrow')}</a>
        </div>
      </aside>
    </div>
  </div>
</section>`;
}

/* ───────────── 04 智能联动 ───────────── */
const K_COLOR = [[/^18/, '#ff9d4d'], [/^2[0-4]/, '#ffad62'], [/^2[5-9]|^30/, '#ffcf9a'], [/^[34]/, '#ffe2c0'], [/^[45]/, '#fff1dc']];
const glowOf = (d) => (!d.on ? '#b9c4da' : !d.kelvin ? '#a9c0e6' : (K_COLOR.find(([re]) => re.test(d.kelvin)) || [null, '#ffcf9a'])[1]);

/** App 示意面板的设备列表（构建时输出第一个场景，之后由页面切换）。 */
export function appMock(site, auto) {
  return auto.devices.map((d) => {
    const p = productById(site, d.product);
    if (!p) return '';
    const state = d.on ? (d.level !== undefined ? `已开启 · ${d.level}%` : '已开启') : '已关闭';
    const k = d.on ? (d.kelvin || '') : '待机';
    return `<li class="dev ${d.on ? 'is-on' : 'is-off'}" data-dev="${esc(p.id)}" style="--dev-glow:${glowOf(d)}">
      <span class="dev__icon">${symbolGlyph(p.symbol)}</span>
      <div class="dev__name"><b>${esc(p.name)}</b><span class="dev__state">${state}</span></div>
      <div class="dev__ctrl"><span class="dev__track"><span class="dev__fill" style="width:${d.on ? Math.max(d.level ?? 100, d.level === 0 ? 2 : 0) : 0}%"></span></span><span class="dev__k">${esc(k)}</span></div>
    </li>`;
  }).join('');
}

export function smart(site) {
  const s = site.smart;
  const first = s.automations[0];
  const anyOn = first.devices.some((d) => d.on);
  const lightOn = first.devices.some((d) => d.on && productById(site, d.product)?.kind === 'light');
  const shadeOn = first.devices.some((d) => d.on && d.product === 'luma-shade');
  const lat = 64 + first.devices.length * 3;
  return `<section class="section smart" id="smart">
  <div class="container">
    ${secHead('04', s.eyebrow, s.eyebrowEn, s.title.map(esc).join('<br>'), s.lead)}
    <div class="linkage reveal">
      <div class="linkage__list" data-autopick role="tablist" aria-label="选择联动场景">
        ${s.automations.map((a, i) => `<button type="button" role="tab" class="auto${i === 0 ? ' is-active' : ''}" aria-selected="${i === 0}" data-auto="${esc(a.id)}" data-track="smart_scene">${icon(a.icon)}<b>${esc(a.name)}</b><span>${esc(a.trigger)}</span><p>${esc(a.summary)}</p></button>`).join('')}
      </div>
      <div class="linkage__demo">
        <div class="flow${anyOn ? ' is-live' : ''}" aria-hidden="true">
          <svg class="flow__svg" viewBox="0 0 200 196">
            <defs><linearGradient id="flowMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8f2"/><stop offset=".45" stop-color="#cfc4af"/><stop offset=".7" stop-color="#f4eee4"/><stop offset="1" stop-color="#b3a58c"/></linearGradient></defs>
            <path class="base" d="M54 98C104 98 104 36 154 36"/><path class="base" d="M54 98H154"/><path class="base" d="M54 98C104 98 104 160 154 160"/>
            <path class="pulse" d="M54 98C104 98 104 36 154 36"/><path class="pulse" d="M54 98H154"/><path class="pulse" d="M54 98C104 98 104 160 154 160"/>
            <circle cx="34" cy="98" r="21" class="hub-body"/>
            <g class="dev${lightOn ? ' is-on' : ''}" data-node="light"><circle cx="170" cy="36" r="9"/><text x="170" y="17" text-anchor="middle">灯具</text></g>
            <g class="dev${shadeOn ? ' is-on' : ''}" data-node="shade"><circle cx="170" cy="98" r="9"/><text x="170" y="126" text-anchor="middle">窗帘</text></g>
            <g class="dev${anyOn ? ' is-on' : ''}" data-node="sense"><circle cx="170" cy="160" r="9"/><text x="170" y="185" text-anchor="middle">传感器</text></g>
            <text x="34" y="140" text-anchor="middle">SENSE</text>
            <text x="104" y="86" text-anchor="middle" class="tiny">THREAD</text>
          </svg>
          <span class="flow__meta" data-flow-meta>本地联动 · ${lat} ms</span>
        </div>
        <div class="app" data-appmock>
          <div class="app__bar"><span>${esc(s.roomName)}</span><i class="app__live"><b></b><span data-app-state>${anyOn ? `${first.devices.filter((d) => d.on).length + 1} 台设备在线 · 已同步` : '仅中枢在线'}</span></i></div>
          <ul class="app__list" data-app-list>${appMock(site, first)}</ul>
          <div class="app__foot"><span>Thread 网络</span><span>Matter</span><span data-app-latency>${lat} ms</span></div>
        </div>
      </div>
    </div>
    <ul class="caplist reveal">
      ${s.capabilities.map((c) => `<li><b>${esc(c.title)}</b><span>${esc(c.text)}</span></li>`).join('')}
    </ul>
  </div>
</section>`;
}

/* ───────────── 05 节能 ───────────── */
const CHART = { w: 760, h: 330, padT: 44, padB: 62, bw: 128, xs: [92, 316, 540] };
const chartMax = (bars) => Math.ceil((Math.max(...bars.map((b) => Math.max(b.kwh, b.kwhAlt || 0))) * 1.08) / 100) * 100;
const yOf = (kwh, max) => CHART.padT + (1 - kwh / max) * (CHART.h - CHART.padB - CHART.padT);

export function energy(site) {
  const e = site.energy;
  const { w, h, padT, padB, bw, xs } = CHART;
  const max = chartMax(e.bars);
  const luma = e.bars.find((b) => b.id === 'luma');
  return `<section class="section energy" id="energy">
  <div class="container">
    ${secHead('05', e.eyebrow, e.eyebrowEn, esc(e.title), e.lead)}
    <div class="energy__stats reveal" data-stats>
      ${e.stats.map((s) => `<div class="stat"><b><span data-count="${s.value}" data-decimals="${s.value % 1 ? 1 : 0}">${num(s.value)}</span><i>${esc(s.unit)}</i></b><span>${esc(s.label)}</span><small>${esc(s.note)}</small></div>`).join('')}
    </div>
    <div class="energy__board reveal">
      <div class="chart" data-energy-chart>
        <div class="chart__head"><h3>${esc(e.chartTitle)}</h3><p>${esc(e.chartNote)}</p></div>
        <div class="chart__plot">
          <svg viewBox="0 0 ${w} ${h}" aria-label="年度耗电对比柱状图" role="img">
            <defs>
              <linearGradient id="barMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e4ddd0"/><stop offset=".5" stop-color="#f6f2ea"/><stop offset="1" stop-color="#cdc3b2"/></linearGradient>
              <linearGradient id="barSpectrum" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9a45"/><stop offset=".5" stop-color="#ffcf9a"/><stop offset="1" stop-color="#f6e9d6"/></linearGradient>
              <clipPath id="chartClip"><rect x="0" y="${padT - 20}" width="${w}" height="${h - padB - padT + 20}"/></clipPath>
            </defs>
            ${[0, 0.25, 0.5, 0.75, 1].map((f) => `<path class="grid" d="M0 ${padT + f * (h - padB - padT)}H${w}"${f ? ' stroke-dasharray="2 6"' : ''}/>`).join('')}
            ${[1, 0.75, 0.5, 0.25].map((f) => `<text class="axis" x="${w - 4}" y="${yOf(max * f, max) - 6}" text-anchor="end">${num(Math.round(max * f))}</text>`).join('')}
            <g clip-path="url(#chartClip)">
              ${e.bars.map((b, i) => `<rect class="bar-bg" x="${xs[i]}" y="${padT}" width="${bw}" height="${h - padB - padT}" rx="14"/><rect class="bar${b.id === 'luma' ? ' is-luma' : ''}" data-bar="${esc(b.id)}" data-kwh="${b.kwh}" data-kwh-alt="${b.kwhAlt || b.kwh}" x="${xs[i]}" y="${yOf(b.kwh, max)}" width="${bw}" height="${Math.max(0, h - padB - yOf(b.kwh, max))}" rx="14"/>`).join('')}
            </g>
            ${e.bars.map((b, i) => `<text class="bar-val" data-bar-val="${esc(b.id)}" x="${xs[i] + bw / 2}" y="${yOf(b.kwh, max) - 14}" text-anchor="middle">${num(b.kwh)}<tspan> 度/年</tspan></text>
              <text class="bar-lbl" x="${xs[i] + bw / 2}" y="${h - padB + 28}" text-anchor="middle">${esc(b.name)}</text>
              <text class="bar-note" x="${xs[i] + bw / 2}" y="${h - padB + 48}" text-anchor="middle" data-bar-note="${esc(b.id)}">${esc(b.note)}</text>`).join('')}
          </svg>
        </div>
      </div>
      <div class="energy__side">
        <div class="switchrow">
          <div><b>${esc(e.switch.title)}</b><span>${esc(e.switch.text)}</span></div>
          <button type="button" class="switch" role="switch" aria-checked="true" aria-label="${esc(e.switch.title)}" data-harvest><span></span></button>
        </div>
        <div class="curves" data-daylight-curve>${curves()}</div>
        <p class="energy__note" data-energy-note></p>
      </div>
    </div>
  </div>
</section>`;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
function curves() {
  const W = 360;
  const CH = 150;
  const X = (h) => (h / 24) * W;
  const Y = (v) => 18 + (1 - v) * (CH - 42);
  const path = (fn) => Array.from({ length: 49 }, (_, i) => `${i ? 'L' : 'M'}${X(i / 2).toFixed(1)} ${Y(fn(i / 2)).toFixed(1)}`).join('');
  const sun = (h) => clamp01(Math.sin(((h - 6) / 13) * Math.PI)) * (h > 6 && h < 19 ? 1 : 0);
  const lampOn = (h) => {
    const day = sun(h) * (h > 6.5 && h < 18.5 ? 1 : 0);
    const v = 0.08 + (1 - day) * (h > 6 && h < 18.5 ? 0.12 : 0.42) + (h >= 18.5 && h <= 22.5 ? 0.36 : 0) + (h < 6.8 ? 0.2 : 0);
    return h > 23.2 ? 0.06 : v;
  };
  const lampOff = (h) => (h < 7 ? 0.5 : h < 17.5 ? 0.6 : h < 23.2 ? 0.82 : 0.06);
  const area = (line) => `${line}L${W} ${Y(0)}L0 ${Y(0)}Z`;
  return `<h4>一天的光线曲线</h4><p>橙色是窗外日光，浅色是灯光输出</p>
    <svg viewBox="0 0 ${W} ${CH}" aria-label="一天中日光强度与灯光输出曲线" role="img">
      <defs><linearGradient id="lampGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf9a" stop-opacity=".75"/><stop offset="1" stop-color="#ffcf9a" stop-opacity=".08"/></linearGradient></defs>
      ${[0, 0.5, 1].map((f) => `<path class="grid" d="M0 ${Y(f)}H${W}"/>`).join('')}
      <g class="lamp-set lamp-on"><path class="lamp-area" d="${area(path(lampOn))}"/><path class="lamp-line" d="${path(lampOn)}"/></g>
      <g class="lamp-set lamp-off"><path class="lamp-area" d="${area(path(lampOff))}"/><path class="lamp-line" d="${path(lampOff)}"/></g>
      <path class="sun-line" d="${path(sun)}"/>
      ${[0, 6, 12, 18, 23].map((h) => `<text x="${X(h) + 2}" y="${CH - 4}">${String(h).padStart(2, '0')}:00</text>`).join('')}
    </svg>`;
}

/* ───────────── 06 安装 ───────────── */
export function install(site) {
  const s = site.install;
  const rows = site.collection.products;
  return `<section class="section install" id="install">
  <div class="container">
    ${secHead('06', s.eyebrow, s.eyebrowEn, esc(s.title), s.lead)}
    <ol class="install__steps">
      ${s.steps.map((st, i) => `<li class="istep reveal" style="--i:${i}"><span class="istep__icon">${icon(st.icon)}</span><b>STEP ${String(i + 1).padStart(2, '0')}</b><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p></li>`).join('')}
    </ol>
    <div class="install__table reveal">
      <table>
        <thead><tr>${s.tableHead.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((p) => `<tr><td>${esc(p.name)} ${esc(p.cn)}</td><td>${esc(p.install)}</td><td>${esc(p.installTime)}</td><td><span class="${p.wiring ? 'is-yes' : ''}">${esc(p.wiring ? s.wiringYes : s.wiringNo)}</span></td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</section>`;
}

/* ───────────── 07 评价 ───────────── */
export function reviews(site) {
  const r = site.reviews;
  return `<section class="section reviews" id="reviews">
  <div class="container">
    ${secHead('07', r.eyebrow, r.eyebrowEn, esc(r.title), '', `<div class="score"><b>${num(r.score)}</b><span class="score__stars" aria-label="${r.score} 分（满分 5 分）">${stars(Math.round(r.score))}</span><span>${num(r.count)} ${esc(r.scoreLabel)} · ${r.recommend}% ${esc(r.recommendLabel)}</span></div>`)}
    <ul class="quotes">${r.list.map((q, i) => `<li class="quote reveal" style="--i:${i}">
        <div class="quote__mark" aria-hidden="true">“</div>
        <div class="quote__stars" aria-label="${q.stars} 星评价">${stars(q.stars)}</div>
        <h3>${esc(q.title)}</h3><p>${esc(q.text)}</p>
        <footer><span class="avatar" aria-hidden="true">${esc(String(q.name).slice(0, 1))}</span><div><b>${esc(q.name)} · ${esc(q.city)}</b><span>${esc(q.set)}${q.verified === false ? '' : ' · ' + esc(r.verifiedLabel)}</span></div></footer>
      </li>`).join('')}</ul>
  </div>
</section>`;
}

/* ───────────── 08 选购 ───────────── */
export function buy(site) {
  const b = site.buy;
  const link = isLinkMode(site);
  const heights = ['88%', '70%', '62%', '56%'];
  return `<section class="section buy" id="buy">
  <div class="container">
    ${secHead('08', b.eyebrow, b.eyebrowEn, esc(b.title), b.lead)}
    <ul class="bundles" data-bundles>
      ${b.bundles.map((bd, i) => {
        const total = productTotal(site, bd.items);
        const uniq = [...new Set(bd.items.map(([id]) => id))].slice(0, 4);
        const href = site.integrations.checkout.storeUrl || '#collection';
        return `<li class="bundle reveal${bd.featured ? ' bundle--dark' : ''}" style="--i:${i}">
          <span class="bundle__tag">${esc(bd.tag || '')}</span>
          <div class="bundle__art" aria-hidden="true">${uniq.map((id, k) => `<span style="height:${heights[k]}">${img(productById(site, id)?.images.main, '', { cls: 'bundle__img' })}</span>`).join('')}</div>
          <h3>${esc(bd.name)}<span>${esc(bd.en || '')}</span></h3>
          <ul>${bd.items.map(([id, qty]) => `<li>${esc(productById(site, id)?.cn || id)}<span>× ${qty}</span></li>`).join('')}</ul>
          <div class="bundle__price"><b>${money(total * b.bundleDiscount)}</b><s>${money(total)}</s><i>省 ${money(total * (1 - b.bundleDiscount))}</i></div>
          ${link
            ? `<a class="btn ${bd.featured ? 'btn--metal' : 'btn--line'}" href="${esc(href)}" target="_blank" rel="noopener" data-track="buy_link" data-bundle="${esc(bd.id)}">${esc(b.buyNowLabel)}</a>`
            : `<button type="button" class="btn ${bd.featured ? 'btn--metal' : 'btn--line'}" data-bundle="${esc(bd.id)}" data-track="add_bundle">${esc(b.bundleAddLabel || b.addLabel)}</button>`}
        </li>`;
      }).join('')}
    </ul>
    <p class="buy__perks reveal">${b.perks.map((p) => `<span>${icon(p.icon)}${esc(p.text)}</span>`).join('')}</p>
  </div>
</section>`;
}

/* ───────────── 09 售后服务 ───────────── */
export function care(site) {
  const c = site.care;
  const a = c.advisor;
  const consent = esc(a.consent).replace('《隐私政策》', '<a href="privacy.html" target="_blank" rel="noopener">《隐私政策》</a>');
  return `<section class="section care" id="care">
  <div class="container">
    ${secHead('09', c.eyebrow, c.eyebrowEn, esc(c.title), '')}
    <ul class="services reveal">${c.services.map((s, i) => `<li class="svc" style="--i:${i}">${icon(s.icon)}<b>${esc(s.title)}</b><span>${esc(s.text)}</span></li>`).join('')}</ul>
    <div class="care__grid">
      <div class="advisor reveal" id="advisor">
        <p class="eyebrow">${esc(a.eyebrow)}</p>
        <h3>${esc(a.title)}</h3>
        <p class="advisor__lead">${esc(a.lead)}</p>
        <form class="form" data-care-form novalidate>
          <label>称呼<input type="text" name="name" autocomplete="name" required placeholder="怎么称呼你"></label>
          <label>手机号<input type="tel" name="phone" autocomplete="tel" inputmode="numeric" required placeholder="用于顾问联系你"></label>
          <div class="form__row">
            <label>城市<input type="text" name="city" list="cities" placeholder="选择城市"><datalist id="cities">${a.cities.map((x) => `<option value="${esc(x)}"></option>`).join('')}</datalist></label>
            <label>房间<select name="room">${a.rooms.map((x) => `<option>${esc(x)}</option>`).join('')}</select></label>
          </div>
          <label>想解决的问题<textarea name="note" rows="3" placeholder="例如：卧室太亮睡不好、餐桌灯有阴影……"></textarea></label>
          <label class="check"><input type="checkbox" name="consent" required><span>${consent}</span></label>
          <p class="form__error" data-form-error hidden></p>
          <button type="submit" class="btn btn--metal" data-track="advisor_submit">${esc(a.submitLabel)}</button>
        </form>
        <div class="form__done" data-form-done hidden>
          ${icon('check')}
          <h4>${esc(a.doneTitle)}</h4>
          <p data-form-done-text></p>
          <button type="button" class="linkbtn" data-form-reset>再预约一次</button>
        </div>
      </div>
      <div class="faq reveal">
        <p class="eyebrow">${esc(c.faqTitle)}</p>
        <div data-faq>${c.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
        <a class="faq__more linkbtn" href="${esc(telHref(site.contact.phone))}" data-track="faq_call">电话咨询 ${esc(site.contact.phone)} ${icon('arrow')}</a>
      </div>
    </div>
  </div>
</section>`;
}
