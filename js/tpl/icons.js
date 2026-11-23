/* 图标库（内联 SVG symbol，构建时输出一次，全站 <use> 引用）。 */

const SYMBOLS = {
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  bag: '<path d="M6 8h12l1.2 12H4.8L6 8zM9 8V6.5a3 3 0 0 1 6 0V8"/>',
  play: '<path d="M8 5.5v13l10-6.5z"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M2 12h2.5M19.5 12H22M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.4-3 7.6-7 9.5-4-1.9-7-5.1-7-9.5V6l7-3zM9 12l2 2 4-4"/>',
  return: '<path d="M4 9h11a5 5 0 0 1 0 10H9M4 9l4-4M4 9l4 4"/>',
  tools: '<path d="M14.5 5.5a4 4 0 0 0-5.3 5.3L4 16l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.6-.6-2.6 2.6-2.2z"/>',
  refresh: '<path d="M20 12a8 8 0 0 1-14.5 4.6M4 12a8 8 0 0 1 14.5-4.6M4.5 21v-4.5H9M19.5 3v4.5H15"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4h1.5A2.5 2.5 0 0 1 4 13.5v-7z"/>',
  locate: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v4.5M12 17.5V22M2 12h4.5M17.5 12H22"/>',
  mount: '<path d="M9.2 12h5.6"/><circle cx="6.5" cy="12" r="2.4"/><circle cx="17.5" cy="12" r="2.4"/>',
  snap: '<path d="M6.5 4v7a5.5 5.5 0 0 0 11 0V4M6.5 4h3.6v7M17.5 4h-3.6v7"/>',
  pair: '<path d="M10 20H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 4h13A1.5 1.5 0 0 1 19.5 5.5v4M14 4h6v6M20 4l-8 8"/>',
  drag: '<path d="M4.5 12a7.5 7.5 0 0 1 12.9-5.2M19.5 12a7.5 7.5 0 0 1-12.9 5.2M17.4 3v3.8h-3.8M6.6 21v-3.8h3.8"/>',
  focus: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.4"/>',
  sunset: '<path d="M5.5 16.5a6.5 6.5 0 0 1 13 0M2 16.5h20M12 3v4.5M9.5 5.5L12 8l2.5-2.5"/>',
  away: '<path d="M14 3H6v18h14V9l-6-6zM14 3v6h6M11.5 11.5v2"/>',
  truck: '<path d="M2.5 7h11v9h-11zM13.5 10h4l3 3v3h-7zM6.5 19a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM17.5 19a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z"/>',
  expand: '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>',
  power: '<path d="M12 3v8M6.3 7a8 8 0 1 0 11.4 0"/>',
  link: '<circle cx="5" cy="12" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="19" cy="12" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M7 11l10-5.2M7.2 12h9.6M7 13l10 5.2"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  phone: '<path d="M5 4h4l1.5 4.5-2.2 1.6a12 12 0 0 0 5.6 5.6l1.6-2.2L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.3 20 4 13.7 3.5 5.6A1.5 1.5 0 0 1 5 4z"/>',
  mail: '<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h14a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5v-11zM4 7l8 6 8-6"/>',
  wechat: '<path d="M8.5 4.5C5 4.5 2.5 6.9 2.5 9.7c0 1.6.8 3 2.1 4l-.6 2 2.2-1.2c.7.2 1.4.3 2.2.3M9 13.2c0 2.6 2.4 4.6 5.3 4.6.7 0 1.3-.1 1.9-.3l2 1.1-.5-1.8c1.2-.9 1.9-2.2 1.9-3.6 0-2.6-2.4-4.7-5.3-4.7S9 10.6 9 13.2z"/>',
  pin: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  external: '<path d="M14 4h6v6M20 4l-8 8M10 20H4v-6"/>',
  top: '<path d="M6 14l6-6 6 6"/>',
};

export function sprite() {
  return `<svg class="sprite" aria-hidden="true" focusable="false">${Object.entries(SYMBOLS).map(([id, body]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${body}</symbol>`).join('')}</svg>`;
}

export const hasIcon = (id) => id in SYMBOLS;
