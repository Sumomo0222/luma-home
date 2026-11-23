/* Luma Home — 程序化产品模型与渲染舞台（Three.js）。
   所有模型按真实尺寸（米）建模，底面落在 y = 0，供首屏房间、产品卡片和设计特写共用。 */
import * as THREE from './vendor-three/three.module.min.js';
import { FINISHES } from './finishes.js';

const finishById = (id) => FINISHES.find((f) => f.id === id) || FINISHES[0];
const texUrl = (name) => new URL('./tex/' + name, import.meta.url).href;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 色温 → 近似 RGB（Tanner Helland 近似公式）。 */
export function kelvinToRGB(k) {
  const t = k / 100;
  let r;
  let g;
  let b;
  if (t <= 66) {
    r = 255;
    g = 99.47 * Math.log(t) - 161.12;
  } else {
    r = 329.7 * Math.pow(t - 60, -0.1332);
    g = 288.12 * Math.pow(t - 60, -0.0755);
  }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.52 * Math.log(t - 10) - 305.04;
  return [clamp01(r / 255), clamp01(g / 255), clamp01(b / 255)];
}

/* 所有贴图走同一个加载管理器。whenLoaded() 等到当前排队的贴图全部就绪；
   没有贴图在加载时立即返回，避免空等。 */
export const manager = new THREE.LoadingManager();
manager.onError = (url) => console.warn('[studio] 贴图加载失败', url);
// 这个版本的 LoadingManager 不再暴露加载计数，这里自己记一份
let pendingLoads = 0;
const rawStart = manager.itemStart.bind(manager);
const rawEnd = manager.itemEnd.bind(manager);
manager.itemStart = (url) => { pendingLoads += 1; rawStart(url); };
manager.itemEnd = (url) => { pendingLoads = Math.max(0, pendingLoads - 1); rawEnd(url); };
export function whenLoaded(timeout = 15000) {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      if (pendingLoads === 0 || performance.now() - start > timeout) resolve(pendingLoads === 0);
      else setTimeout(tick, 30);
    };
    tick();
  });
}

const setRGB = (color, rgb) => color.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);

/* ---------- 共享纹理 ---------- */
const cache = {};

export function glowTexture() {
  if (cache.glow) return cache.glow;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.14, 'rgba(255,255,255,.68)');
  r.addColorStop(0.4, 'rgba(255,255,255,.13)');
  r.addColorStop(0.78, 'rgba(255,255,255,0)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  cache.glow = new THREE.CanvasTexture(c);
  cache.glow.colorSpace = THREE.SRGBColorSpace;
  return cache.glow;
}

export function noiseTexture(size = 256) {
  if (cache.noise) return cache.noise;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + rnd() * 165;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.filter = 'blur(3px)';
  g.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  cache.noise = t;
  return t;
}

function loader() {
  return (cache.loader ||= new THREE.TextureLoader(manager));
}

function brushedRough() {
  if (cache.brushed) return cache.brushed;
  const t = loader().load(texUrl('brushed_r.webp'));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  cache.brushed = t;
  return t;
}

function linenMaps() {
  if (cache.linen) return cache.linen;
  const a = loader().load(texUrl('linen_a.webp'));
  const n = loader().load(texUrl('linen_n.webp'));
  for (const t of [a, n]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 5); }
  a.colorSpace = THREE.SRGBColorSpace;
  cache.linen = { a, n };
  return cache.linen;
}

