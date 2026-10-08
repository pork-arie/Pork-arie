"""Step 3 - turn a sprite sheet into animation strips.

Usage:
    python 3_make_animations.py source/sprite-sheet-3d.webp out/cutout.png ../assets/animations

Needs the EDSR upscaling model (38 MB, download once):
    curl -L -o EDSR_x4.pb https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb

For every animation on the sheet this:
  1. upscales its panel 4x with an AI model (the frames are tiny, ~60px),
  2. finds each frame (each dark-blue body is one frame),
  3. cuts the frame out of the background,
  4. resizes it so the character is the same size in every animation,
  5. shifts the suit colour to match the original artwork (out/cutout.png),
  6. lines the frames up side by side in one strip: walk.webp, run.webp ...

It prints the frame count of each strip - copy those into ANIMS in Mascot.jsx.
The upscaled panels are cached in out/upscaled, so re-runs are fast.
"""
import argparse
import json
import os

import cv2
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("sheet")
ap.add_argument("cutout", help="the original character from step 1, used for colour matching")
ap.add_argument("outdir")
ap.add_argument("--model", default="EDSR_x4.pb")
ap.add_argument("--cache", default="out/upscaled")
args = ap.parse_args()
os.makedirs(args.outdir, exist_ok=True)
os.makedirs(args.cache, exist_ok=True)

# Where each animation sits on the sheet: (left, top, right, bottom) of the
# row of frames, without the title pill and the frame numbers.
PANELS = {
    "walk": (18, 288, 766, 410), "run": (778, 288, 1518, 410),
    "jump": (18, 458, 515, 590), "fall": (525, 482, 1000, 590), "roll": (1010, 482, 1518, 590),
    "wave": (18, 652, 515, 746), "dance": (525, 645, 1000, 746), "look": (1015, 656, 1518, 746),
    "sleep": (18, 798, 515, 876), "happy": (525, 803, 1000, 877), "sad": (1015, 803, 1518, 877),
    "angry": (18, 930, 515, 996), "surprised": (525, 925, 1000, 996), "celebrate": (1015, 928, 1518, 996),
}
# The sheet draws each row at a different scale. Animations in the same row
# share a "reference" standing pose whose height we measure...
REF = {"walk": "walk", "run": "walk", "jump": "jump", "fall": "jump", "roll": "jump",
       "wave": "wave", "dance": "wave", "look": "wave", "sleep": "happy", "happy": "happy",
       "sad": "happy", "angry": "angry", "surprised": "angry", "celebrate": "angry"}
# ...plus a hand-tuned correction, found by comparing head sizes on screen.
TUNE = {"happy": 0.87, "angry": 0.8}
# Frames that didn't cut out cleanly (side-view face too close to the background).
DROP = {"walk": [2, 5], "look": [4, 5]}

TARGET = 180                 # character height in px when the mascot is 140px wide
CW, CH, FOOT = 200, 300, 8   # frame size, and gap under the feet

sheet = cv2.imread(args.sheet)
sr = None


def upscaled(name):
    """Panel image, 4x bigger. Cached because the model is slow (~10s per panel)."""
    global sr
    path = os.path.join(args.cache, name + ".png")
    if not os.path.exists(path):
        if sr is None:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            sr.readModel(args.model)
            sr.setModel("edsr", 4)
        x0, y0, x1, y1 = PANELS[name]
        print("upscaling", name, flush=True)
        cv2.imwrite(path, sr.upsample(sheet[y0:y1, x0:x1]))
    return cv2.imread(path)


