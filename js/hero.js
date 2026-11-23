/* 首屏：时间滑块在几张场景图之间交叉淡入，并同步读数、文字颜色、环境光与标志里的「太阳」。 */
import { site } from './site.js';
import { $, $$, clamp, lerp, tweens, reducedMotion, onScrollResize, whenInView } from './util.js';

const hours = (time) => { const [h, m] = String(time).split(':').map(Number); return (h || 0) + (m || 0) / 60; };
const pad = (n) => String(n).padStart(2, '0');
const clock = (h) => `${pad(Math.floor(h) % 24)}:${pad(Math.floor((h % 1) * 60 + 1e-6))}`;
const rgb = (hex) => { const n = parseInt(String(hex).replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

export function initHero() {
  const root = $('[data-hero]');
  if (!root) return;
  const scenes = site.hero.scenes;
  const N = scenes.length;
  const photos = $$('[data-photo]', root);
  const range = $('[data-range]', root);
  const fill = $('[data-fill]', root);
  const box = $('[data-timebar]', root);
  const thumb = $('[data-thumb]', root);
  const clockEl = $('[data-clock]', root);
  const nameEl = $('[data-scene-name]', root);
  const enEl = $('[data-scene-en]', root);
  const stops = $$('.stop', root);
  const roEls = Object.fromEntries($$('[data-ro]', root).map((el) => [el.dataset.ro, el]));
  const caption = $('[data-caption]', root);
  const capTitle = $('b', caption);
  const capText = $('span', caption);
  const playBtn = $('[data-play]', root);
  const playUse = playBtn && $('use', playBtn);
  const glowEl = $('[data-glow]', root);
  const logoSun = $('[data-logo-sun]');
  const nav = $('[data-nav]');
  const tw = tweens();
  const still = reducedMotion();

  let s = 0;
  let current = -1;
  let playing = false;
  let timers = [];
  let swapToken = 0;
  let inView = true;
  let touched = false;
  let autoStarted = false;

  const wait = (ms) => new Promise((resolve) => { timers.push(setTimeout(resolve, ms)); });
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const orbit = (v) => ((150 + v * 300) * Math.PI) / 180;

  function setScene(idx) {
    current = idx;
    const sc = scenes[idx];
    stops.forEach((b, i) => { b.classList.toggle('is-active', i === idx); b.setAttribute('aria-pressed', String(i === idx)); });
    photos.forEach((p, i) => p.classList.toggle('is-live', i === idx));
    const token = ++swapToken;
    caption.classList.add('is-swap');
    timers.push(setTimeout(() => {
      if (token !== swapToken) return;
      nameEl.textContent = sc.name;
      enEl.textContent = sc.en;
      capTitle.textContent = sc.title;
      capText.textContent = sc.caption;
      caption.classList.remove('is-swap');
    }, 220));
  }

  function apply(v) {
    s = clamp(v);
    const f = N > 1 ? s * (N - 1) : 0;
    const i = Math.max(0, Math.min(N - 2, Math.floor(f)));
    const t = N > 1 ? clamp(f - i) : 0;
    const a = scenes[i];
    const b = scenes[Math.min(N - 1, i + 1)];
    const mix = (x, y) => lerp(x, y, t);

    photos.forEach((ph, k) => { ph.style.opacity = (N === 1 ? 1 : k === i ? 1 - t : k === i + 1 ? t : 0).toFixed(3); });

    box.style.setProperty('--p', (s * 100).toFixed(2) + '%');
    fill.style.width = (s * 100).toFixed(2) + '%';
    if (document.activeElement !== range) range.value = String(Math.round(s * 1000));
    const time = mix(hours(a.time), hours(b.time));
    clockEl.textContent = clock(time);

    for (const key of Object.keys(a.readout)) {
      const el = roEls[key];
      if (!el) continue;
      const val = mix(a.readout[key], b.readout[key] ?? a.readout[key]);
      el.textContent = key === 'kelvin' ? Math.round(val / 100) * 100 + 'K' : Math.round(val) + '%';
    }
    const ca = rgb(a.glow || '#ffb27a');
    const cb = rgb(b.glow || a.glow || '#ffb27a');
    glowEl.style.setProperty('--glow', `rgb(${ca.map((c, k) => Math.round(mix(c, cb[k]))).join(',')})`);
    glowEl.style.setProperty('--glow-x', mix(Number(a.glowX) || 80, Number(b.glowX) || Number(a.glowX) || 80).toFixed(1) + '%');
    glowEl.style.setProperty('--glow-y', mix(Number(a.glowY) || 40, Number(b.glowY) || Number(a.glowY) || 40).toFixed(1) + '%');
    thumb.style.setProperty('--thumb-glow', `rgb(${ca.map((c, k) => Math.round(mix(c, cb[k]))).join(',')})`);

    const dark = (t < 0.5 ? a : b).theme === 'dark';
    if ((root.dataset.heroTheme === 'dark') !== dark) {
      root.dataset.heroTheme = dark ? 'dark' : 'light';
      if (dark) nav.setAttribute('data-hero-dark', ''); else nav.removeAttribute('data-hero-dark');
    }
    if (logoSun) {
      const ang = orbit(s);
      logoSun.style.transform = `translate(${(Math.cos(ang) * 8.2).toFixed(2)}px, ${(Math.sin(ang) * 8.2).toFixed(2)}px)`;
      logoSun.style.opacity = dark ? '0.4' : '1';
    }
    const idx = Math.round(f);
    range.setAttribute('aria-valuetext', `${scenes[idx].name} ${clock(time)}`);
    if (idx !== current) setScene(idx);
  }

  function goTo(idx, duration = 1000) {
    const from = s;
    const to = N > 1 ? idx / (N - 1) : 0;
    return tw.run('slide', still ? 0 : duration, (e) => apply(from + (to - from) * e));
  }
  const nearest = () => Math.round(s * (N - 1));

  function stopPlay() {
    playing = false;
    clearTimers();
    playBtn.classList.remove('is-playing');
    playUse.setAttribute('href', '#i-play');
    playBtn.setAttribute('aria-label', '播放一天的光线变化');
  }

  /** 从当前时刻走到最后一个场景，再回到第一个。auto: 页面加载后的首次自动演示。 */
  async function play(auto = false) {
    if (playing) { touched = true; stopPlay(); tw.cancel('slide'); return; }
    playing = true;
    playBtn.classList.add('is-playing');
    playUse.setAttribute('href', '#i-pause');
    playBtn.setAttribute('aria-label', '暂停播放');
    const dur = still ? 0 : 2600;
    if (auto) { await wait(500); if (!playing) return; }
    for (let i = nearest(); i < N - 1; i++) {
      await goTo(i + 1, dur);
      if (!playing) return;
      await wait(1700);
      if (!playing) return;
    }
    await goTo(0, still ? 0 : 2000);
    stopPlay();
  }

  const touch = () => { touched = true; if (playing) { stopPlay(); tw.cancel('slide'); } };

  range.addEventListener('pointerdown', touch);
  range.addEventListener('keydown', (e) => { if (e.key.startsWith('Arrow') || ['Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) touch(); });
  range.addEventListener('input', () => { tw.cancel('slide'); apply(range.value / 1000); });
  range.addEventListener('change', () => goTo(nearest(), 360));
  stops.forEach((b) => b.addEventListener('click', () => { touch(); goTo(Number(b.dataset.stop), 1100); }));
  playBtn.addEventListener('click', () => play(false));

  whenInView(root, (vis) => {
    inView = vis;
    if (!vis && playing) { stopPlay(); tw.cancel('slide'); goTo(nearest(), 400); }
  });
  onScrollResize(() => {
    const p = clamp(scrollY / Math.max(1, root.offsetHeight * 0.9));
    root.style.setProperty('--hero-p', p.toFixed(4));
  });

  apply(0);
  setScene(0);

  return {
    /** 页面稳定后调用一次：访客还没操作时，自动演示一遍一天的变化。 */
    startAutoDemo() {
      if (autoStarted || still || N < 2) return;
      autoStarted = true;
      timers.push(setTimeout(() => { if (!touched && inView && !document.hidden) play(true); }, 3200));
    },
  };
}
