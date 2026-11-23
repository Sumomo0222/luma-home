/* 智能联动：点选联动场景，App 示意面板同步变化。 */
import { site } from './site.js';
import { appMock } from './tpl/sections.js';
import { $, $$ } from './util.js';

export function initSmart() {
  const list = $('[data-autopick]');
  const appList = $('[data-app-list]');
  const flow = $('.flow');
  if (!list || !appList) return;
  let timers = [];

  const render = (auto) => {
    timers.forEach(clearTimeout);
    timers = [];
    appList.innerHTML = appMock(site, auto);
    $$('.dev__fill', appList).forEach((f, i) => {
      const d = auto.devices[i];
      const target = f.style.width;
      f.style.transition = 'none';
      f.style.width = '0%';
      timers.push(setTimeout(() => { f.style.transition = ''; f.style.width = target; }, 160 + i * 150));
    });
    flow.classList.remove('is-live');
    void flow.offsetWidth;
    flow.classList.add('is-live');
    const anyOn = auto.devices.some((d) => d.on);
    const lightOn = auto.devices.some((d) => d.on && site.collection.products.find((p) => p.id === d.product)?.kind === 'light');
    const shadeOn = auto.devices.some((d) => d.on && d.product === 'luma-shade');
    $('[data-node="light"]', flow).classList.toggle('is-on', lightOn);
    $('[data-node="shade"]', flow).classList.toggle('is-on', shadeOn);
    $('[data-node="sense"]', flow).classList.toggle('is-on', anyOn);
    const lat = 64 + auto.devices.length * 3;
    const state = $('[data-app-state]');
    if (state) state.textContent = anyOn ? `${auto.devices.filter((d) => d.on).length + 1} 台设备在线 · 已同步` : '仅中枢在线';
    const latEl = $('[data-app-latency]');
    if (latEl) latEl.textContent = lat + ' ms';
    const meta = $('[data-flow-meta]');
    if (meta) meta.textContent = `本地联动 · ${lat} ms`;
  };

  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-auto]');
    const auto = site.smart.automations.find((a) => a.id === b?.dataset.auto);
    if (!auto) return;
    $$('.auto', list).forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', String(x === b)); });
    render(auto);
  });
}
