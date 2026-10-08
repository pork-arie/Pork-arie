"""Step 2 - split the cut-out character into layers that can move.

Usage:
    python 2_make_layers.py out/cutout.png ../assets/layers

Writes base.webp, eyeL/eyeR (cat eyes), pupilL/pupilR (fish-suit pupils),
mouth, paw and tail, and prints the numbers to paste into `P` and `SCLERA`
in Mascot.jsx.

The idea:
  1. Find each moving part with a colour rule inside a small area
     (e.g. "everything that isn't cream-coloured near the left eye").
  2. Save that part as its own transparent image.
  3. In the base image, paint over where the part was ("inpainting"), so when
     the part moves or blinks you see smooth face/skin underneath, not a hole.

The part positions (PARTS below) are specific to this artwork - for a new
drawing, look up the centre of each part in an image viewer and change them.
"""
import argparse
import json
import os

import cv2
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("cutout")
ap.add_argument("outdir")
ap.add_argument("--scale", type=float, default=0.55, help="shrink saved images (smaller files)")
args = ap.parse_args()
os.makedirs(args.outdir, exist_ok=True)

im = cv2.imread(args.cutout, cv2.IMREAD_UNCHANGED)
H, W = im.shape[:2]
rgb, A = im[..., :3].copy(), im[..., 3].copy()
hsv = cv2.cvtColor(rgb, cv2.COLOR_BGR2HSV)

# Centre (x, y) of each part in the cut-out image.
PARTS = {
    "eyeL": (257, 470), "eyeR": (478, 412),        # cat eyes
    "pupilL": (128, 222), "pupilR": (493, 155),    # fish-suit eye pupils
}
MOUTH = (378, 500)
PAW = dict(center=(489, 586), axes=(62, 60), angle=-15)
TAIL_POLY = [(0, 585), (120, 600), (160, 660), (175, 720), (160, 800), (120, 868), (0, 868)]
SEAM_POLY = [(0, 585), (128, 610), (150, 680), (150, 760), (118, 868), (0, 868)]


def disc(cx, cy, rx, ry):
    m = np.zeros((H, W), np.uint8)
    cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    return m


def largest(m):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    return m if n < 2 else np.where(lab == 1 + np.argmax(st[1:, 4]), 255, 0).astype(np.uint8)


def fill_holes(m):
    c, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    o = np.zeros_like(m)
    cv2.drawContours(o, c, -1, 255, -1)
    return o


def hull(m):
    c, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    o = np.zeros_like(m)
    cv2.fillPoly(o, [cv2.convexHull(np.vstack(c))], 255)
    return o


# ---- 1. find the parts --------------------------------------------------
not_cream = (((hsv[..., 1] > 55) | (hsv[..., 2] < 190)) * 255).astype(np.uint8)
dark = ((hsv[..., 2] < 150) * 255).astype(np.uint8)
masks = {}
for k in ("eyeL", "eyeR"):
    masks[k] = hull(fill_holes(largest(not_cream & disc(*PARTS[k], 62, 62))))
for k in ("pupilL", "pupilR"):
    masks[k] = hull(fill_holes(largest(dark & disc(*PARTS[k], 60, 60))))
m = not_cream & disc(*MOUTH, 45, 30)
m[: MOUTH[1] - 24] = 0  # leave the nose above the mouth alone
masks["mouth"] = fill_holes(cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)))

coords = {}


def save(name, mask, feather=True, pad=4):
    """Save one part as a transparent image and remember where it sits."""
    alpha = cv2.dilate(mask, np.ones((3, 3), np.uint8))
    if feather:
        alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    alpha = np.minimum(alpha, A)
    ys, xs = np.where(alpha > 0)
    x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    x1, y1 = min(xs.max() + pad, W - 1), min(ys.max() + pad, H - 1)
    write(name, np.dstack([rgb, alpha])[y0:y1 + 1, x0:x1 + 1])
    coords[name] = dict(x=int(x0), y=int(y0), w=int(x1 - x0 + 1), h=int(y1 - y0 + 1))


