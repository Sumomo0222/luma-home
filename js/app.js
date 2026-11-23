/* Luma Home — 页面脚本入口。
   页面内容已在构建时渲染为静态 HTML；这里只负责在现有元素上绑定交互。 */
import { initChrome } from './chrome.js';
import { initHero } from './hero.js';
import { initProducts } from './products.js';
import { initShop } from './shop.js';
import { initSpace } from './space.js';
import { initSmart } from './smart.js';
import { initEnergy } from './energy.js';
import { initDesign } from './design.js';

try {
  initChrome();
  const hero = initHero();
  initProducts();
  initShop();
  initSpace();
  initSmart();
  initEnergy();
  initDesign();
  // 页面加载稳定后，如果访客还没有操作，自动演示一遍一天的光线变化
  addEventListener('load', () => hero?.startAutoDemo?.(), { once: true });
  if (document.readyState === 'complete') hero?.startAutoDemo?.();
} catch (err) {
  console.error('[Luma Home] 页面脚本初始化失败', err);
}
