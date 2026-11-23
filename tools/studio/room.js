/* Luma Home — 首屏实时房间（Three.js）。
   一个现代客厅：右侧落地窗、布艺沙发、悬浮搁架，以及五件 Luma 产品。
   光照状态由 scenes.js 采样而来，在「清晨 / 工作 / 晚餐 / 夜间」之间连续过渡。 */
import * as THREE from './vendor-three/three.module.min.js';
import { createRenderer, makeEnvironment, buildProduct, roundedBox, glowTexture, noiseTexture, manager, whenLoaded } from './models.js';
import { kelvinToRGB, hex, rgba, sample } from './scenes.js';

const texUrl = (name) => new URL('./tex/' + name, import.meta.url).href;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const WIN = { x: 3.19, z0: -2.47, z1: 0.87, y0: 0.1, y1: 2.76 };
/* 太阳 / 月亮在天空背景图上的位置（清晨、工作、晚餐、夜间） */
const SUN_SPOT = [[0.36, 0.672], [0.5, 0.575], [0.65, 0.688], [0.57, 0.565]];
const VIEW = {
  wide: { pos: [-1.3, 1.3, 4.05], target: [0.6, 1.0, -1.25], fov: 40 },
  tall: { pos: [-0.3, 1.45, 5.9], target: [1.0, 1.05, -0.9], fov: 50 },
};

const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const srgb = (color, rgb) => color.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);