/* ---------- 环境贴图 ---------- */
function equirectTexture(draw) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  draw(c.getContext('2d'), 512, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

function drawStudioEnv(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#f6f3ee');
  sky.addColorStop(0.4, '#d9d3c9');
  sky.addColorStop(0.58, '#948c80');
  sky.addColorStop(1, '#2c2925');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  g.filter = 'blur(14px)';
  g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(w * 0.62, h * 0.2, w * 0.15, h * 0.15, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff7ec';
  g.beginPath(); g.ellipse(w * 0.37, h * 0.3, w * 0.08, h * 0.2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.85)';
  g.fillRect(w * 0.2, h * 0.44, w * 0.12, h * 0.03);
  g.filter = 'none';
}

function drawRoomEnv(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#fbf6ee');
  sky.addColorStop(0.5, '#d9d1c5');
  sky.addColorStop(0.62, '#8f867a');
  sky.addColorStop(1, '#4a4238');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  g.filter = 'blur(10px)';
  g.fillStyle = '#ffffff';
  g.fillRect(w * 0.4, h * 0.2, w * 0.2, h * 0.34);
  g.filter = 'none';
}

/** 生成 PMREM 环境贴图（每个渲染器各一份）。kind: 'studio' | 'room' */
export function makeEnvironment(renderer, kind = 'studio') {
  const src = equirectTexture(kind === 'room' ? drawRoomEnv : drawStudioEnv);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const out = pmrem.fromEquirectangular(src).texture;
  pmrem.dispose();
  src.dispose();
  return out;
}

/* ---------- 渲染器 ---------- */
export function createRenderer(canvas, { alpha = true, dprCap = 2, antialias = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  return renderer;
}

/** 产品展示舞台：一组工作室灯光 + 环境反射 + 接影地面。 */
export class Studio {
  constructor(renderer, env) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.8;
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.01, 20);

    const key = new THREE.DirectionalLight(0xfff3e4, 2.1);
    key.position.set(-2.2, 3.6, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -1.4;
    key.shadow.camera.right = key.shadow.camera.top = 1.4;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.012;
    key.shadow.radius = 6;
    this.scene.add(key, key.target);

    const fill = new THREE.DirectionalLight(0xdde8f6, 0.7);
    fill.position.set(3.4, 1.6, 2.2);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffe4c6, 1.3);
    rim.position.set(1.2, 2.8, -3.6);
    this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 0.28));

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ color: 0x3a2c1e, opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.ground = ground;
    this.scene.add(ground);
    this.lamp = new THREE.PointLight(0xffcf9a, 0, 0, 2);
    this.scene.add(this.lamp);
  }

  /** 把模型渲染到 2D 画布（设备像素尺寸 w × h）。 */
  draw(ctx, model, { w, h, rotY = 0, cam, lit = 0, dpr = 1 }) {
    const r = this.renderer;
    const size = new THREE.Vector2();
    r.getSize(size);
    if (size.x < w || size.y < h) r.setSize(Math.max(size.x, w), Math.max(size.y, h), false);
    r.setScissorTest(true);
    r.setScissor(0, 0, w, h);
    r.setViewport(0, 0, w, h);
    r.setClearColor(0x000000, 0);
    r.clear(true, true, true);

    if (this.current !== model) {
      if (this.current) this.scene.remove(this.current.group);
      this.scene.add(model.group);
      this.current = model;
    }
    model.group.rotation.y = rotY;
    const c = cam || model.cam;
    this.camera.fov = c.fov;
    this.camera.aspect = w / h;
    const dist = c.dist / Math.min(1, this.camera.aspect / (c.refAspect || 0.8));
    this.camera.position.set(dist * (c.az ?? -0.26), dist * (c.elev ?? 0.22), dist);
    this.camera.lookAt(c.tx || 0, c.targetY, 0);
    this.camera.updateProjectionMatrix();

    const glow = model.glows[0];
    if (glow) {
      glow.obj.getWorldPosition(this.lamp.position);
      this.lamp.color.copy(model.opalColor);
      this.lamp.intensity = lit * (model.lampCd ?? 1.2);
    } else {
      this.lamp.intensity = 0;
    }
    this.ground.visible = c.ground !== false;
    r.render(this.scene, this.camera);
    r.setScissorTest(false);
    const src = r.domElement;
    ctx.drawImage(src, 0, src.height - h, w, h, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/* ---------- 几何工具 ---------- */
export function roundedBox(w, h, d, r, seg = 6, uvPerMeter = 0) {
  const g = new THREE.BoxGeometry(1, 1, 1, seg, seg, seg);
  const p = g.attributes.position;
  const n = g.attributes.normal;
  const uv = g.attributes.uv;
  const v = new THREE.Vector3();
  const inner = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const size = [w, h, d];
  const half = [w / 2 - r, h / 2 - r, d / 2 - r];
  const faceSize = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  const perFace = (seg + 1) * (seg + 1);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const face = Math.floor(i / perFace);
    if (uvPerMeter) uv.setXY(i, uv.getX(i) * faceSize[face][0] * uvPerMeter, uv.getY(i) * faceSize[face][1] * uvPerMeter);
    for (let a = 0; a < 3; a++) v.setComponent(a, v.getComponent(a) * size[a]);
    inner.set(clampNum(v.x, -half[0], half[0]), clampNum(v.y, -half[1], half[1]), clampNum(v.z, -half[2], half[2]));
    nrm.subVectors(v, inner).normalize();
    v.copy(inner).addScaledVector(nrm, r);
    p.setXYZ(i, v.x, v.y, v.z);
    n.setXYZ(i, nrm.x, nrm.y, nrm.z);
  }
  return g;
}

const clampNum = (v, a, b) => Math.min(b, Math.max(a, v));

const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

function makeGlowSprite(size, y = 0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color: 0xffcf9a, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  s.scale.set(size, size, 1);
  s.position.y = y;
  s.renderOrder = 10;
  return s;
}

/* ---------- 模型 ---------- */
class ProductModel {
  constructor(id, finish, build) {
    this.id = id;
    this.group = new THREE.Group();
    this.metal = [];
    this.opals = [];
    this.sprites = [];
    this.glows = [];
    this.opalColor = new THREE.Color(0xffcf9a);
    this.glowValue = 0;
    this.finish = finish;
    this.mats = [];
    Object.assign(this, build(this) || {});
    this.setFinish(finish);
    this.setGlow(0, 2700);
  }

  _metal(finishId, extra = {}) {
    const finish = finishById(finishId);
    const pearl = finish.metalness === 0;
    const m = new THREE.MeshPhysicalMaterial({
      color: finish.color,
      metalness: finish.metalness ?? 1,
      roughness: 1,
      roughnessMap: pearl ? null : brushedRough(),
      anisotropy: pearl ? 0 : 0.55,
      clearcoat: pearl ? 0.35 : 0,
      envMapIntensity: pearl ? 0.8 : 1.3,
      ...extra,
    });
    if (pearl) m.roughness = finish.roughness;
    this.metal.push(m);
    this.mats.push(m);
    return m;
  }

  _opal() {
    const m = new THREE.MeshStandardMaterial({ color: 0xfff6ea, roughness: 0.42, emissive: 0xffcf9a, emissiveIntensity: 0 });
    this.opals.push(m);
    this.mats.push(m);
    return m;
  }

  _mat(m) { this.mats.push(m); return m; }

  _glow(size, pos = [0, 0, 0], parent = this.group, lampCd = 1.2) {
    const s = makeGlowSprite(size, 0);
    s.position.set(...pos);
    parent.add(s);
    this.sprites.push(s);
    const anchor = new THREE.Object3D();
    anchor.position.set(...pos);
    parent.add(anchor);
    this.glows.push({ obj: anchor, size, lampCd });
    return s;
  }

  _add(geometry, material, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = this.group, shadow = true } = {}) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = shadow;
    m.receiveShadow = shadow;
    parent.add(m);
    return m;
  }

  setFinish(id) {
    const f = finishById(id);
    this.finish = id;
    for (const m of this.metal) {
      const pearl = f.metalness === 0;
      m.color.setHex(f.color);
      m.metalness = f.metalness ?? 1;
      m.roughnessMap = pearl ? null : brushedRough();
      m.roughness = pearl ? f.roughness : 1;
      m.anisotropy = pearl ? 0 : 0.55;
      m.clearcoat = pearl ? 0.35 : 0;
      m.needsUpdate = true;
    }
  }

  /** lit: 0–1 亮度；kelvin: 色温 */
  setGlow(lit, kelvin = 2700) {
    this.glowValue = lit;
    setRGB(this.opalColor, kelvinToRGB(kelvin));
    for (const m of this.opals) {
      m.emissive.copy(this.opalColor);
      m.emissiveIntensity = lit * 3.4;
    }
    this.sprites.forEach((s, i) => {
      const g = this.glows[i];
      s.material.color.copy(this.opalColor);
      s.material.opacity = Math.min(1, lit * 0.95);
      const k = 0.7 + 0.5 * lit;
      s.scale.set(g.size * k, g.size * k, 1);
    });
  }

  dispose() {
    this.group.traverse((o) => o.geometry?.dispose());
    this.mats.forEach((m) => m.dispose());
    this.sprites.forEach((s) => s.material.dispose());
  }
}

