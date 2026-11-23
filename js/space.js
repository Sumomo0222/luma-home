/* 空间搭配预览：切换房间、白天 / 夜晚、勾选商品。 */
import { site } from './site.js';
import { kitHtml, totalsHtml } from './tpl/sections.js';
import { roomSvg } from './tpl/rooms.js';
import { $, $$ } from './util.js';
import { addItems } from './shop.js';

export function initSpace() {
  const view = $('[data-room-view]');
  const tabs = $('[data-room-tabs]');
  const kit = $('[data-kit]');
  if (!view || !tabs || !kit) return;
  const rooms = site.space.rooms;
  const off = Object.fromEntries(rooms.map((r) => [r.id, new Set()]));
  let current = rooms.find((r) => r.id === view.dataset.room) || rooms[0];

  const paint = () => {
    const list = [...off[current.id]];
    kit.innerHTML = kitHtml(site, current, list);
    const totals = $('[data-totals]');
    if (totals) totals.innerHTML = totalsHtml(site, current, list);
    view.querySelectorAll('[data-fx],[data-glow]').forEach((g) => g.classList.toggle('is-off', list.includes(g.dataset.fx || g.dataset.glow)));
  };

  const toggle = (slot) => {
    const item = current.items.find((it) => it.slot === slot);
    if (!item || item.fixed) return;
    if (off[current.id].has(slot)) off[current.id].delete(slot); else off[current.id].add(slot);
    paint();
  };

  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-room]');
    const room = rooms.find((r) => r.id === b?.dataset.room);
    if (!room || room.id === current.id) return;
    $$('[data-room]', tabs).forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', String(x === b)); });
    current = room;
    view.dataset.room = room.id;
    view.classList.add('is-swap');
    setTimeout(() => {
      view.innerHTML = roomSvg(room, [...off[room.id]]);
      $('[data-room-name]').textContent = room.name;
      $('[data-room-en]').textContent = `${room.en} · ${room.area} m²`;
      $('[data-room-note]').textContent = room.note;
      paint();
      view.classList.remove('is-swap');
    }, 180);
  });
  kit.addEventListener('click', (e) => {
    const li = e.target.closest('[data-kit-slot]');
    if (li) toggle(li.dataset.kitSlot);
  });
  view.parentElement.addEventListener('click', (e) => {
    const g = e.target.closest('[data-fx]');
    if (g) toggle(g.dataset.fx);
  });
  $$('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-mode]').forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    view.dataset.mode = b.dataset.mode;
  }));
  $('[data-add-kit]')?.addEventListener('click', () => {
    addItems(current.items.filter((it) => !off[current.id].has(it.slot)).map((it) => [it.product, it.qty]));
  });
  view.dataset.mode = 'day';
  paint();
}
