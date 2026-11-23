/* 空间搭配示意图：四种户型的正面示意图。
   每种户型（layout）定义一组 slot（图例位），配置里的商品通过 slot 名放到对应位置，
   所以换掉商品不需要改这里的绘图代码。纯字符串函数，构建与浏览器共用。 */

const S = 'class="rm-s"';
const M = 'class="rm-m"';

/* ---------- 小部件：每个返回「产品符号 + 光晕」两段 ---------- */
const fixture = (slot, fx, glow) => ({ fx: `<g data-fx="${slot}">${fx}</g>`, glow: `<g data-glow="${slot}">${glow}</g>` });

const floorLamp = (slot, x, base) => fixture(slot,
  `<path d="M${x} ${base - 2}V${base - 246}" ${S} stroke-width="3.5"/><path d="M${x} ${base - 246}l17-10" ${S} stroke-width="3.5"/>
   <ellipse cx="${x + 17}" cy="${base - 258}" rx="28" ry="6.5" ${M}/><ellipse cx="${x}" cy="${base - 2}" rx="25" ry="4.5" ${M}/>`,
  `<path d="M${x + 5} ${base - 253}L${x + 29} ${base - 253}L${x + 122} ${base + 8}L${x - 88} ${base + 8}Z" fill="url(#rm-cone)"/>
   <ellipse cx="${x + 17}" cy="${base - 257}" rx="86" ry="46" fill="url(#rm-warm)"/><ellipse cx="${x + 12}" cy="${base + 16}" rx="116" ry="20" fill="url(#rm-warm)" opacity=".7"/>`);

const orb = (slot, x, base) => fixture(slot,
  `<path d="M${x - 17} ${base}h34M${x - 11} ${base}c0-6 5-9 11-9s11 3 11 9" ${S}/><circle cx="${x}" cy="${base - 31}" r="15.5" ${S}/>`,
  `<circle cx="${x}" cy="${base - 31}" r="15.5" fill="url(#rm-core)"/><ellipse cx="${x}" cy="${base - 31}" rx="70" ry="66" fill="url(#rm-warm)"/>`);

const bedside = (slot) => fixture(slot,
  [236, 704].map((x) => `<path d="M${x - 17} 346h34M${x - 11} 346c0-6 5-9 11-9s11 3 11 9" ${S}/><circle cx="${x}" cy="315" r="15.5" ${S}/>`).join(''),
  [236, 704].map((x) => `<circle cx="${x}" cy="315" r="15.5" fill="url(#rm-core)"/><ellipse cx="${x}" cy="315" rx="70" ry="66" fill="url(#rm-warm)"/>`).join(''));

const pendant = (slot, x, tableY) => fixture(slot,
  `<path d="M${x} 0v118" ${S}/><path d="M${x - 18} 4h36" ${S}/><ellipse cx="${x}" cy="122" rx="62" ry="11" ${S} stroke-width="3"/>`,
  `<path d="M${x - 56} 128L${x + 56} 128L${x + 118} ${tableY}L${x - 118} ${tableY}Z" fill="url(#rm-cone)"/>
   <ellipse cx="${x}" cy="122" rx="118" ry="52" fill="url(#rm-warm)"/><ellipse cx="${x}" cy="${tableY + 30}" rx="150" ry="26" fill="url(#rm-warm)" opacity=".55"/>`);

const panel = (slot, x, w) => fixture(slot,
  `<rect x="${x}" y="8" width="${w}" height="7" rx="3.5" ${M}/>`,
  `<rect x="${x - w * .5}" y="14" width="${w * 2}" height="230" fill="url(#rm-wash-down)"/>`);

const strip = (slot, x1, x2, y, dir = 'down', depth = 110) => fixture(slot,
  `<path d="M${x1} ${y}H${x2}" class="rm-strip"/>`,
  `<rect x="${x1 - 6}" y="${dir === 'down' ? y : y - depth}" width="${x2 - x1 + 12}" height="${depth}" fill="url(#rm-wash-${dir})"/>`);

