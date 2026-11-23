/* 房间的光照关键帧：s ∈ [0,1] 对应 0 清晨 · 1/3 工作 · 2/3 晚餐 · 1 夜间，中间连续插值。
   仅供 tools/studio 渲染占位图使用。颜色为 sRGB 0–1。 */

const KEYS = [
  {
    pos: 0, clock: 6.5,
    sunDir: [1, 0.74, -0.32], sunColor: [1.0, 0.66, 0.46], sunI: 5.8,
    skyTop: [0.60, 0.73, 0.93], skyMid: [0.97, 0.80, 0.76], skyBot: [1.0, 0.85, 0.68],
    sunSpot: [0.62, 0.30], sunGlow: 0.9, stars: 0, moon: 0,
    hemiSky: [0.93, 0.89, 0.92], hemiGround: [0.56, 0.49, 0.43], hemiI: 0.9,
    envI: 0.8, fillColor: [0.96, 0.91, 0.95], fillI: 0.55,
    exposure: 1.02, shaftI: 0.5, dustI: 0.75,
    lampFloor: [0.3, 2700], lampOrb: [0.75, 2000], lampStrip: [0.2, 2400], lampPanel: [0, 2700], lampSense: 0.6,
    shade: 0.45, theme: 0,
  },
  {
    pos: 1 / 3, clock: 10.5,
    sunDir: [1, 1.7, 0.04], sunColor: [1.0, 0.97, 0.91], sunI: 6.6,
    skyTop: [0.50, 0.70, 0.96], skyMid: [0.78, 0.88, 0.98], skyBot: [0.95, 0.96, 0.94],
    sunSpot: [0.56, 0.52], sunGlow: 0.55, stars: 0, moon: 0,
    hemiSky: [0.86, 0.91, 1.0], hemiGround: [0.61, 0.57, 0.51], hemiI: 1.22,
    envI: 1.08, fillColor: [0.93, 0.95, 1.0], fillI: 0.95,
    exposure: 0.99, shaftI: 0.16, dustI: 0.35,
    lampFloor: [0.03, 5000], lampOrb: [0.02, 5000], lampStrip: [0.22, 3500], lampPanel: [0, 5500], lampSense: 1.0,
    shade: 1, theme: 0,
  },
  {
    /* 隐藏关键帧：黄昏，让「工作 → 晚餐」的过渡经过一个金色时刻 */
    pos: 0.55, clock: 17.8, hidden: true,
    sunDir: [1, 0.5, 0.42], sunColor: [1.0, 0.73, 0.46], sunI: 5.2,
    skyTop: [0.38, 0.50, 0.80], skyMid: [0.96, 0.63, 0.52], skyBot: [1.0, 0.74, 0.44],
    sunSpot: [0.5, 0.3], sunGlow: 1.0, stars: 0, moon: 0,
    hemiSky: [0.74, 0.64, 0.70], hemiGround: [0.46, 0.37, 0.31], hemiI: 0.82,
    envI: 0.62, fillColor: [1.0, 0.82, 0.72], fillI: 0.48,
    exposure: 1.0, shaftI: 0.55, dustI: 0.9,
    lampFloor: [0.78, 2700], lampOrb: [0.4, 2500], lampStrip: [0.5, 2300], lampPanel: [0.05, 3000], lampSense: 1.0,
    shade: 0.82, theme: 0.35,
  },
  {
    pos: 2 / 3, clock: 19.5,
    sunDir: [1, 0.3, 0.62], sunColor: [1.0, 0.52, 0.27], sunI: 3.6,
    skyTop: [0.17, 0.21, 0.44], skyMid: [0.80, 0.43, 0.47], skyBot: [1.0, 0.60, 0.32],
    sunSpot: [0.42, 0.28], sunGlow: 1.0, stars: 0.05, moon: 0,
    hemiSky: [0.52, 0.46, 0.62], hemiGround: [0.31, 0.23, 0.19], hemiI: 0.52,
    envI: 0.44, fillColor: [1.0, 0.72, 0.58], fillI: 0.3,
    exposure: 1.0, shaftI: 0.42, dustI: 0.85,
    lampFloor: [1, 2400], lampOrb: [0.55, 2200], lampStrip: [0.68, 2200], lampPanel: [0.18, 2700], lampSense: 1.0,
    shade: 0.7, theme: 1,
  },
  {
    pos: 1, clock: 23,
    sunDir: [1, 1.1, 0.2], sunColor: [0.56, 0.68, 1.0], sunI: 0.55,
    skyTop: [0.02, 0.03, 0.09], skyMid: [0.05, 0.08, 0.19], skyBot: [0.09, 0.11, 0.22],
    sunSpot: [0.5, 0.14], sunGlow: 0.1, stars: 1, moon: 1,
    hemiSky: [0.21, 0.26, 0.45], hemiGround: [0.09, 0.08, 0.09], hemiI: 0.24,
    envI: 0.16, fillColor: [0.52, 0.62, 0.92], fillI: 0.07,
    exposure: 0.95, shaftI: 0, dustI: 0,
    lampFloor: [0.15, 1800], lampOrb: [0, 1800], lampStrip: [0.05, 1800], lampPanel: [0, 1800], lampSense: 0.8,
    shade: 0.02, theme: 1,
  },
];

const COLOR_KEYS = new Set(['sunColor', 'skyTop', 'skyMid', 'skyBot', 'hemiSky', 'hemiGround', 'fillColor']);
const ARRAY_KEYS = new Set(['sunDir', 'sunSpot', 'lampFloor', 'lampOrb', 'lampStrip', 'lampPanel']);

/** 在滑块位置 s 处采样完整状态（线性插值）。 */
export function sample(s) {
  s = Math.min(1, Math.max(0, s));
  let i = 0;
  while (i < KEYS.length - 2 && s > KEYS[i + 1].pos) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (s - a.pos) / (b.pos - a.pos);
  const out = { s, keyIndex: i, mix: t };
  for (const k in a) {
    if (k === 'pos' || k === 'hidden') continue;
    const va = a[k];
    const vb = b[k];
    if (COLOR_KEYS.has(k) || ARRAY_KEYS.has(k)) out[k] = va.map((v, j) => v + (vb[j] - v) * t);
    else if (typeof va === 'number') out[k] = va + (vb - va) * t;
  }
  return out;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const hex = (rgb) => '#' + rgb.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('');
export const rgba = (rgb, a = 1) => `rgba(${rgb.map((v) => Math.round(clamp01(v) * 255)).join(',')},${Math.round(clamp01(a) * 1000) / 1000})`;
export { kelvinToRGB } from './models.js';
