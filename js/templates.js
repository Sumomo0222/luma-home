/* 模板统一出口：构建脚本与页面脚本都从这里引入。 */
export * from './tpl/core.js';
export { head, nav, hero, statement, footer, overlays, legalPage, favicon } from './tpl/page.js';
export { collection, design, space, smart, energy, install, reviews, buy, care, kitHtml, totalsHtml, appMock } from './tpl/sections.js';
export { sheet, bagItem, checkout, checkoutDone, symbolGlyph, accentBg } from './tpl/shop.js';
export { roomSvg, layoutSlots } from './tpl/rooms.js';
export { sprite, hasIcon } from './tpl/icons.js';
