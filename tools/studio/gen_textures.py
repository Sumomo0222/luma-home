#!/usr/bin/env python3
"""
Luma Home — procedural textures for the real-time 3D scenes.

Usage:  python3 tools/gen_textures.py        (needs numpy + Pillow)
Writes tileable WebP textures to assets/tex/. Everything is generated from
seeded noise, so re-running always produces the same files.
"""
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tools", "studio", "tex")
TAU = 2.0 * np.pi


def smooth(t):
    return t * t * (3.0 - 2.0 * t)


def noise(size, cu, cv, rng):
    """Tileable value noise with independent cell counts along u (x) and v (y)."""
    cu, cv = max(1, int(round(cu))), max(1, int(round(cv)))
    grid = rng.random((cv, cu)).astype(np.float32)
    x = (np.arange(size, dtype=np.float32) + 0.5) / size * cu
    y = (np.arange(size, dtype=np.float32) + 0.5) / size * cv
    x0 = np.floor(x).astype(np.int64)
    y0 = np.floor(y).astype(np.int64)
    fx, fy = smooth(x - x0), smooth(y - y0)
    x0, y0 = x0 % cu, y0 % cv
    x1, y1 = (x0 + 1) % cu, (y0 + 1) % cv
    a, b = grid[np.ix_(y0, x0)], grid[np.ix_(y0, x1)]
    c, d = grid[np.ix_(y1, x0)], grid[np.ix_(y1, x1)]
    top = a * (1 - fx)[None, :] + b * fx[None, :]
    bot = c * (1 - fx)[None, :] + d * fx[None, :]
    return top * (1 - fy)[:, None] + bot * fy[:, None]


def fbm(size, cu, cv, rng, octaves=5, gain=0.5):
    out = np.zeros((size, size), np.float32)
    amp, total = 1.0, 0.0
    for _ in range(octaves):
        out += amp * noise(size, cu, cv, rng)
        total += amp
        amp *= gain
        cu *= 2
        cv *= 2
    return out / total