const sense = (slot, x, base) => fixture(slot,
  `<path d="M${x - 15} ${base - 2}c0-9 7-14 15-14s15 5 15 14c0 3-7 5-15 5s-15-2-15-5z" ${M}/>`,
  `<circle cx="${x}" cy="${base - 10}" r="26" fill="url(#rm-warm)"/><circle cx="${x}" cy="${base - 9}" r="3" fill="#fff6e8"/>`);

/* ---------- 家具 ---------- */
function windowEl(x, w, { top = 44, bottom = 410, shade = false } = {}) {
  const h = bottom - top;
  const fold = (fx) => `M${fx} ${top + 5}v${h * .66}`;
  return `<g>
    <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#rm-sky)"/>
    <path d="M${x} ${bottom - 50}Q${x + w * .3} ${bottom - 96} ${x + w * .55} ${bottom - 66}T${x + w} ${bottom - 76}V${bottom}H${x}Z" class="rm-hill"/>
    <rect x="${x}" y="${top}" width="${w}" height="${h}" class="rm-frame" stroke-width="7"/>
    <path d="M${x + w / 2} ${top}V${bottom}" class="rm-frame" stroke-width="3.5"/>
    ${shade ? `<g data-fx="shade"><rect x="${x + 6}" y="${top + 6}" width="${w - 12}" height="${h * .66}" fill="url(#rm-sheer)"/>
      <path d="${fold(x + 6)}${fold(x + w / 3)}${fold(x + w * 2 / 3)}${fold(x + w - 6)}" stroke="#ffffff" stroke-opacity=".55"/>
      <rect x="${x + 6}" y="${top + 6 + h * .66}" width="${w - 12}" height="6" ${M}/></g>` : ''}
  </g>`;
}
const shadow = (cx, rx, y = 416) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="9" fill="#2a1c0e" opacity=".16"/>`;
const rug = (cx, rx) => `<ellipse cx="${cx}" cy="458" rx="${rx}" ry="34" class="rm-rug"/><ellipse cx="${cx}" cy="458" rx="${rx - 14}" ry="25" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="2 6"/>`;

function sofa(x, w) {
  const y = 294;
  const seat = (w - 84) / 3;
  return `${shadow(x + w / 2, w * .55)}
  <rect x="${x}" y="${y + 22}" width="${w}" height="88" rx="16" fill="url(#rm-sofa)"/>
  <rect x="${x + 12}" y="${y}" width="${w - 24}" height="72" rx="16" fill="#f8f3e9"/>
  <rect x="${x}" y="${y + 50}" width="36" height="62" rx="15" fill="#ebe2d2"/>
  <rect x="${x + w - 36}" y="${y + 50}" width="36" height="62" rx="15" fill="#ebe2d2"/>
  ${[0, 1, 2].map((i) => `<rect x="${x + 42 + i * seat}" y="${y + 60}" width="${seat - 5}" height="38" rx="10" fill="#f4ede0"/>`).join('')}
  <rect x="${x + 48}" y="${y + 30}" width="58" height="58" rx="12" fill="#c9866a" transform="rotate(-8 ${x + 77} ${y + 59})"/>
  <rect x="${x + w - 110}" y="${y + 32}" width="54" height="54" rx="12" fill="#b3a68d" transform="rotate(7 ${x + w - 83} ${y + 59})"/>`;
}
const coffeeTable = (cx) => `${shadow(cx, 82, 410)}<rect x="${cx - 15}" y="356" width="30" height="50" fill="#e6dfd2"/>
  <ellipse cx="${cx}" cy="356" rx="78" ry="10" fill="url(#rm-stone)"/><path d="M${cx + 26} 346c0-8 4-12 9-12s9 4 9 12z" fill="#b5674a"/>`;
const sideTable = (x) => `${shadow(x + 30, 38, 410)}<rect x="${x}" y="346" width="60" height="10" rx="4" fill="url(#rm-wood)"/>
  <path d="M${x + 9} 356V408M${x + 51} 356V408" stroke="#3b3733" stroke-width="3"/>`;
const console = (x, w) => `${shadow(x + w / 2, w * .58)}<rect x="${x}" y="306" width="${w}" height="100" rx="8" fill="url(#rm-wood)"/>
  <path d="M${x + w / 2} 314v86" stroke="#8f7048" stroke-width="1.5" opacity=".6"/><rect x="${x + 10}" y="300" width="40" height="6" rx="2" fill="#f1ebdf"/>`;
const plant = (x, base, s = 1) => `<g transform="translate(${x} ${base}) scale(${s})">${shadow(0, 30, 8)}
  <path d="M-22-58h44l-6 62h-32z" class="rm-pot"/><path d="M0-58V-150M0-96l-30-40M0-112l32-44M0-136l-18-46M0-140l22-40" stroke="#3f5a3a" stroke-width="3" fill="none"/>
  <ellipse cx="-34" cy="-144" rx="16" ry="26" fill="#4a6b4e" transform="rotate(-28 -34 -144)"/><ellipse cx="36" cy="-162" rx="16" ry="27" fill="#557a56" transform="rotate(26 36 -162)"/>
  <ellipse cx="-22" cy="-190" rx="14" ry="25" fill="#4a6b4e" transform="rotate(-14 -22 -190)"/><ellipse cx="26" cy="-186" rx="14" ry="25" fill="#557a56" transform="rotate(12 26 -186)"/>
  <ellipse cx="0" cy="-162" rx="14" ry="26" fill="#43644a"/></g>`;

function bed(x, w) {
  return `${shadow(x + w / 2, w * .55)}
  <rect x="${x + 16}" y="226" width="${w - 32}" height="112" rx="22" fill="url(#rm-sofa)"/>
  <rect x="${x + 40}" y="284" width="92" height="42" rx="13" fill="#ffffff"/><rect x="${x + w - 132}" y="284" width="92" height="42" rx="13" fill="#ffffff"/>
  <rect x="${x}" y="322" width="${w}" height="64" rx="14" fill="#f7f2e8"/>
  <rect x="${x}" y="350" width="${w}" height="36" rx="9" fill="#c9a97c" opacity=".85"/>
  <rect x="${x + 10}" y="382" width="${w - 20}" height="22" rx="6" fill="url(#rm-wood)"/>`;
}
const nightstand = (x) => `${shadow(x + 30, 38)}<rect x="${x}" y="346" width="60" height="60" rx="6" fill="url(#rm-wood)"/><path d="M${x} 366h60" stroke="#8f7048" stroke-width="1.2" opacity=".6"/>`;
const dresser = (x, w) => `${shadow(x + w / 2, w * .58)}<rect x="${x}" y="296" width="${w}" height="110" rx="8" fill="url(#rm-wood)"/>
  ${[0, 1, 2].map((i) => `<path d="M${x + 12} ${322 + i * 27}h${w - 24}" stroke="#8f7048" stroke-width="1.4" opacity=".55"/>`).join('')}
  <circle cx="${x + w / 2}" cy="314" r="2.6" fill="#3b3733"/><circle cx="${x + w / 2}" cy="341" r="2.6" fill="#3b3733"/><circle cx="${x + w / 2}" cy="368" r="2.6" fill="#3b3733"/>`;

const chair = (x, y = 250, front = false) => front
  ? `<path d="M${x + 6} ${y + 52}V410M${x + 40} ${y + 52}V410" stroke="#3b3733" stroke-width="3"/><rect x="${x}" y="${y + 42}" width="46" height="10" rx="5" fill="url(#rm-wood)"/><rect x="${x}" y="${y}" width="46" height="12" rx="6" fill="url(#rm-wood)"/><path d="M${x + 20} ${y + 12}V${y + 42}" stroke="#3b3733" stroke-width="3"/>`
  : `<rect x="${x}" y="${y}" width="46" height="46" rx="10" fill="#e9e2d4"/><rect x="${x + 4}" y="${y + 40}" width="38" height="8" rx="4" fill="url(#rm-wood)"/>`;

const diningTable = (x, w) => `${shadow(x + w / 2, w * .56)}<rect x="${x + 16}" y="338" width="8" height="68" fill="#a98a5e"/><rect x="${x + w - 24}" y="338" width="8" height="68" fill="#a98a5e"/>
  <rect x="${x}" y="330" width="${w}" height="10" rx="4" fill="url(#rm-wood)"/><ellipse cx="${x + w / 2}" cy="327" rx="26" ry="5" fill="#f1ebdf"/><path d="M${x + w / 2 - 6} 322h12v5h-12z" fill="#b5674a"/>`;
const cabinets = (x, w) => `<rect x="${x}" y="56" width="${w}" height="112" rx="6" fill="#f1ece2"/>
  ${[1, 2, 3].map((i) => `<path d="M${x + (w / 4) * i} 60v104" stroke="#d8cfc0" stroke-width="1.5"/>`).join('')}
  <rect x="${x - 8}" y="286" width="${w + 16}" height="9" rx="3" fill="#d8cfc0"/><rect x="${x}" y="295" width="${w}" height="111" rx="6" fill="#ebe5da"/>
  ${[1, 2].map((i) => `<path d="M${x + (w / 3) * i} 300v100" stroke="#d8cfc0" stroke-width="1.5"/>`).join('')}
  <rect x="${x + 24}" y="266" width="30" height="20" rx="3" fill="#b5674a"/><path d="M${x + 150} 286v-34h44v34" fill="none" stroke="#9a948a" stroke-width="3"/>`;
const desk = (x, w) => `${shadow(x + w / 2, w * .56)}<rect x="${x + 12}" y="312" width="9" height="94" fill="#a98a5e"/>
  <rect x="${x + w - 142}" y="312" width="130" height="94" rx="7" fill="url(#rm-wood)"/>${[0, 1].map((i) => `<path d="M${x + w - 132} ${344 + i * 30}h110" stroke="#8f7048" stroke-width="1.4" opacity=".55"/>`).join('')}
  <rect x="${x}" y="302" width="${w}" height="11" rx="4" fill="url(#rm-wood)"/>
  <path d="M${x + w - 92} 302v-30h62v30" fill="none" stroke="#3b3733" stroke-width="3"/><rect x="${x + w - 104}" y="238" width="84" height="40" rx="4" fill="#2b2b2e"/>`;
const shelf = (x, w) => `<rect x="${x}" y="112" width="${w}" height="9" rx="3" fill="url(#rm-wood)"/>
  ${[[16, 9, 54, '#c9866a'], [29, 7, 48, '#8d8a7f'], [40, 10, 58, '#e3dccb'], [54, 8, 50, '#3e4a52'], [150, 12, 36, '#b59a6e']].map(([dx, dw, dh, c]) => `<rect x="${x + dx}" y="${112 - dh}" width="${dw}" height="${dh}" fill="${c}"/>`).join('')}
  <path d="M${x + w - 110} 104c0-12 8-18 18-18s18 6 18 18z" fill="#f1ebdf"/>`;

/* ---------- 四种户型：slot 名 → 图例 ---------- */
const LAYOUTS = {
  living: () => ({
    back: windowEl(694, 244),
    furniture: `${rug(430, 270)}${sofa(300, 332)}${coffeeTable(466)}${sideTable(224)}${console(56, 150)}${plant(870, 410, .9)}`,
    slots: { floor: floorLamp('floor', 664, 408), table: orb('table', 254, 346), panel: panel('panel', 430, 92), strip: strip('strip', 64, 198, 300, 'up', 110), hub: sense('hub', 132, 300) },
  }),
  bedroom: () => ({
    back: windowEl(48, 150, { shade: true }),
    furniture: `${rug(470, 190)}${bed(280, 380)}${nightstand(206)}${nightstand(674)}${dresser(796, 136)}${plant(238, 410, .62)}`,
    slots: { bedside: bedside('bedside'), table: orb('table', 236, 346), strip: strip('strip', 296, 644, 232, 'up', 114), hub: sense('hub', 864, 296) },
  }),
  dining: () => ({
    back: windowEl(760, 178, { top: 60, bottom: 300 }),
    furniture: `${cabinets(50, 236)}${chair(404)}${chair(556)}${diningTable(330, 320)}${chair(392, 268, true)}${chair(546, 268, true)}${plant(900, 410, .8)}`,
    slots: { pendant: pendant('pendant', 490, 326), strip: strip('strip', 56, 280, 176, 'down', 122), panel: panel('panel', 660, 92), hub: sense('hub', 228, 286) },
  }),
  study: () => ({
    back: windowEl(770, 168, { top: 56, bottom: 300 }),
    furniture: `${rug(470, 210)}${shelf(290, 380)}${desk(270, 420)}${chair(444, 318, true)}${plant(728, 410, .7)}`,
    slots: { table: orb('table', 336, 302), strip: strip('strip', 296, 664, 124, 'down', 124), panel: panel('panel', 420, 92), hub: sense('hub', 560, 302) },
  }),
};

const DEFS = `<defs>
  <linearGradient id="rm-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--rw1)"/><stop offset="1" style="stop-color:var(--rw2)"/></linearGradient>
  <linearGradient id="rm-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--rf1)"/><stop offset="1" style="stop-color:var(--rf2)"/></linearGradient>
  <linearGradient id="rm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--rs1)"/><stop offset="1" style="stop-color:var(--rs2)"/></linearGradient>
  <linearGradient id="rm-sofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5efe3"/><stop offset="1" stop-color="#d6c9b4"/></linearGradient>
  <linearGradient id="rm-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6b98d"/><stop offset="1" stop-color="#b08f62"/></linearGradient>
  <linearGradient id="rm-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e9da"/><stop offset="1" stop-color="#d9cdb7"/></linearGradient>
  <linearGradient id="rm-sheer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf7ef" stop-opacity=".82"/><stop offset="1" stop-color="#fbf7ef" stop-opacity=".5"/></linearGradient>
  <linearGradient id="rm-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3bd" stop-opacity=".8"/><stop offset="1" stop-color="#ffd6a2" stop-opacity="0"/></linearGradient>
  <linearGradient id="rm-wash-down" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdcae" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf9a" stop-opacity="0"/></linearGradient>
  <linearGradient id="rm-wash-up" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffdcae" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf9a" stop-opacity="0"/></linearGradient>
  <radialGradient id="rm-warm"><stop offset="0" stop-color="#fff4de" stop-opacity=".95"/><stop offset=".4" stop-color="#ffc98f" stop-opacity=".5"/><stop offset="1" stop-color="#ff9d4d" stop-opacity="0"/></radialGradient>
  <radialGradient id="rm-core"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe2b8"/></radialGradient>