/* --- 各产品建模 --- */
const BUILDERS = {
  'halo-floor'(m) {
    const metal = m._metal(m.finish);
    const opal = m._opal();
    m._add(new THREE.CylinderGeometry(0.17, 0.17, 0.018, 64), metal, { y: 0.009 });
    m._add(new THREE.CylinderGeometry(0.011, 0.011, 1.48, 24), metal, { y: 0.76 });
    m._add(new THREE.SphereGeometry(0.022, 24, 16), metal, { y: 1.5 });
    m._add(new THREE.CylinderGeometry(0.009, 0.009, 0.13, 16), metal, { x: 0.05, y: 1.545, rz: -1.0 });

    const head = new THREE.Group();
    head.position.set(0.135, 1.585, 0);
    head.rotation.z = -0.3;
    m.group.add(head);
    m.head = head;
    m._add(new THREE.CylinderGeometry(0.17, 0.17, 0.012, 80), metal, { parent: head, y: 0.006 });
    m._add(new THREE.CylinderGeometry(0.158, 0.158, 0.004, 80), opal, { parent: head, y: -0.001 });
    const dome = lathe([[0.17, 0], [0.165, 0.008], [0.14, 0.018], [0.09, 0.026], [0.035, 0.03], [0, 0.031]], 80);
    m._add(dome, metal, { parent: head, y: 0.012 });
    m._glow(0.62, [0, -0.02, 0], head, 9);

    m.cam = { dist: 3.7, targetY: 0.84, elev: 0.14, fov: 26, refAspect: 0.7, az: -0.42 };
    m.focus = { stem: [0, 0.8, 0], glass: [0.135, 1.6, 0], base: [0, 0.06, 0], joint: [0.07, 1.55, 0] };
    m.lampCd = 9;
  },

  'halo-orb'(m) {
    const metal = m._metal(m.finish);
    const opal = m._opal();
    m._add(lathe([[0, 0], [0.078, 0], [0.082, 0.008], [0.07, 0.02], [0.04, 0.034], [0.028, 0.042], [0.026, 0.052]], 64), metal);
    m._add(new THREE.CylinderGeometry(0.024, 0.027, 0.03, 32), metal, { y: 0.066 });
    m._add(new THREE.SphereGeometry(0.08, 64, 48), opal, { y: 0.15 });
    m._glow(0.46, [0, 0.15, 0], m.group, 5);
    m.cam = { dist: 1.05, targetY: 0.12, elev: 0.22, fov: 26, refAspect: 0.7, az: -0.2 };
    m.lampCd = 5;
  },

  'halo-pendant'(m) {
    const metal = m._metal(m.finish);
    const opal = m._opal();
    const dark = m._mat(new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.5, metalness: 0.6 }));
    m._add(new THREE.CylinderGeometry(0.05, 0.056, 0.018, 48), metal, { y: 1.0 });
    m._add(new THREE.CylinderGeometry(0.0022, 0.0022, 0.62, 8), dark, { y: 0.69, shadow: false });
    m._add(new THREE.TorusGeometry(0.29, 0.011, 20, 120), metal, { y: 0.37, rx: Math.PI / 2 });
    m._add(new THREE.CylinderGeometry(0.286, 0.286, 0.005, 120), opal, { y: 0.365 });
    m._add(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 24), metal, { y: 0.37 });
    m._glow(0.9, [0, 0.35, 0], m.group, 10);
    m.cam = { dist: 3.1, targetY: 0.56, elev: 0.38, fov: 26, refAspect: 0.66, az: -0.3, ground: false };
    m.lampCd = 10;
  },

  'veil-panel'(m) {
    const metal = m._metal(m.finish);
    const opal = m._opal();
    const dark = m._mat(new THREE.MeshStandardMaterial({ color: 0xd9d4cb, roughness: 0.7 }));
    const body = new THREE.Group();
    body.rotation.set(-0.42, 0.5, 0);
    body.position.y = 0.31;
    m.group.add(body);
    m._add(roundedBox(0.6, 0.6, 0.018, 0.007, 5), metal, { parent: body });
    m._add(roundedBox(0.566, 0.566, 0.004, 0.002, 3), opal, { parent: body, z: 0.01 });
    m._add(roundedBox(0.13, 0.065, 0.026, 0.008, 3), dark, { parent: body, z: -0.02, y: 0.1 });
    m._glow(0.72, [0, 0, 0.05], body, 7);
    m.cam = { dist: 2.05, targetY: 0.31, elev: 0.18, fov: 26, refAspect: 0.72, az: -0.2 };
    m.lampCd = 7;
  },

  'veil-mirror'(m) {
    const metal = m._metal(m.finish);
    const opal = m._opal();
    const mirror = m._mat(new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.03, envMapIntensity: 1.7 }));
    const body = new THREE.Group();
    body.rotation.set(-0.16, 0.5, 0);
    body.position.y = 0.27;
    m.group.add(body);
    m._add(new THREE.CylinderGeometry(0.25, 0.25, 0.034, 96), metal, { parent: body, rx: Math.PI / 2 });
    m._add(new THREE.CircleGeometry(0.238, 96), mirror, { parent: body, z: 0.0185 });
    m._add(new THREE.TorusGeometry(0.252, 0.011, 14, 120), opal, { parent: body });
    m._glow(0.86, [0, 0, -0.02], body, 7);
    m.cam = { dist: 2.0, targetY: 0.27, elev: 0.14, fov: 26, refAspect: 0.72, az: -0.2 };
    m.lampCd = 7;
  },

  'tide-strip'(m) {
    const metal = m._metal(m.finish);
    const opal = m._opal();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5, 0.02, 0.14), new THREE.Vector3(-0.18, 0.02, -0.16),
      new THREE.Vector3(0.18, 0.02, 0.16), new THREE.Vector3(0.5, 0.02, -0.12),
    ]);
    const channel = new THREE.Shape();
    const w = 0.05, h = 0.034;
    channel.moveTo(-w / 2, 0); channel.lineTo(w / 2, 0); channel.lineTo(w / 2, h); channel.lineTo(-w / 2, h); channel.closePath();
    m._add(new THREE.ExtrudeGeometry(channel, { extrudePath: curve, steps: 90, bevelEnabled: false }), metal);
    const lens = new THREE.Shape();
    const w2 = 0.036, h2 = 0.014;
    lens.moveTo(-w2 / 2, 0); lens.lineTo(w2 / 2, 0); lens.lineTo(w2 / 2, h2); lens.lineTo(-w2 / 2, h2); lens.closePath();
    const lensCurve = curve.clone();
    m._add(new THREE.ExtrudeGeometry(lens, { extrudePath: lensCurve, steps: 90, bevelEnabled: false }), opal, { y: h });
    const end = curve.getPoint(1);
    m._add(roundedBox(0.11, 0.036, 0.07, 0.012, 3), metal, { x: end.x + 0.09, y: 0.018, z: end.z });
    m._glow(0.9, [0, 0.07, 0], m.group, 4);
    m.cam = { dist: 2.0, targetY: 0.05, elev: 0.6, fov: 26, refAspect: 0.7, az: 0 };
    m.lampCd = 4;
  },

  'luma-sense'(m) {
    const pearl = m._metal(m.finish);
    const metal = m._metal(finishById('silver'));
    const led = m._mat(new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffcf9a, emissiveIntensity: 0, roughness: 0.4 }));
    m.indicator = led;
    m._add(lathe([[0, 0], [0.04, 0], [0.046, 0.006], [0.046, 0.014]], 64), metal);
    m._add(lathe([[0, 0.014], [0.046, 0.014], [0.045, 0.022], [0.038, 0.03], [0.024, 0.036], [0, 0.038]], 64), pearl);
    m._add(new THREE.TorusGeometry(0.013, 0.0018, 10, 48), led, { y: 0.0375, rx: Math.PI / 2, shadow: false });
    m._glow(0.1, [0, 0.04, 0], m.group, 0.6);
    m.cam = { dist: 0.4, targetY: 0.017, elev: 0.48, fov: 26, refAspect: 0.66, az: -0.25 };
    m.lampCd = 0.6;
    m.isIndicator = true;
  },

  'luma-shade'(m) {
    const metal = m._metal(m.finish);
    const { a, n } = linenMaps();
    const fabric = m._mat(new THREE.MeshStandardMaterial({ map: a, normalMap: n, normalScale: new THREE.Vector2(0.6, 0.6), color: 0xfbf7ef, roughness: 0.92, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
    m._add(roundedBox(1.0, 0.07, 0.09, 0.022, 4), metal, { y: 0.965 });
    const g = new THREE.PlaneGeometry(0.96, 0.84, 72, 2);
    g.translate(0, -0.42, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) / 0.96 + 0.5) * Math.PI * 2 * 11) * 0.013);
    g.computeVertexNormals();
    const cloth = m._add(g, fabric, { y: 0.93, shadow: false });
    cloth.renderOrder = 4;
    const bar = m._add(roundedBox(0.97, 0.02, 0.034, 0.008, 3), metal, { y: 0.1 });
    m.cloth = cloth;
    m.bar = bar;
    m.drop = 0.84;
    m.cam = { dist: 2.9, targetY: 0.52, elev: 0.18, fov: 26, refAspect: 0.66, az: -0.35 };
    m.lampCd = 0;
  },
};

/** 构建一件产品。finish: 表面材质 id。 */
export function buildProduct(id, finish) {
  const build = BUILDERS[id];
  if (!build) throw new Error('unknown product ' + id);
  const model = new ProductModel(id, finish, build);
  if (id === 'luma-shade') {
    model.setDrop = (drop) => {
      model.drop = drop;
      model.cloth.scale.y = Math.max(0.012, drop);
      model.bar.position.y = 0.93 - 0.84 * Math.max(0.012, drop);
      model.bar.visible = drop > 0.02;
    };
    model.setGlow = (lit, kelvin) => { model.glowValue = lit; };
    model.setDrop(0.84);
  }
  if (id === 'luma-sense') {
    model.setGlow = (lit, kelvin) => {
      model.glowValue = lit;
      setRGB(model.opalColor, kelvinToRGB(kelvin));
      model.indicator.emissive.copy(model.opalColor);
      model.indicator.emissiveIntensity = lit * 5;
      model.sprites[0].material.color.copy(model.opalColor);
      model.sprites[0].material.opacity = lit * 0.7;
    };
  }
  return model;
}