def normal_map(h, strength=1.0):
    """OpenGL-convention normal map from a height field (image y points down)."""
    size = h.shape[0]
    k = 0.5 * size / 256.0
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * k
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * k
    n = np.stack([-dx * strength, dy * strength, np.ones_like(h)], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return n * 0.5 + 0.5


def save(name, arr, quality=84):
    arr = np.clip(arr, 0.0, 1.0)
    img = Image.fromarray((arr * 255.0 + 0.5).astype(np.uint8))
    path = os.path.join(OUT, name)
    img.save(path, "WEBP", quality=quality, method=6)
    print(f"  {name:22s} {img.size[0]}x{img.size[1]}  {os.path.getsize(path) / 1024:6.1f} KB")


def gray(a):
    return np.repeat(a[..., None], 3, axis=-1)


def mix(a, b, t):
    """Per-pixel mix; t is (size, size), a/b are broadcastable colours."""
    return a * (1.0 - t[..., None]) + np.asarray(b, np.float32) * t[..., None]


def grid(size):
    u = (np.arange(size) + 0.5) / size
    return np.meshgrid(u, u)


def wood(size=1024, seed=7):
    rng = np.random.default_rng(seed)
    U, _ = grid(size)
    planks = 7
    pw = size / planks
    pid = np.minimum((U * planks).astype(int), planks - 1)
    tint = rng.uniform(-0.05, 0.05, planks)[pid]
    warm = rng.uniform(-0.025, 0.025, planks)[pid]

    warp = fbm(size, 3, 2, rng, 4)
    streak = fbm(size, 140, 5, rng, 4)
    fine = fbm(size, 420, 30, rng, 3)
    rings = 0.5 + 0.5 * np.sin((U * 46 + warp * 7.0 + streak * 1.2) * TAU)
    grain = np.clip(0.45 * streak + 0.35 * rings + 0.20 * fine, 0.0, 1.0)

    joint = np.zeros((size, size), np.float32)
    for p in range(planks):
        start = rng.uniform(0.0, 1.0)
        for k in range(2):
            yj = int(((start + k * 0.5) % 1.0) * size)
            cols = slice(int(p * pw), int((p + 1) * pw))
            for dy in (-1, 0, 1):
                joint[(yj + dy) % size, cols] = 1.0

    xx = np.arange(size)
    in_plank = xx % pw
    bevel = np.minimum(in_plank, pw - in_plank) < 2.0
    edge = np.zeros((size, size), np.float32)
    edge[:, bevel] = 1.0

    base = np.array([0.855, 0.752, 0.605], np.float32)
    dark = np.array([0.600, 0.480, 0.350], np.float32)
    rgb_shift = np.broadcast_to(warm, (size, size))[..., None] * np.array([-1.0, 0.0, 1.0], np.float32)
    col = base * (1.0 + tint[..., None] + rgb_shift)
    col = col * (1.0 - 0.17 * grain[..., None])
    col = mix(col, dark, 0.55 * joint + 0.30 * edge)

    rough = 0.46 + 0.14 * (1.0 - grain) + 0.22 * joint + 0.10 * edge
    height = -0.35 * grain - joint - 0.6 * edge
    save("floor_wood_a.webp", col)
    save("floor_wood_r.webp", gray(rough))
    save("floor_wood_n.webp", normal_map(height, 0.7))


def plaster(size=512, seed=3):
    rng = np.random.default_rng(seed)
    h = fbm(size, 10, 10, rng, 5) * 0.7 + fbm(size, 90, 90, rng, 2) * 0.3
    save("plaster_n.webp", normal_map(h, 1.1))


def boucle(size=512, seed=11):
    rng = np.random.default_rng(seed)
    U, V = grid(size)
    loops = fbm(size, 70, 70, rng, 2)
    clumps = fbm(size, 14, 14, rng, 3)
    weave = 0.5 + 0.5 * np.sin(U * TAU * 32) * np.sin(V * TAU * 32)
    h = 0.55 * loops + 0.30 * clumps + 0.15 * weave
    save("boucle_n.webp", normal_map(h, 1.6))
    save("boucle_ao.webp", gray(0.78 + 0.22 * h), 80)


def rug(size=512, seed=5):
    rng = np.random.default_rng(seed)
    mottle = fbm(size, 6, 6, rng, 4)
    pile = fbm(size, 160, 40, rng, 3)
    base = np.array([0.925, 0.895, 0.845], np.float32)
    col = base * (0.93 + 0.07 * mottle + 0.04 * pile)[..., None]
    save("rug_a.webp", col)
    save("rug_n.webp", normal_map(pile * 0.8 + mottle * 0.2, 1.4))


def travertine(size=512, seed=21):
    rng = np.random.default_rng(seed)
    veins = fbm(size, 3, 22, rng, 5)
    v = np.clip((veins - 0.42) / 0.20, 0.0, 1.0)
    v = smooth(v)
    pits = (fbm(size, 130, 130, rng, 2) > 0.775).astype(np.float32)
    base = np.array([0.905, 0.862, 0.785], np.float32)
    col = base * (1.0 - 0.30 * v[..., None])
    col = mix(col, np.array([0.55, 0.50, 0.44], np.float32), pits * 0.5)
    save("travertine_a.webp", col)
    save("travertine_r.webp", gray(0.50 + 0.12 * v + 0.25 * pits))


def linen(size=512, seed=17):
    rng = np.random.default_rng(seed)
    U, V = grid(size)
    weave = 0.5 + 0.5 * np.sin(U * TAU * 64) * np.sin(V * TAU * 64)
    slub = fbm(size, 120, 8, rng, 3)
    h = 0.25 * weave + 0.75 * slub
    save("linen_n.webp", normal_map(h, 0.9))
    col = np.array([0.975, 0.962, 0.935], np.float32) * (0.97 + 0.03 * h)[..., None]
    save("linen_a.webp", col)


def brushed(size=512, seed=23):
    rng = np.random.default_rng(seed)
    streak = fbm(size, 260, 3, rng, 3)
    fine = fbm(size, 500, 2, rng, 2)
    r = 0.30 + 0.14 * streak + 0.06 * fine
    save("brushed_r.webp", gray(r))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("Luma Home textures ->", os.path.relpath(OUT, ROOT))
    wood()
    plaster()
    boucle()
    rug()
    travertine()
    linen()
    brushed()