</defs>`;

/** 某个户型的全部 slot 名，构建时用来检查配置里有没有写错的 slot。 */
export const layoutSlots = (layout) => Object.keys((LAYOUTS[layout] || LAYOUTS.living)().slots).concat('shade');

/** 生成房间的示意图。关闭状态的 slot（offSlots）会隐藏对应的图例与光晕。 */
export function roomSvg(room, offSlots = []) {
  const build = LAYOUTS[room.layout] || LAYOUTS.living;
  const art = build();
  const used = new Set(room.items.map((it) => it.slot));
  const off = (name) => (offSlots.includes(name) ? ' class="is-off"' : '');
  const lamps = Object.entries(art.slots).filter(([slot]) => used.has(slot));
  return `<svg viewBox="0 0 960 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${room.name}的空间搭配示意图">
    ${DEFS}
    <rect width="960" height="412" fill="url(#rm-wall)"/>
    ${art.back.replace('<g data-fx="shade">', `<g data-fx="shade"${used.has('shade') ? off('shade') : ' class="is-off"'}>`)}
    <rect y="410" width="960" height="230" fill="url(#rm-floor)"/>
    <path d="M0 410H960" stroke="#000" stroke-opacity=".14"/>
    <g class="r-furniture">${art.furniture}</g>
    <rect class="r-dim" width="960" height="640"/>
    <g class="r-glows" style="mix-blend-mode:screen">${lamps.map(([slot, f]) => f.glow.replace('<g ', `<g${off(slot)} `)).join('')}</g>
    <g class="r-lamps">${lamps.map(([slot, f]) => f.fx.replace('<g ', `<g${off(slot)} `)).join('')}</g>
  </svg>`;
}