def write(name, bgra):
    img = Image.fromarray(cv2.cvtColor(bgra, cv2.COLOR_BGRA2RGBA))
    img = img.resize((max(1, round(img.width * args.scale)), max(1, round(img.height * args.scale))), Image.LANCZOS)
    img.save(os.path.join(args.outdir, name + ".webp"), quality=90, method=6, exact=True)


# ---- 2. save the moving parts --------------------------------------------
tail = np.zeros((H, W), np.uint8)
cv2.fillPoly(tail, [np.array(TAIL_POLY)], 255)
save("tail", tail & ((A > 0) * 255).astype(np.uint8), feather=False)
seam = np.zeros((H, W), np.uint8)
cv2.fillPoly(seam, [np.array(SEAM_POLY)], 255)
A[seam > 0] = 0  # the tail is drawn behind the body, so remove it from the base

paw = np.zeros((H, W), np.uint8)
cv2.ellipse(paw, PAW["center"], PAW["axes"], PAW["angle"], 0, 360, 255, -1)
paw &= ((A > 0) * 255).astype(np.uint8)
save("paw", paw)
for k, m in masks.items():
    save(k, m)


# ---- 3. paint over the holes in the base ---------------------------------
def smooth_fill(img, hole, iters):
    """Fill `hole` by repeatedly averaging neighbours (a smooth 'harmonic' fill)."""
    out = cv2.inpaint(img, hole, 5, cv2.INPAINT_TELEA).astype(np.float32)
    ys, xs = np.where(hole > 0)
    y0, y1, x0, x1 = ys.min() - 2, ys.max() + 3, xs.min() - 2, xs.max() + 3
    sub, m = out[y0:y1, x0:x1], (hole[y0:y1, x0:x1] > 0)[..., None]
    for _ in range(iters):
        avg = (np.roll(sub, 1, 0) + np.roll(sub, -1, 0) + np.roll(sub, 1, 1) + np.roll(sub, -1, 1)) / 4
        sub = np.where(m, avg, sub)
    out[y0:y1, x0:x1] = sub
    return np.clip(out, 0, 255).astype(np.uint8)


base = rgb.copy()
white = (hsv[..., 1] < 40) & (hsv[..., 2] > 170)
for k in ("pupilL", "pupilR"):  # fill pupils with the white of the eye only
    hole = cv2.dilate(masks[k], np.ones((7, 7), np.uint8))
    ring = (cv2.dilate(hole, np.ones((15, 15), np.uint8)) > 0) & (hole == 0) & (disc(*PARTS[k], 95, 95) > 0)
    colour = np.median(rgb[ring & white], axis=0) if (ring & white).sum() > 20 else np.array([245, 245, 248])
    hole[ring & ~white] = 255
    base[hole > 0] = colour
    base = smooth_fill(base, hole, 400)
for k, grow in (("eyeL", 9), ("eyeR", 9), ("mouth", 15)):
    base = smooth_fill(base, cv2.dilate(masks[k], np.ones((grow, grow), np.uint8)), 2500)
base = smooth_fill(base, cv2.dilate(paw, np.ones((7, 7), np.uint8)), 3000)
write("base", np.dstack([base, A]))

# ---- 4. the white of each fish eye (pupils are clipped to it) ------------
sclera = {}
for side, (k, centre) in {"L": ("pupilL", (112, 228)), "R": ("pupilR", (503, 153))}.items():
    region = disc(*centre, 100, 100)
    wm = ((white & (region > 0)) * 255).astype(np.uint8) | (masks[k] & region)
    wm = cv2.morphologyEx(wm, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    c, _ = cv2.findContours(wm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    (ex, ey), (ew, eh), ang = cv2.fitEllipse(max(c, key=cv2.contourArea))
    sclera[side] = dict(cx=round(ex, 1), cy=round(ey, 1), rx=round(ew / 2 - 2), ry=round(eh / 2 - 2), angle=round(ang))

print("VB =", json.dumps({"w": W, "h": H}))
print("P =", json.dumps(coords, indent=1))
print("SCLERA =", json.dumps(sclera, indent=1))
