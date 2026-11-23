/* 页面骨架类模板：head 信息、导航、首屏、品牌主张、页脚、浮层、法务页面。 */
import { esc, em, icon, img, telHref, mailHref, isLinkMode } from './core.js';
import { sprite } from './icons.js';
import { jsonLd } from './seo.js';

const abs = (site, path) => (/^https?:/.test(path) ? path : `${site.meta.url}/${path.replace(/^\//, '')}`);

export function favicon(site) {
  if (site.brand.logoImage) return esc(site.brand.logoImage);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='12.5' fill='none' stroke='#a8987d' stroke-width='2'/><circle cx='10' cy='20' r='5' fill='${site.theme.colors.accent}'/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/** <head> 里的标签（字符集与视口由页面外壳在最前面输出）。 */
export function head(site) {
  const m = site.meta;
  const first = site.hero.scenes[0];
  const ld = JSON.stringify(jsonLd(site)).replace(/</g, '\\u003c');
  return `
<meta name="description" content="${esc(m.description)}">
${m.keywords ? `<meta name="keywords" content="${esc(m.keywords)}">\n` : ''}<meta name="theme-color" content="${esc(m.themeColor)}">
<meta name="robots" content="${esc(m.robots || 'index, follow')}">
<link rel="canonical" href="${esc(m.url)}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.brand.name)}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.description)}">
<meta property="og:url" content="${esc(m.url)}/">
${m.ogImage ? `<meta property="og:image" content="${esc(abs(site, m.ogImage))}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${esc(abs(site, m.ogImage))}">` : ''}
<link rel="icon" href="${favicon(site)}">
<link rel="preload" href="assets/fonts/newsreader-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${first.imageMobile ? `<link rel="preload" as="image" media="(max-width: 760px)" href="${esc(first.imageMobile)}" fetchpriority="high">` : ''}
<link rel="preload" as="image" media="${first.imageMobile ? '(min-width: 761px)' : 'all'}" href="${esc(first.image)}" fetchpriority="high">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
<script type="application/ld+json">${ld}</script>
${site.integrations.analytics.baidu ? `<script defer src="https://hm.baidu.com/hm.js?${esc(site.integrations.analytics.baidu)}"></script>` : ''}
${site.integrations.analytics.gtag ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.integrations.analytics.gtag)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(site.integrations.analytics.gtag)}',{anonymize_ip:true});</script>` : ''}`;
}

const logoMark = `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true" data-logo>
  <defs>
    <linearGradient id="lg-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8f2"/><stop offset=".45" stop-color="#cfc4af"/><stop offset=".7" stop-color="#f4eee4"/><stop offset="1" stop-color="#b3a58c"/></linearGradient>
    <radialGradient id="lg-sun" cx=".4" cy=".38" r=".7"><stop offset="0" stop-color="#fff6e8"/><stop offset=".55" stop-color="#f3b978"/><stop offset="1" stop-color="#d98a45"/></radialGradient>
  </defs>
  <circle class="logo__ring" cx="16" cy="16" r="13.2" fill="none" stroke="url(#lg-metal)" stroke-width="1.6"/>
  <circle class="logo__sun" data-logo-sun cx="16" cy="16" r="4.7" fill="url(#lg-sun)"/>
</svg>`;

const brandMark = (site) => (site.brand.logoImage
  ? `<img class="logo" src="${esc(site.brand.logoImage)}" alt="" width="30" height="30">`
  : logoMark);
const wordmark = (site) => {
  const words = String(site.brand.name).trim().split(/\s+/);
  return words.length > 1 ? `${esc(words.slice(0, -1).join(' '))} <em>${esc(words.at(-1))}</em>` : esc(site.brand.name);
};

export function nav(site) {
  const link = isLinkMode(site);
  return `<a class="skip" href="#main">跳到主要内容</a>
${sprite()}
<header class="nav" id="nav" data-nav>
  <a class="nav__brand" href="#top" aria-label="${esc(site.brand.name)} 首页">${brandMark(site)}<span class="nav__wordmark">${wordmark(site)}</span></a>
  <nav class="nav__links" id="nav-links" aria-label="主导航" data-nav-links>
    ${site.nav.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}
  </nav>
  <div class="nav__actions">
    ${link ? '' : `<button class="bagbtn" type="button" data-bag-open aria-label="打开购物袋">${icon('bag')}<span class="bagbtn__count" data-bag-count hidden>0</span></button>`}
    <a class="btn btn--metal btn--s nav__cta" href="${esc(site.nav.cta.href)}"${/^https?:/.test(site.nav.cta.href) ? ' target="_blank" rel="noopener"' : ''} data-track="nav_cta">${esc(site.nav.cta.label)}</a>
    <button class="navtoggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="打开菜单" data-nav-toggle><span></span><span></span></button>
  </div>
</header>`;
}

/* ---------- 首屏：四张场景图 + 时间滑块 ---------- */
export function hero(site) {
  const h = site.hero;
  const readout = h.readoutLabels || { kelvin: '色温', daylight: '日光', lamp: '灯光', power: '功耗' };
  const keys = Object.keys(readout);
  const first = h.scenes[0];
  return `<section class="hero" id="top" data-hero data-hero-theme="${esc(first.theme)}">
  <div class="hero__scene">
    ${h.scenes.map((sc, i) => `<picture class="hero__photo${i === 0 ? ' is-on' : ''}" data-photo="${i}">${sc.imageMobile ? `<source media="(max-width: 760px)" srcset="${esc(sc.imageMobile)}">` : ''}${img(sc.image, sc.alt, { cls: 'hero__img', loading: i === 0 ? 'eager' : 'lazy', extra: `fetchpriority="${i === 0 ? 'high' : 'auto'}" style="object-position:${esc(sc.position || '50% 50%')}"` })}</picture>`).join('\n    ')}
    <div class="hero__glow" data-glow style="--glow:${esc(first.glow)};--glow-x:${Number(first.glowX) || 80}%;--glow-y:${Number(first.glowY) || 40}%"></div>
    <div class="hero__scrim"></div>
    <div class="hero__vignette"></div>
  </div>

  <div class="hero__inner container">
    <div class="hero__copy">
      <p class="eyebrow hero__eyebrow">${esc(h.eyebrow)}</p>
      <h1 class="hero__title">${h.title.map(em).join('<br>')}</h1>
      <p class="hero__en" lang="en">${esc(h.sloganEn)}</p>
      <p class="hero__lead">${esc(h.lead)}</p>
      <div class="hero__cta">
        <a class="btn btn--metal" href="${esc(h.ctaPrimary.href)}"${/^https?:/.test(h.ctaPrimary.href) ? ' target="_blank" rel="noopener"' : ''} data-track="hero_primary">${esc(h.ctaPrimary.label)} ${icon('arrow')}</a>
        ${h.ctaSecondary ? `<a class="btn btn--ghost" href="${esc(h.ctaSecondary.href)}"${/^https?:/.test(h.ctaSecondary.href) ? ' target="_blank" rel="noopener"' : ''} data-track="hero_secondary">${esc(h.ctaSecondary.label)}</a>` : ''}
      </div>
    </div>
  </div>

  <div class="dock" data-dock role="group" aria-label="${esc(h.sliderLabel)}">
    <div class="dock__clock">
      <span class="dock__time" data-clock>${esc(first.time)}</span>
      <span class="dock__scene"><b data-scene-name>${esc(first.name)}</b><i data-scene-en>${esc(first.en)}</i></span>
    </div>
    <div class="timebar">
      <div class="timebar__box" data-timebar>
        <div class="timebar__track"><div class="timebar__fill" data-fill></div></div>
        <div class="timebar__thumb" data-thumb aria-hidden="true"></div>
        <input class="timebar__range" type="range" min="0" max="1000" step="1" value="0" data-range aria-label="${esc(h.sliderLabel)}">
        <div class="timebar__stops">
          ${h.scenes.map((sc, i) => `<button type="button" class="stop${i === 0 ? ' is-active' : ''}" data-stop="${i}" aria-pressed="${i === 0}" style="--p:${(i / (h.scenes.length - 1)) * 100}%"><span>${esc(sc.time)}</span><b>${esc(sc.name)}</b></button>`).join('')}
        </div>
      </div>
    </div>
    <div class="dock__readout" data-readout>
      ${keys.map((k) => `<div class="ro" data-ro-box="${k}"><span class="ro__k">${esc(readout[k])}</span><span class="ro__v" data-ro="${k}"></span></div>`).join('')}
    </div>
    <button type="button" class="dock__play" data-play aria-label="播放一天的光线变化" data-track="hero_play">${icon('play')}<span>播放一天</span></button>
  </div>
  <p class="hero__caption" data-caption><b>${esc(first.title)}</b><span>${esc(first.caption)}</span></p>
  <a class="hero__scroll" href="#statement" aria-label="向下滚动"><span></span></a>
</section>`;
}

export function statement(site) {
  const s = site.statement;
  return `<section class="statement" id="statement">
  <div class="container">
    <p class="eyebrow reveal">${esc(site.brand.name)} · ${esc(s.eyebrow)}</p>
    <h2 class="statement__title reveal">${s.title.map(em).join('<br>')}</h2>
    <div class="statement__row">
      <p class="statement__text reveal">${esc(s.text)}</p>
      <ul class="facts reveal">${s.facts.map((f) => `<li><b>${esc(f.value)}</b><span>${esc(f.label)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>`;
}

const secHead = (num, eyebrow, eyebrowEn, title, lead, extra = '') => `<header class="sec-head${extra ? ' sec-head--row' : ''} reveal">
      <div>
        <p class="eyebrow"><span class="num">${num}</span>${esc(eyebrow)}${eyebrowEn ? ' · ' + esc(eyebrowEn) : ''}</p>
        <h2 class="sec-title">${title}</h2>
        ${lead ? `<p class="sec-lead">${esc(lead)}</p>` : ''}
      </div>${extra}
    </header>`;
export { secHead };

export function footer(site) {
  const f = site.footer;
  const c = site.contact;
  const co = site.company;
  return `<footer class="footer" id="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="footer__logo" href="#top">${brandMark(site)}<span>${wordmark(site)}</span></a>
        <p>${esc(f.blurb)}<br><span lang="en">${esc(site.brand.sloganEn)}</span></p>
        <ul class="footer__contact">
          <li><a href="${esc(telHref(c.phone))}">${icon('phone')}<span>${esc(c.phone)}</span><small>${esc(c.serviceHours)}</small></a></li>
          <li><a href="${esc(mailHref(c.email))}">${icon('mail')}<span>${esc(c.email)}</span></a></li>
          <li>${icon('pin')}<span>${esc(c.address)}</span></li>
        </ul>
      </div>
      <nav class="footer__cols" aria-label="页脚导航">
        ${f.columns.map((col) => `<div><h4>${esc(col.title)}</h4>${col.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>`).join('')}
      </nav>
    </div>
    <div class="footer__bottom">
      <p>© ${esc(co.copyrightSince)} ${esc(co.legalName)}</p>
      ${co.icp ? `<p><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">${esc(co.icp)}</a>${co.police ? ` &nbsp; ${esc(co.police)}` : ''}</p>` : ''}
      <p class="footer__spectrum" aria-hidden="true"></p>
      <p class="footer__legal"><a href="privacy.html">隐私政策</a><span>·</span><a href="terms.html">购买与服务条款</a></p>
    </div>
  </div>
</footer>`;
}

/** 购物袋抽屉、产品详情、结算弹层、客服浮窗、提示条。 */
export function overlays(site) {
  const link = isLinkMode(site);
  const c = site.contact;
  return `${link ? '' : `<div class="drawer" data-bag hidden>
  <div class="drawer__scrim" data-bag-close></div>
  <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="购物袋">
    <header class="drawer__head"><h3>购物袋 <i data-bag-count-text>0 件</i></h3><button type="button" class="iconbtn" data-bag-close aria-label="关闭购物袋">${icon('close')}</button></header>
    <ul class="baglist" data-bag-list></ul>
    <div class="bag-empty" data-bag-empty>${icon('bag')}<p>购物袋还是空的</p><a class="linkbtn" href="#collection" data-bag-close>去看看产品 ${icon('arrow')}</a></div>
    <footer class="drawer__foot" data-bag-foot>
      <div class="drawer__line"><span>合计</span><b data-bag-subtotal>¥0</b></div>
      <p class="drawer__hint" data-bag-hint></p>
      <button type="button" class="btn btn--metal btn--block" data-bag-checkout data-track="checkout_open">去结算</button>
    </footer>
  </aside>
</div>
<div class="sheet" data-sheet hidden>
  <div class="drawer__scrim" data-sheet-close></div>
  <aside class="sheet__panel" role="dialog" aria-modal="true" aria-label="产品详情" data-sheet-panel></aside>
</div>
<div class="modal" data-checkout hidden>
  <div class="drawer__scrim" data-checkout-close></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-label="结算" data-checkout-panel></div>
</div>`}
<div class="cs" data-cs>
  <div class="cs__panel" id="cs-panel" role="dialog" aria-label="联系客服" hidden>
    <p class="cs__title">联系客服<small>${esc(c.serviceHours)}</small></p>
    <a class="cs__row" href="${esc(telHref(c.phone))}" data-track="cs_phone">${icon('phone')}<span><b>电话咨询</b>${esc(c.phone)}</span></a>
    <a class="cs__row" href="${esc(mailHref(c.email, `${site.brand.name} 咨询`))}" data-track="cs_mail">${icon('mail')}<span><b>邮件咨询</b>${esc(c.email)}</span></a>
    ${c.onlineUrl ? `<a class="cs__row" href="${esc(c.onlineUrl)}" target="_blank" rel="noopener" data-track="cs_online">${icon('chat')}<span><b>在线客服</b>点击进入对话</span></a>` : ''}
    ${c.wechatQr ? `<div class="cs__qr">${img(c.wechatQr, '客服微信二维码', { cls: 'cs__qr-img', loading: 'lazy' })}<span>微信扫一扫</span></div>` : ''}
  </div>
  <button type="button" class="cs__btn" data-cs-toggle aria-expanded="false" aria-controls="cs-panel" data-track="cs_open">${icon('chat')}<span>客服</span></button>
</div>
<nav class="mbar" data-mbar aria-label="快捷入口">
  <button type="button" class="mbar__btn" data-cs-toggle aria-expanded="false" aria-controls="cs-panel" data-track="cs_open">${icon('chat')}<span>客服</span></button>
  ${link
    ? `<a class="mbar__btn" href="${esc(site.integrations.checkout.storeUrl || '#buy')}"${/^https?:/.test(site.integrations.checkout.storeUrl || '') ? ' target="_blank" rel="noopener"' : ''} data-track="buy_link">${icon('bag')}<span>${esc(site.buy.buyNowLabel)}</span></a>`
    : `<button type="button" class="mbar__btn" data-bag-open data-track="bag_open">${icon('bag')}<span>购物袋</span><i class="mbar__count" data-bag-count hidden>0</i></button>`}
  <a class="mbar__btn mbar__btn--cta" href="#care" data-track="mbar_advisor"><span>预约顾问</span></a>
</nav>
<div class="toast" data-toast role="status" aria-live="polite"></div>
<noscript><p class="noscript">页面交互需要启用 JavaScript；你也可以直接拨打 ${esc(c.phone)} 联系我们。</p></noscript>`;
}

/** 法务页面（隐私政策、购买与服务条款）。 */
export function legalPage(site, key, cssPath = 'css/style.css') {
  const page = site.legal[key];
  const c = site.contact;
  return `<!doctype html>
<html lang="${esc(site.meta.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}｜${esc(site.brand.name)}</title>
<meta name="description" content="${esc(site.brand.name)}${esc(page.title)}，更新于 ${esc(site.legal.updated)}。">
<meta name="robots" content="${esc(site.meta.robots || 'index, follow')}">
<meta name="theme-color" content="${esc(site.meta.themeColor)}">
<link rel="icon" href="${favicon(site)}">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="${cssPath}">
<style>:root{--bg:${esc(site.theme.colors.bg)};--bg-card:${esc(site.theme.colors.bgCard)};--ink:${esc(site.theme.colors.ink)};--ink-2:${esc(site.theme.colors.ink2)};--ink-3:${esc(site.theme.colors.ink3)};--accent:${esc(site.theme.colors.accent)};--font-display:${esc(site.theme.fonts.display)};--font-body:${esc(site.theme.fonts.body)};--font-mono:${esc(site.theme.fonts.mono)}}</style>
</head>
<body class="page-legal">
<main class="legal container">
  <a class="legal__back linkbtn" href="index.html">返回首页 ${icon('arrow')}</a>
  <p class="eyebrow">${esc(site.brand.name)}</p>
  <h1 class="legal__title">${esc(page.title)}</h1>
  <p class="legal__meta">更新日期：${esc(site.legal.updated)} · 如有疑问请联系 <a href="${esc(telHref(c.phone))}">${esc(c.phone)}</a> 或 <a href="${esc(mailHref(c.email))}">${esc(c.email)}</a></p>
  <p class="legal__intro">${esc(page.intro)}</p>
  ${page.sections.map((s, i) => `<section class="legal__sec"><h2><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.h)}</h2>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`).join('')}
</main>
<footer class="legal__foot">© ${esc(site.company.copyrightSince)} ${esc(site.company.legalName)}${site.company.icp ? ` · <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">${esc(site.company.icp)}</a>` : ''}</footer>
</body>
</html>`;
}