function roundedRectShape(w, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* ---------- 天空背景图 ---------- */
function drawSky(sp, spot) {
  const W = 1536;
  const H = 768;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const top = H * 0.5;
  const horizon = H * 0.715;
  g.fillStyle = hex(sp.skyTop);
  g.fillRect(0, 0, W, top + 2);
  const grad = g.createLinearGradient(0, top, 0, horizon);
  grad.addColorStop(0, hex(sp.skyTop));
  grad.addColorStop(0.62, hex(mix(sp.skyTop, sp.skyMid, 0.6)));
  grad.addColorStop(1, hex(sp.skyMid));
  g.fillStyle = grad;
  g.fillRect(0, top, W, horizon - top + 2);
  const hz = g.createLinearGradient(0, horizon - H * 0.09, 0, horizon + 2);
  hz.addColorStop(0, rgba(sp.skyBot, 0));
  hz.addColorStop(1, rgba(sp.skyBot, 0.95));
  g.fillStyle = hz;
  g.fillRect(0, horizon - H * 0.09, W, H * 0.09 + 4);

  const sx = spot[0] * W;
  const sy = spot[1] * H;
  const rg = g.createRadialGradient(sx, sy, 0, sx, sy, W * 0.3);
  rg.addColorStop(0, rgba([1, 0.96, 0.88], 0.95 * sp.sunGlow));
  rg.addColorStop(0.12, rgba(sp.skyBot, 0.72 * sp.sunGlow));
  rg.addColorStop(0.5, rgba(sp.skyMid, 0.24 * sp.sunGlow));
  rg.addColorStop(1, rgba(sp.skyMid, 0));
  g.fillStyle = rg;
  g.fillRect(0, 0, W, horizon + 2);

  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  if (sp.stars > 0.01) {
    for (let i = 0; i < 420; i++) {
      const a = sp.stars * (0.25 + rnd() * 0.75);
      g.fillStyle = `rgba(255,250,240,${a.toFixed(3)})`;
      const r = rnd() < 0.08 ? 1.5 : 0.8;
      g.fillRect(rnd() * W, rnd() * horizon * 0.96, r, r);
    }
  }
  if (sp.moon > 0.01) {
    const mx = 0.6 * W;
    const my = 0.575 * H;
    const mg = g.createRadialGradient(mx, my, 0, mx, my, 70);
    mg.addColorStop(0, `rgba(255,248,230,${0.5 * sp.moon})`);
    mg.addColorStop(1, 'rgba(255,248,230,0)');
    g.fillStyle = mg;
    g.fillRect(mx - 70, my - 70, 140, 140);
    g.fillStyle = `rgba(255,251,240,${sp.moon})`;
    g.beginPath(); g.arc(mx, my, 15, 0, Math.PI * 2); g.fill();
  }

  // 薄云：被日光染色
  if (sp.sunGlow > 0.3 && sp.stars < 0.5) {
    g.save();
    g.filter = 'blur(9px)';
    for (let i = 0; i < 10; i++) {
      const cw = W * (0.05 + rnd() * 0.12);
      g.fillStyle = rgba(mix(sp.skyMid, [1, 1, 1], 0.35), 0.22 + rnd() * 0.26);
      g.beginPath();
      g.ellipse(rnd() * W, horizon - H * (0.03 + rnd() * 0.2), cw, H * (0.006 + rnd() * 0.012), 0, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }
  // 两层树线：远处带雾，近处更深
  const darkTree = [0.05, 0.07, 0.05];
  const treeline = (color, amp, lift, blur, k1, k2, ph) => {
    g.save();
    g.filter = `blur(${blur}px)`;
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, H);
    for (let i = 0; i <= 240; i++) {
      const t = (i / 240) * Math.PI * 2;
      const y = horizon - lift - amp * (0.55 * Math.abs(Math.sin(t * k1 + ph)) + 0.3 * Math.sin(t * k2) * Math.sin(t * k2 + 0.7) + 0.15 * Math.sin(t * 53 + ph * 3));
      g.lineTo((i / 240) * W, y);
    }
    g.lineTo(W, H);
    g.closePath();
    g.fill();
    g.restore();
  };
  treeline(hex(mix(sp.skyMid, darkTree, 0.46)), 15, 24, 8, 9, 23, 0.4);
  treeline(hex(mix(sp.skyBot, darkTree, 0.84 - 0.12 * sp.stars)), 32, 2, 3, 5, 17, 1.9);
  g.fillStyle = hex(mix(sp.skyBot, [0.04, 0.05, 0.04], 0.9));
  g.fillRect(0, horizon + 30, W, H);
  if (sp.stars > 0.01) {
    seed = 5;
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(255,196,120,${(0.35 + rnd() * 0.5).toFixed(3)})`;
      g.fillRect(rnd() * W, horizon - 4 + rnd() * 24, 2.2, 1.6);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ---------- 体积光：从窗口射向地面的棱柱 ---------- */
const SHAFT_VERT = `
attribute float aEnd; attribute float aSide; attribute float aFace;
varying float vEnd; varying float vSide; varying float vFace; varying vec3 vN; varying vec3 vWp;
void main() {
  vEnd = aEnd; vSide = aSide; vFace = aFace;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWp = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const SHAFT_FRAG = `
uniform vec3 uColor; uniform float uIntensity; uniform float uTime; uniform sampler2D uNoise;
varying float vEnd; varying float vSide; varying float vFace; varying vec3 vN; varying vec3 vWp;
void main() {
  float fade = pow(1.0 - vEnd, 1.7);
  float edge = smoothstep(0.0, 0.2, vSide) * smoothstep(1.0, 0.8, vSide);
  float facing = abs(dot(normalize(vN), normalize(cameraPosition - vWp)));
  float n = texture2D(uNoise, vec2(vWp.z * 0.22 + uTime * 0.012, vWp.y * 0.3 - uTime * 0.02)).r;
  float a = uIntensity * fade * edge * vFace * (0.45 + 0.55 * n) * (0.3 + 0.7 * facing);
  gl_FragColor = vec4(uColor, a);
}`;

export function createRoom(canvas, opts = {}) {
  const low = !!opts.low;
  const manual = !!opts.manual; // manual: 不启动渲染循环，由 still() 按需渲染单帧（生成占位图）
  const renderer = createRenderer(canvas, { alpha: false, dprCap: low ? 1.5 : 2 });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 90);
  scene.environment = makeEnvironment(renderer, 'room');

  /* ---------- 纹理与材质 ---------- */
  const tl = new THREE.TextureLoader(manager);
  const T = (name, isColor, rx = 1, ry = 1) => {
    const t = tl.load(texUrl(name));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = low ? 4 : 8;
    if (isColor) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const wood = T('floor_wood_a.webp', true, 3.2, 6.2);
  const woodShelf = T('floor_wood_a.webp', true, 1.1, 0.14);
  const M = {
    floor: new THREE.MeshStandardMaterial({ map: wood, roughnessMap: T('floor_wood_r.webp', false, 3.2, 6.2), roughness: 1, normalMap: T('floor_wood_n.webp', false, 3.2, 6.2), normalScale: new THREE.Vector2(0.3, 0.3), envMapIntensity: 0.45 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xefe9df, roughness: 0.95, normalMap: T('plaster_n.webp', false, 3, 1.5), normalScale: new THREE.Vector2(0.14, 0.14) }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xf5f1ea, roughness: 1 }),
    skirt: new THREE.MeshStandardMaterial({ color: 0xe3dccf, roughness: 0.8 }),
    oak: new THREE.MeshStandardMaterial({ map: woodShelf, color: 0xe2cfae, roughness: 0.6 }),
    walnut: new THREE.MeshStandardMaterial({ map: woodShelf, color: 0x7b5a3d, roughness: 0.5 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0xe4d8c2, roughness: 0.96, normalMap: T('boucle_n.webp'), normalScale: new THREE.Vector2(0.9, 0.9) }),
    pillowA: new THREE.MeshStandardMaterial({ color: 0xc9866a, roughness: 0.95, normalMap: T('boucle_n.webp'), normalScale: new THREE.Vector2(0.7, 0.7) }),
    pillowB: new THREE.MeshStandardMaterial({ color: 0xb3a68d, roughness: 0.95, normalMap: T('boucle_n.webp'), normalScale: new THREE.Vector2(0.7, 0.7) }),
    throw_: new THREE.MeshStandardMaterial({ color: 0xd9cdb8, roughness: 1, normalMap: T('boucle_n.webp'), normalScale: new THREE.Vector2(1.2, 1.2) }),
    rug: new THREE.MeshStandardMaterial({ map: T('rug_a.webp', true, 1.5, 1.1), normalMap: T('rug_n.webp', false, 7, 5), normalScale: new THREE.Vector2(0.8, 0.8), roughness: 1 }),
    travertine: new THREE.MeshStandardMaterial({ map: T('travertine_a.webp'), roughnessMap: T('travertine_r.webp'), roughness: 1 }),
    plaster: new THREE.MeshStandardMaterial({ color: 0xe6dfd2, roughness: 0.9 }),
    terra: new THREE.MeshStandardMaterial({ color: 0xb5674a, roughness: 0.75 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf1ebdf, roughness: 0.55 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x2f2c29, metalness: 0.5, roughness: 0.45 }),
    plinth: new THREE.MeshStandardMaterial({ color: 0x3b3128, roughness: 0.8 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x2b2119, roughness: 1 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xcfc8bc, roughness: 0.8 }),
    stem: new THREE.MeshStandardMaterial({ color: 0x4a4630, roughness: 0.8 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3f6b45, roughness: 0.5, side: THREE.DoubleSide }),
    stone: new THREE.MeshStandardMaterial({ color: 0xbdb5a8, roughness: 0.92 }),
    hedge: new THREE.MeshStandardMaterial({ color: 0x4f7148, roughness: 1, flatShading: true }),
    hedge2: new THREE.MeshStandardMaterial({ color: 0x5c7d50, roughness: 1, flatShading: true }),
    leafBall: new THREE.MeshStandardMaterial({ color: 0x5a7d4f, roughness: 0.9, flatShading: true }),
  };
  const pages = new THREE.MeshStandardMaterial({ color: 0xf4eee2, roughness: 0.9 });
  const bookMats = [0xc9866a, 0x8d8a7f, 0xe3dccb, 0x3e4a52, 0xb59a6e, 0xd9cbb4].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));

  const add = (geo, mat, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(o.x || 0, o.y || 0, o.z || 0);
    m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    (o.parent || scene).add(m);
    return m;
  };
  const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

  /* ---------- 房间外壳 ---------- */
  add(new THREE.BoxGeometry(6.72, 0.1, 13), M.floor, { y: -0.05, z: 3.5, cast: false });
  add(new THREE.BoxGeometry(6.72, 0.1, 13), M.ceiling, { y: 2.95, z: 3.5 });
  add(new THREE.BoxGeometry(6.72, 3, 0.16), M.wall, { y: 1.5, z: -2.88 });
  add(new THREE.BoxGeometry(0.16, 3, 13), M.wall, { x: -3.28, y: 1.5, z: 3.5 });
  // 右墙：窗洞四周
  add(new THREE.BoxGeometry(0.16, 3, 0.46), M.wall, { x: 3.28, y: 1.5, z: -2.73 });
  add(new THREE.BoxGeometry(0.16, 3, 2.66), M.wall, { x: 3.28, y: 1.5, z: 2.23 });
  add(new THREE.BoxGeometry(0.16, 0.1, 3.34), M.wall, { x: 3.28, y: 0.05, z: -0.8 });
  add(new THREE.BoxGeometry(0.16, 0.14, 3.34), M.wall, { x: 3.28, y: 2.83, z: -0.8 });
  // 踢脚线
  add(new THREE.BoxGeometry(6.4, 0.07, 0.016), M.skirt, { y: 0.035, z: -2.792, cast: false });
  add(new THREE.BoxGeometry(0.016, 0.07, 12.84), M.skirt, { x: -3.192, y: 0.035, z: 3.5, cast: false });
  // 窗框
  add(new THREE.BoxGeometry(0.08, 0.05, 3.42), M.darkMetal, { x: 3.2, y: 2.735, z: -0.8 });
  add(new THREE.BoxGeometry(0.08, 0.05, 3.42), M.darkMetal, { x: 3.2, y: 0.125, z: -0.8 });
  add(new THREE.BoxGeometry(0.08, 2.66, 0.05), M.darkMetal, { x: 3.2, y: 1.43, z: -2.445 });
  add(new THREE.BoxGeometry(0.08, 2.66, 0.05), M.darkMetal, { x: 3.2, y: 1.43, z: 0.845 });
  add(new THREE.BoxGeometry(0.06, 2.62, 0.034), M.darkMetal, { x: 3.2, y: 1.43, z: -1.362 });
  add(new THREE.BoxGeometry(0.06, 2.62, 0.034), M.darkMetal, { x: 3.2, y: 1.43, z: -0.238 });
  add(new THREE.BoxGeometry(0.06, 0.034, 3.3), M.darkMetal, { x: 3.2, y: 2.18, z: -0.8 });

  /* ---------- 窗外 ---------- */
  const paverC = document.createElement('canvas');
  paverC.width = paverC.height = 256;
  const pg = paverC.getContext('2d');
  pg.fillStyle = '#cfc8bb'; pg.fillRect(0, 0, 256, 256);
  pg.fillStyle = 'rgba(90,80,66,.34)';
  pg.fillRect(0, 0, 256, 3); pg.fillRect(0, 0, 3, 256);
  const paverTex = new THREE.CanvasTexture(paverC);
  paverTex.wrapS = paverTex.wrapT = THREE.RepeatWrapping;
  paverTex.repeat.set(6, 14);
  paverTex.colorSpace = THREE.SRGBColorSpace;
  M.stone.map = paverTex;
  M.stone.color.setHex(0xffffff);
  M.stone.needsUpdate = true;
  add(new THREE.PlaneGeometry(8, 20), M.stone, { x: 7.2, y: -0.01, z: -2, rx: -Math.PI / 2, cast: false, receive: false });
  const hedgeGeos = [new THREE.IcosahedronGeometry(0.82, 1), new THREE.IcosahedronGeometry(0.7, 1)];
  let hs = 3;
  const hrnd = () => ((hs = (hs * 16807) % 2147483647) / 2147483647);
  for (let z = -12; z < 10; z += 0.78) {
    const g = hedgeGeos[Math.floor(hrnd() * 2)];
    const b = add(g, hrnd() > 0.5 ? M.hedge : M.hedge2, { x: 11.4 + (hrnd() - 0.5) * 0.4, y: 0.42 + hrnd() * 0.12, z: z + hrnd() * 0.2, receive: false, cast: false });
    b.scale.set(1, 0.62 + hrnd() * 0.16, 1.05);
    b.rotation.set(hrnd() * 3, hrnd() * 3, 0);
  }
  add(new THREE.CylinderGeometry(0.07, 0.11, 2.2, 10), M.stem, { x: 7.4, y: 1.1, z: -4.6 });
  [[0, 2.9, 0, 1.05], [-0.7, 2.5, 0.3, 0.8], [0.75, 2.45, -0.25, 0.85], [0.15, 2.3, 0.8, 0.7], [-0.2, 3.5, -0.2, 0.7]].forEach(([x, y, z, r]) => {
    const leafBall = add(new THREE.SphereGeometry(r, 24, 16), M.leafBall, { x: 7.4 + x, y, z: -4.6 + z, receive: false });
    leafBall.rotation.set(x, y, z);
  });
  const skyTex = SUN_SPOT.map((spot, i) => drawSky(sample(i / 3), spot));
  const skyMatA = new THREE.MeshBasicMaterial({ toneMapped: false });
  const skyMatB = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const skyA = add(new THREE.PlaneGeometry(26, 22), skyMatA, { x: 14, y: 6, z: -9, ry: -Math.PI / 2, cast: false, receive: false });
  const skyB = add(new THREE.PlaneGeometry(26, 22), skyMatB, { x: 13.99, y: 6, z: -9, ry: -Math.PI / 2, cast: false, receive: false });
  skyA.material.map = skyTex[0];

  /* ---------- 家具 ---------- */
  const blob = (w, d, x, z, y = 0.004, o = 0.3) => {
    const m = add(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0x2a1f16, transparent: true, opacity: o, depthWrite: false }), { x, y, z, rx: -Math.PI / 2, cast: false, receive: false });
    m.renderOrder = 1;
  };

  const rug = add(new THREE.ShapeGeometry(roundedRectShape(3.3, 2.3, 0.08), 16), M.rug, { x: 0.9, y: 0.006, z: -0.55, rx: -Math.PI / 2, cast: false });

  blob(2.9, 1.3, 1.05, -1.98);
  const sofa = new THREE.Group();
  sofa.position.set(1.05, 0, -1.98);
  scene.add(sofa);
  add(new THREE.BoxGeometry(2.14, 0.12, 0.74), M.plinth, { y: 0.06, parent: sofa });
  add(roundedBox(2.3, 0.22, 0.94, 0.05, 6, 3), M.fabric, { y: 0.23, parent: sofa });
  add(roundedBox(2.3, 0.56, 0.22, 0.07, 6, 3), M.fabric, { y: 0.6, z: -0.35, parent: sofa });
  add(roundedBox(0.22, 0.56, 0.94, 0.07, 6, 3), M.fabric, { x: -1.24, y: 0.48, parent: sofa });
  add(roundedBox(0.22, 0.56, 0.94, 0.07, 6, 3), M.fabric, { x: 1.24, y: 0.48, parent: sofa });
  for (const x of [-0.75, 0, 0.75]) {
    add(roundedBox(0.75, 0.2, 0.72, 0.06, 6, 3), M.fabric, { x, y: 0.43, z: 0.07, parent: sofa });
    add(roundedBox(0.74, 0.46, 0.2, 0.07, 6, 3), M.fabric, { x, y: 0.73, z: -0.16, rx: -0.14, parent: sofa });
  }
  add(roundedBox(0.46, 0.46, 0.14, 0.07, 6, 3), M.pillowA, { x: -0.92, y: 0.62, z: 0.03, rx: -0.2, ry: 0.35, rz: 0.18, parent: sofa });
  add(roundedBox(0.44, 0.44, 0.14, 0.07, 6, 3), M.pillowB, { x: 0.95, y: 0.61, z: 0.05, rx: -0.15, ry: -0.3, rz: -0.22, parent: sofa });

  blob(1.0, 1.0, 1.05, -0.55, 0.013, 0.22);
  add(new THREE.CylinderGeometry(0.2, 0.23, 0.323, 48), M.plaster, { x: 1.05, y: 0.1615, z: -0.55 });
  add(new THREE.CylinderGeometry(0.46, 0.46, 0.034, 72), M.travertine, { x: 1.05, y: 0.34, z: -0.55 });
  add(lathe([[0, 0], [0.045, 0], [0.062, 0.03], [0.068, 0.09], [0.05, 0.16], [0.028, 0.19], [0.03, 0.215], [0.034, 0.222]], 48), M.terra, { x: 0.86, y: 0.357, z: -0.76 });
  add(roundedBox(0.2, 0.022, 0.15, 0.004, 2), bookMats[3], { x: 1.22, y: 0.368, z: -0.36, ry: 0.2 });
  add(roundedBox(0.17, 0.018, 0.13, 0.004, 2), bookMats[2], { x: 1.23, y: 0.388, z: -0.37, ry: -0.12 });


  // 悬浮搁架 + 潮汐灯带
  add(new THREE.BoxGeometry(2.2, 0.04, 0.26), M.oak, { x: 0.85, y: 1.62, z: -2.66 });
  const stripMat = new THREE.MeshStandardMaterial({ color: 0xfff3e2, emissive: 0xffcf9a, emissiveIntensity: 0, roughness: 0.5 });
  add(new THREE.BoxGeometry(2.16, 0.006, 0.014), stripMat, { x: 0.85, y: 1.597, z: -2.56, cast: false });
  const washC = document.createElement('canvas');
  washC.width = 8; washC.height = 128;
  const wg = washC.getContext('2d');
  const wgrad = wg.createLinearGradient(0, 0, 0, 128);
  wgrad.addColorStop(0, 'rgba(255,255,255,.95)'); wgrad.addColorStop(0.45, 'rgba(255,255,255,.32)'); wgrad.addColorStop(1, 'rgba(255,255,255,0)');
  wg.fillStyle = wgrad; wg.fillRect(0, 0, 8, 128);
  const washTex = new THREE.CanvasTexture(washC);
  const washMat = new THREE.MeshBasicMaterial({ map: washTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const wash = add(new THREE.PlaneGeometry(2.34, 0.66), washMat, { x: 0.85, y: 1.27, z: -2.794, cast: false, receive: false });
  wash.renderOrder = 5;
  let bx = -0.42;
  [0.04, 0.034, 0.046, 0.03, 0.04].forEach((w, i) => {
    const h = 0.22 + (i % 3) * 0.025;
    add(new THREE.BoxGeometry(w, h, 0.17), bookMats[i], { x: 0.85 + bx, y: 1.64 + h / 2, z: -2.67, ry: (i === 4 ? 0.16 : 0) });
    bx += w + 0.004;
  });
  add(new THREE.BoxGeometry(0.17, 0.02, 0.13), bookMats[5], { x: 1.66, y: 1.65, z: -2.67, ry: -0.25 });
  add(new THREE.BoxGeometry(0.15, 0.018, 0.12), pages, { x: 1.66, y: 1.669, z: -2.67, ry: -0.12 });
  add(lathe([[0, 0], [0.04, 0], [0.055, 0.03], [0.045, 0.09], [0.025, 0.12], [0.026, 0.14]], 40), M.cream, { x: 1.44, y: 1.64, z: -2.68 });

  // 植物
  const plant = new THREE.Group();
  plant.position.set(2.84, 0, -2.44);
  scene.add(plant);
  add(lathe([[0, 0], [0.13, 0], [0.15, 0.02], [0.17, 0.3], [0.165, 0.34], [0.15, 0.35]], 40), M.pot, { parent: plant });
  add(new THREE.CylinderGeometry(0.148, 0.148, 0.01, 32), M.soil, { y: 0.335, parent: plant, cast: false });
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.19, 0.03, 0.2, 0.24, 0, 0.36);
  leafShape.bezierCurveTo(-0.2, 0.24, -0.19, 0.03, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 10);
  const lp = leafGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) lp.setZ(i, -Math.abs(lp.getX(i)) * 0.4 - lp.getY(i) * lp.getY(i) * 0.5);
  leafGeo.computeVertexNormals();
  const stemSeeds = [[0.5, 0.2, 1.5], [2.6, 0.3, 1.25], [4.2, 0.12, 1.7], [1.4, 0.36, 1.1], [3.4, 0.42, 1.3], [5.5, 0.26, 1.05]];
  for (const [az, spread, h] of stemSeeds) {
    const dx = Math.cos(az) * spread;
    const dz = Math.sin(az) * spread;
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.33, 0), new THREE.Vector3(dx * 0.3, 0.33 + h * 0.45, dz * 0.3), new THREE.Vector3(dx, 0.33 + h, dz)]);
    add(new THREE.TubeGeometry(curve, 10, 0.008, 6), M.stem, { parent: plant, cast: false });
    for (const t of [0.5, 0.74, 0.97]) {
      const p = curve.getPoint(t);
      const pivot = new THREE.Group();
      pivot.position.copy(p);
      pivot.rotation.y = -az + (t - 0.7) * 1.6;
      plant.add(pivot);
      add(leafGeo, M.leaf, { parent: pivot, rx: 1.05 - t * 0.35, ry: 0.0, cast: t > 0.6 });
    }
  }

  /* ---------- Luma 产品 ---------- */
  const floorLamp = buildProduct('halo-floor', 'champagne');
  floorLamp.group.position.set(2.74, 0, -1.05);
  floorLamp.group.scale.x = -1;
  scene.add(floorLamp.group);
  blob(0.55, 0.55, 2.74, -1.05, 0.004, 0.26);

  const orb = buildProduct('halo-orb', 'silver');
  orb.group.position.set(1.22, 0.357, -0.78);
  scene.add(orb.group);

  const sense = buildProduct('luma-sense', 'pearl');
  sense.group.position.set(1.16, 1.64, -2.68);
  scene.add(sense.group);

  const panelMat = new THREE.MeshStandardMaterial({ color: 0xf5f1ea, emissive: 0xffcf9a, emissiveIntensity: 0, roughness: 0.95 });
  add(roundedBox(0.64, 0.014, 0.64, 0.006, 3), M.ceiling, { x: 0.9, y: 2.893, z: -1.5, cast: false });
  add(new THREE.PlaneGeometry(0.6, 0.6), panelMat, { x: 0.9, y: 2.885, z: -1.5, rx: Math.PI / 2, cast: false, receive: false });
  const panelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffcf9a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  panelSprite.position.set(0.9, 2.87, -1.5);
  panelSprite.scale.set(1.7, 1.7, 1);
  scene.add(panelSprite);

  // 流光纱帘：从窗顶垂下
  const shadeH = WIN.y1 - WIN.y0 - 0.03;
  const shadeGroup = new THREE.Group();
  shadeGroup.position.set(3.09, WIN.y1 - 0.015, (WIN.z0 + WIN.z1) / 2);
  shadeGroup.rotation.y = -Math.PI / 2;
  scene.add(shadeGroup);
  const shadeGeo = new THREE.PlaneGeometry(WIN.z1 - WIN.z0 - 0.04, shadeH, 90, 1);
  shadeGeo.translate(0, -shadeH / 2, 0);
  const sp = shadeGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) sp.setZ(i, Math.sin((sp.getX(i) / 3.3 + 0.5) * Math.PI * 2 * 13) * 0.022);
  shadeGeo.computeVertexNormals();
  const cloth = add(shadeGeo, new THREE.MeshStandardMaterial({ color: 0xf8f3ea, roughness: 0.88, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }), { parent: shadeGroup, cast: false, receive: false });
  cloth.renderOrder = 3;
  const bar = add(roundedBox(WIN.z1 - WIN.z0 - 0.06, 0.03, 0.05, 0.01, 2), M.darkMetal, { parent: shadeGroup, cast: false });

  /* ---------- 灯光 ---------- */
  const sun = new THREE.DirectionalLight(0xffffff, 5);
  sun.castShadow = true;
  const sm = manual ? 4096 : low ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  sun.target.position.set(0, 0.6, -0.6);
  scene.add(sun, sun.target);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(6, 2.2, -0.2);
  fill.target.position.set(-3, 1, -0.8);
  scene.add(fill, fill.target);

  const headPos = new THREE.Vector3();
  floorLamp.head.getWorldPosition(headPos);
  const spot = new THREE.SpotLight(0xffcf9a, 0, 7, 1.2, 0.9, 2);
  spot.castShadow = manual || !low;
  spot.shadow.mapSize.set(manual ? 2048 : 1024, manual ? 2048 : 1024);
  spot.shadow.bias = -0.0006;
  spot.shadow.normalBias = 0.02;
  spot.shadow.camera.near = 0.25;
  spot.shadow.camera.far = 7;
  spot.position.copy(headPos).add(new THREE.Vector3(0, -0.06, 0));
  spot.target.position.set(1.5, 0.1, -1.6);
  scene.add(spot, spot.target);
  const floorPoint = new THREE.PointLight(0xffcf9a, 0, 6, 2);
  floorPoint.position.copy(headPos).add(new THREE.Vector3(0, -0.16, 0));
  scene.add(floorPoint);
  const orbPoint = new THREE.PointLight(0xffcf9a, 0, 5, 2);
  orbPoint.position.set(1.22, 0.52, -0.78);
  scene.add(orbPoint);
  const panelPoint = new THREE.PointLight(0xffcf9a, 0, 9, 2);
  panelPoint.position.set(0.9, 2.74, -1.5);
  scene.add(panelPoint);
  const stripA = new THREE.PointLight(0xffcf9a, 0, 2.8, 2);
  stripA.position.set(0.1, 1.5, -2.66);
  const stripB = new THREE.PointLight(0xffcf9a, 0, 2.8, 2);
  stripB.position.set(1.6, 1.5, -2.66);
  scene.add(stripA, stripB);

  /* ---------- 体积光与浮尘 ---------- */
  const FACES = 5;
  const shaftGeo = new THREE.BufferGeometry();
  const shaftPos = new Float32Array(FACES * 6 * 3);
  const shaftN = new Float32Array(FACES * 6 * 3);
  const shaftEnd = new Float32Array(FACES * 6);
  const shaftSide = new Float32Array(FACES * 6);
  const shaftFace = new Float32Array(FACES * 6);
  for (let f = 0; f < FACES; f++) {
    const e = [0, 0, 1, 0, 1, 1];
    const s = [0, 1, 1, 0, 1, 0];
    for (let k = 0; k < 6; k++) {
      shaftEnd[f * 6 + k] = e[k];
      shaftSide[f * 6 + k] = s[k];
      shaftFace[f * 6 + k] = f < 3 ? 1 : 0.55;
    }
  }
  shaftGeo.setAttribute('position', new THREE.BufferAttribute(shaftPos, 3).setUsage(THREE.DynamicDrawUsage));
  shaftGeo.setAttribute('normal', new THREE.BufferAttribute(shaftN, 3).setUsage(THREE.DynamicDrawUsage));
  shaftGeo.setAttribute('aEnd', new THREE.BufferAttribute(shaftEnd, 1));
  shaftGeo.setAttribute('aSide', new THREE.BufferAttribute(shaftSide, 1));
  shaftGeo.setAttribute('aFace', new THREE.BufferAttribute(shaftFace, 1));
  const shaftMat = new THREE.ShaderMaterial({
    vertexShader: SHAFT_VERT, fragmentShader: SHAFT_FRAG,
    uniforms: { uColor: { value: new THREE.Color(1, 0.8, 0.6) }, uIntensity: { value: 0 }, uTime: { value: 0 }, uNoise: { value: noiseTexture() } },
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.frustumCulled = false;
  shaft.renderOrder = 6;
  scene.add(shaft);

  const rayDir = new THREE.Vector3();
  const _a = new THREE.Vector3();
  const _b = new THREE.Vector3();
  const _n = new THREE.Vector3();
  const endOf = (p, out) => {
    const len = rayDir.y < -0.015 ? Math.min(7.5, p.y / -rayDir.y) : 7.5;
    return out.copy(p).addScaledVector(rayDir, len);
  };
  const P = (y, z) => new THREE.Vector3(WIN.x, y, z);
  const quads = [];
  const T1 = P(WIN.y1, WIN.z0), T2 = P(WIN.y1, WIN.z1), B1 = P(WIN.y0, WIN.z0), B2 = P(WIN.y0, WIN.z1);
  const V = () => new THREE.Vector3();
  quads.push([T1, T2, V(), V()], [T1, B1, V(), V()], [T2, B2, V(), V()]);
  for (const f of [1 / 3, 2 / 3]) quads.push([T1.clone().lerp(T2, f), B1.clone().lerp(B2, f), V(), V()]);

  function updateShaft() {
    rayDir.set(...cur.sunDir).normalize().negate();
    let o = 0;
    for (const [a, b, eb, ea] of quads) {
      endOf(b, eb);
      endOf(a, ea);
      for (const v of [a, b, eb, a, eb, ea]) { shaftPos[o * 3] = v.x; shaftPos[o * 3 + 1] = v.y; shaftPos[o * 3 + 2] = v.z; o++; }
    }
    shaftGeo.attributes.position.needsUpdate = true;
    for (let f = 0; f < FACES; f++) {
      const i = f * 18;
      _n.set(shaftPos[i] - shaftPos[i + 3], shaftPos[i + 1] - shaftPos[i + 4], shaftPos[i + 2] - shaftPos[i + 5]);
      _b.set(shaftPos[i + 6] - shaftPos[i + 3], shaftPos[i + 7] - shaftPos[i + 4], shaftPos[i + 8] - shaftPos[i + 5]);
      _n.cross(_b).normalize();
      for (let k = 0; k < 6; k++) { shaftN[i + k * 3] = _n.x; shaftN[i + k * 3 + 1] = _n.y; shaftN[i + k * 3 + 2] = _n.z; }
    }
    shaftGeo.attributes.normal.needsUpdate = true;
  }

  const DUST_N = low ? 140 : 260;
  const dustSeeds = Array.from({ length: DUST_N }, () => [Math.random(), Math.random(), Math.random(), Math.random()]);
  const dustPos = new Float32Array(DUST_N * 3);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3).setUsage(THREE.DynamicDrawUsage));
  const dustMat = new THREE.PointsMaterial({ size: 0.013, map: glowTexture(), color: 0xffe4c2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  dust.renderOrder = 7;
  scene.add(dust);

  function updateDust(time) {
    for (let i = 0; i < DUST_N; i++) {
      const [u, v, w0, ph] = dustSeeds[i];
      const w = (w0 + time * 0.012) % 1;
      const sway = Math.sin(time * 0.4 + ph * 6.28) * 0.05;
      const z = WIN.z0 + u * (WIN.z1 - WIN.z0);
      const y = WIN.y0 + v * (WIN.y1 - WIN.y0);
      _a.set(WIN.x, y, z);
      _b.copy(_a);
      endOf(_a, _b);
      _a.lerp(_b, w);
      dustPos[i * 3] = _a.x + sway;
      dustPos[i * 3 + 1] = _a.y + sway * 0.6;
      dustPos[i * 3 + 2] = _a.z + sway * 0.5;
    }
    dustGeo.attributes.position.needsUpdate = true;
  }

  /* ---------- 状态：目标值 → 阻尼过渡 → 应用 ---------- */
  const tgt = sample(0);
  const cur = {};
  for (const k in tgt) cur[k] = Array.isArray(tgt[k]) ? tgt[k].slice() : tgt[k];
  const tmpC = new THREE.Color();
  const setLamp = (light, on, k, gain) => { srgb(light.color, kelvinToRGB(k)); light.intensity = on * gain; };

  function apply(c, time) {
    rayDir.set(...c.sunDir).normalize();
    sun.position.copy(rayDir).multiplyScalar(16).add(sun.target.position);
    srgb(sun.color, c.sunColor);
    sun.intensity = c.sunI;
    srgb(hemi.color, c.hemiSky);
    srgb(hemi.groundColor, c.hemiGround);
    hemi.intensity = c.hemiI;
    srgb(fill.color, c.fillColor);
    fill.intensity = c.fillI;
    scene.environmentIntensity = c.envI;
    renderer.toneMappingExposure = c.exposure;

    const f = clamp(c.s) * 3;
    const i = Math.min(2, Math.floor(f));
    const t = f - i;
    skyMatA.map = skyTex[i];
    skyMatB.map = skyTex[i + 1];
    skyMatB.opacity = t;
    skyB.visible = t > 0.004;

    const [fo, fk] = c.lampFloor;
    floorLamp.setGlow(fo, fk);
    setLamp(spot, fo, fk, 24);
    setLamp(floorPoint, fo, fk, 5);
    const [oo, ok] = c.lampOrb;
    orb.setGlow(oo, ok);
    setLamp(orbPoint, oo, ok, 3.4);
    const [po, pk] = c.lampPanel;
    srgb(tmpC, kelvinToRGB(pk));
    panelMat.emissive.copy(tmpC);
    panelMat.emissiveIntensity = po * 3.2;
    panelSprite.material.color.copy(tmpC);
    panelSprite.material.opacity = po * 0.5;
    setLamp(panelPoint, po, pk, 9);
    const [so, sk] = c.lampStrip;
    stripMat.emissive.copy(srgb(tmpC, kelvinToRGB(sk)));
    stripMat.emissiveIntensity = so * 3.4;
    washMat.color.copy(tmpC);
    washMat.opacity = so * 0.5;
    setLamp(stripA, so, sk, 1.6);
    setLamp(stripB, so, sk, 1.6);
    sense.setGlow(c.lampSense, 2700);

    const drop = Math.max(0.012, 1 - c.shade);
    cloth.scale.y = drop;
    bar.position.y = -shadeH * drop;

    updateShaft();
    shaftMat.uniforms.uIntensity.value = c.shaftI * 0.42;
    shaftMat.uniforms.uColor.value.setRGB(c.sunColor[0], c.sunColor[1], c.sunColor[2], THREE.SRGBColorSpace);
    shaftMat.uniforms.uTime.value = time;
    dustMat.opacity = c.dustI * 0.85;
    dust.visible = c.dustI > 0.01;
    if (dust.visible) updateDust(time);
  }

  /* ---------- 相机与尺寸 ---------- */
  const base = { pos: [...VIEW.wide.pos], target: [...VIEW.wide.target], fov: VIEW.wide.fov };
  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = clamp((1.3 - camera.aspect) / 0.7);
    base.pos = lerp3(VIEW.wide.pos, VIEW.tall.pos, t);
    base.target = lerp3(VIEW.wide.target, VIEW.tall.target, t);
    base.fov = VIEW.wide.fov + (VIEW.tall.fov - VIEW.wide.fov) * t;
    dirty = true;
  }
  let dirty = true;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
    dirty = true;
  };
  if (!opts.still && !manual) addEventListener('pointermove', onMove, { passive: true });

  /* ---------- 渲染循环 ---------- */
  let visible = true;
  let raf = 0;
  let last = 0;
  let time = 0;
  let frameNo = 0;
  if (!manual) {
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; dirty = true; });
    io.observe(canvas);
    resize();
  }

  function damp(dt) {
    const k = 1 - Math.exp(-dt * 7);
    let moved = false;
    for (const key in tgt) {
      const a = cur[key];
      const b = tgt[key];
      if (typeof b === 'number') {
        const d = b - a;
        if (Math.abs(d) > 1e-4) { cur[key] = a + d * k; moved = true; } else cur[key] = b;
      } else {
        for (let j = 0; j < b.length; j++) {
          const d = b[j] - a[j];
          if (Math.abs(d) > 1e-4) { a[j] += d * k; moved = true; } else a[j] = b[j];
        }
      }
    }
    return moved;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    time += dt;
    frameNo++;
    const moved = damp(dt);
    const idle = !opts.still && !opts.reduced;
    if (!moved && !dirty && (!idle || frameNo % 2)) return;
    dirty = false;
    apply(cur, time);
    const sway = idle ? Math.sin(time * 0.22) * 0.03 : 0;
    const lift = idle ? Math.sin(time * 0.31 + 1) * 0.012 : 0;
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 3));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 3));
    camera.fov = base.fov;
    camera.position.set(base.pos[0] + pointer.x * 0.14 + sway, base.pos[1] - pointer.y * 0.05 + lift, base.pos[2]);
    camera.lookAt(base.target[0] - pointer.x * 0.08, base.target[1] + pointer.y * 0.04, base.target[2]);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  if (!manual) raf = requestAnimationFrame(frame);

  return {
    ready: whenLoaded(),
    /** 离线渲染一张静态图，返回 WebGL 画布（由调用方合成、导出）。 */
    still(sp, { w = 2400, h = 1350, ss = 1.25, pos, target, fov } = {}) {
      for (const k in sp) cur[k] = Array.isArray(sp[k]) ? sp[k].slice() : sp[k];
      const W = Math.round(w * ss);
      const H = Math.round(h * ss);
      renderer.setPixelRatio(1);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      const t = clamp((1.3 - camera.aspect) / 0.7);
      const p = pos || lerp3(VIEW.wide.pos, VIEW.tall.pos, t);
      const g = target || lerp3(VIEW.wide.target, VIEW.tall.target, t);
      camera.fov = fov || VIEW.wide.fov + (VIEW.tall.fov - VIEW.wide.fov) * t;
      apply(cur, 1.7);
      camera.position.set(p[0], p[1], p[2]);
      camera.lookAt(g[0], g[1], g[2]);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return canvas;
    },
    /** 设置目标光照状态（来自 scenes.sample）。 */
    setTarget(sp) {
      for (const k in sp) {
        if (Array.isArray(sp[k])) { if (Array.isArray(tgt[k])) tgt[k].splice(0, tgt[k].length, ...sp[k]); else tgt[k] = sp[k].slice(); }
        else tgt[k] = sp[k];
      }
      dirty = true;
    },
    /** 立即跳到某个状态（不做过渡）。 */
    jump(sp) {
      for (const k in sp) cur[k] = Array.isArray(sp[k]) ? sp[k].slice() : sp[k];
      this.setTarget(sp);
      apply(cur, time);
    },
    render() { apply(cur, time); renderer.render(scene, camera); },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener('pointermove', onMove);
      scene.environment.dispose();
      renderer.dispose();
    },
  };
}