def frames_of(name):
    U = upscaled(name)
    if name == "jump":
        U[:110, :400] = U[-5:, -5:].reshape(-1, 3).mean(0)  # hide the "Jump" title pill
    Ui = U.astype(np.int16)
    lab = cv2.cvtColor(U, cv2.COLOR_BGR2LAB)
    hsv = cv2.cvtColor(U, cv2.COLOR_BGR2HSV)
    H, W = U.shape[:2]
    bg = np.median(np.concatenate([Ui[-8:].reshape(-1, 3), Ui[:, -8:].reshape(-1, 3)]), axis=0)
    diff = np.abs(Ui - bg).sum(2)  # how different each pixel is from the background

    # Each frame = one big dark-blue blob (the suit).
    body = (((hsv[..., 1] > 80) & (hsv[..., 2] < 175)) * 255).astype(np.uint8)
    body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    n, labels, st, _ = cv2.connectedComponentsWithStats(body)
    comps = sorted([i for i in range(1, n) if st[i, 4] > 0.25 * st[1:, 4].max()], key=lambda i: st[i, 0])
    median_w = np.median([st[i, 2] for i in comps])

    out = []
    for k, i in enumerate(comps):
        bx, by, bw, bh, _ = st[i]
        if bw > 1.55 * median_w:
            continue  # two overlapping frames merged into one blob - skip
        left = 0 if k == 0 else (st[comps[k - 1], 0] + st[comps[k - 1], 2] + bx) // 2
        right = W if k == len(comps) - 1 else (bx + bw + st[comps[k + 1], 0]) // 2
        sl, sd, sb = U[:, left:right], diff[:, left:right], labels[:, left:right] == i
        h, w = sd.shape

        # GrabCut hints (see 1_cutout.py): suit = surely character, background-coloured = surely not.
        m = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
        m[sd > 60] = cv2.GC_PR_FGD
        m[cv2.erode(sb.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0] = cv2.GC_FGD
        m[sd < 18] = cv2.GC_BGD
        near = np.zeros((h, w), np.uint8)
        cnts, _ = cv2.findContours(sb.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.fillPoly(near, [cv2.convexHull(np.vstack(cnts))], 255)
        near = cv2.dilate(near, np.ones((41, 41), np.uint8))
        # The cream face is close to the background colour: warm pixels next to the body are character.
        sl_lab = lab[:, left:right]
        cream = (sl_lab[..., 2] > 136) & (sl_lab[..., 0] > 150) & (near > 0)
        cream = cv2.morphologyEx(cream.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)) > 0
        m[cream] = cv2.GC_FGD
        m[:3] = m[-3:] = cv2.GC_BGD
        m[:, :3] = m[:, -3:] = cv2.GC_BGD
        try:
            cv2.grabCut(sl, m, None, np.zeros((1, 65)), np.zeros((1, 65)), 4, cv2.GC_INIT_WITH_MASK)
        except cv2.error:
            pass
        fg = np.where((m == 1) | (m == 3), 255, 0).astype(np.uint8)

        # Background = what a paint-bucket fill from the frame corners reaches through smooth
        # light colours. Anything it can't reach stays (catches side-view faces).
        flood = np.zeros((h + 2, w + 2), np.uint8)
        blur = cv2.GaussianBlur(sl, (5, 5), 0)
        for yy, xx in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1), (0, w // 2), (h - 1, w // 2)]:
            if sd[yy, xx] < 40 and flood[yy + 1, xx + 1] == 0:
                cv2.floodFill(blur.copy(), flood, (xx, yy), 0, (3, 3, 3), (3, 3, 3), 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8))
        fg[(flood[1:-1, 1:-1] == 0) & (cv2.dilate(near, np.ones((21, 21), np.uint8)) > 0)] = 255

        # Keep the character plus small effects (Zz, !, notes) - drop bits of neighbouring frames.
        nn, ll, ss, _ = cv2.connectedComponentsWithStats(fg)
        votes = np.bincount(ll[sb].ravel(), minlength=nn)
        votes[0] = 0
        main = int(votes.argmax())
        keep = np.zeros_like(fg)
        for j in range(1, nn):
            x, y, ww, hh, a = ss[j]
            if j != main and (a < 60 or x <= 2 or x + ww >= w - 2 or y <= 2 or (hh < 40 and ww > 4 * hh)):
                continue
            keep[ll == j] = 255
        ff = np.pad(keep, 1)
        cv2.floodFill(ff, np.zeros((h + 4, w + 4), np.uint8), (0, 0), 255)
        keep |= 255 - ff[1:-1, 1:-1]  # fill holes
        keep[cream] = 255
        feet = by + bh
        keep[(np.arange(h)[:, None] > feet - 6) & (sd < 90)] = 0  # drop the ground shadow
        out.append(dict(rgb=sl, alpha=cv2.GaussianBlur(keep, (5, 5), 0), cx=bx + bw / 2 - left, foot=feet, bh=int(ss[main, 3])))
    return [f for idx, f in enumerate(out) if idx not in DROP.get(name, [])]


frames = {name: frames_of(name) for name in PANELS}
ref_h = {r: np.median([f["bh"] for f in frames[r]]) for r in set(REF.values())}


# Colour matching: make the suit's average colour and contrast (in Lab colour
# space) equal to the original artwork's suit.
def suit(rgb):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_BGR2HSV)
    return (hsv[..., 0] > 100) & (hsv[..., 0] < 135) & (hsv[..., 1] > 70)


orig = cv2.imread(args.cutout, cv2.IMREAD_UNCHANGED)
o_lab = cv2.cvtColor(orig[..., :3], cv2.COLOR_BGR2LAB).reshape(-1, 3)[(suit(orig[..., :3]) & (orig[..., 3] > 200)).ravel()].astype(float)
s_lab = np.concatenate([
    cv2.cvtColor(f["rgb"], cv2.COLOR_BGR2LAB).reshape(-1, 3)[(suit(f["rgb"]) & (f["alpha"] > 200)).ravel()]
    for fl in frames.values() for f in fl
]).astype(float)
o_mean, o_std, s_mean, s_std = o_lab.mean(0), o_lab.std(0), s_lab.mean(0), s_lab.std(0)

counts = {}
for name, fl in frames.items():
    scale = TARGET / ref_h[REF[name]] * TUNE.get(REF[name], 1)
    strip = np.zeros((CH, CW * len(fl), 4), np.uint8)
    foot = max(f["foot"] for f in fl)
    for c, f in enumerate(fl):
        lab = cv2.cvtColor(f["rgb"], cv2.COLOR_BGR2LAB).astype(float)
        weight = cv2.GaussianBlur(suit(f["rgb"]).astype(np.float32), (7, 7), 0)[..., None]
        lab = lab * (1 - weight) + ((lab - s_mean) / s_std * o_std + o_mean) * weight
        rgb = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
        h, w = f["alpha"].shape
        nw, nh = round(w * scale), round(h * scale)
        interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
        rgb = cv2.resize(rgb, (nw, nh), interpolation=interp)
        al = cv2.resize(f["alpha"], (nw, nh), interpolation=interp)
        # Place it: feet on the same line, body centred.
        dy, dx = (CH - FOOT) - round(foot * scale), round(CW / 2 - f["cx"] * scale)
        ys0, ys1, xs0, xs1 = max(0, -dy), min(nh, CH - dy), max(0, -dx), min(nw, CW - dx)
        cell = np.zeros((CH, CW, 4), np.uint8)
        cell[ys0 + dy:ys1 + dy, xs0 + dx:xs1 + dx] = np.dstack([rgb, al])[ys0:ys1, xs0:xs1]
        strip[:, c * CW:(c + 1) * CW] = cell
    Image.fromarray(cv2.cvtColor(strip, cv2.COLOR_BGRA2RGBA)).save(
        os.path.join(args.outdir, name + ".webp"), quality=76, method=6)
    counts[name] = len(fl)

print("frames per animation:", json.dumps(counts))
