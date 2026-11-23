/* 节能：数字滚动、柱状图生长、日光感应开关。 */
import { site } from './site.js';
import { $, $$, clamp, whenInView, reducedMotion } from './util.js';
import { num } from './tpl/core.js';

const W = 760;
const H = 330;
const PAD_T = 44;
const PAD_B = 62;
const yOf = (kwh, max) => PAD_T + (1 - kwh / max) * (H - PAD_B - PAD_T);

export function initEnergy() {
  const e = site.energy;
  const chart = $('[data-energy-chart]');
  const bars = $$('[data-bar]', chart);
  const still = reducedMotion();
  const max = Math.ceil((Math.max(...e.bars.map((b) => Math.max(b.kwh, b.kwhAlt || 0))) * 1.08) / 100) * 100;
  let harvest = true;
  let shown = false;

  const paint = () => {
    bars.forEach((bar) => {
      const kwh = Number(bar.dataset.kwhAlt && !harvest ? bar.dataset.kwhAlt : bar.dataset.kwh) || 0;
      const y = shown || still ? yOf(kwh, max) : H - PAD_B;
      bar.setAttribute('y', y.toFixed(1));
      bar.setAttribute('height', Math.max(0, H - PAD_B - y).toFixed(1));
      const val = $(`[data-bar-val="${bar.dataset.bar}"]`, chart);
      if (val) { val.setAttribute('y', (y - 14).toFixed(1)); val.firstChild.nodeValue = shown || still ? num(kwh) : '0'; }
    });
    const lumaNote = $('[data-bar-note="luma"]', chart);
    if (lumaNote) lumaNote.textContent = harvest ? e.bars.find((b) => b.id === 'luma').note : (e.bars.find((b) => b.id === 'luma').noteAlt || '日光感应关闭');
    const luma = e.bars.find((b) => b.id === 'luma');
    const kwh = harvest ? luma.kwh : luma.kwhAlt;
    const note = $('[data-energy-note]');
    if (note) note.innerHTML = (harvest ? e.summaryOn : e.summaryOff).replace('{kwh}', `<b>${num(kwh)}</b>`).replace('{cost}', `<b>¥${Math.round(kwh * e.pricePerKwh)}</b>`);
    $('[data-daylight-curve]')?.classList.toggle('is-off', !harvest);
  };

  // 进入视口时：柱子从 0 长起，数字从 0 滚到目标值
  $$('[data-count]').forEach((el) => whenInView(el, (vis) => {
    if (!vis || el.dataset.done || still) return;
    el.dataset.done = '1';
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const start = performance.now();
    const step = (now) => {
      const t = clamp((now - start) / 1700);
      el.firstChild.nodeValue = num(target * (1 - Math.pow(1 - t, 3)), decimals);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, '0px 0px -10% 0px'));
  const curves = $('[data-daylight-curve]');
  if (curves) whenInView(curves, (vis) => vis && curves.classList.add('in'), '0px 0px -15% 0px');
  if (!still) paint();
  whenInView(chart, (vis) => { if (vis && !shown) { shown = true; setTimeout(paint, 250); } }, '0px 0px -20% 0px');

  const sw = $('[data-harvest]');
  sw?.addEventListener('click', () => {
    harvest = !harvest;
    sw.setAttribute('aria-checked', String(harvest));
    paint();
  });
}
