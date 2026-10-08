"""Step 3 - turn the animation sheets into animation strips.

Usage:
    python 3_make_animations.py out/cutout.png ../assets/animations

Reads the sheets in source/hd/ (one row of poses per animation, see ANIMS
below) and, for every animation:
  1. finds each frame (each dark-blue body is one frame),
  2. cuts the frame out of the white background,
  3. resizes it so the character has the same height and head size as the
     original artwork (out/cutout.png from step 1),
  4. shifts the suit colour to match the original artwork,
  5. lines the frames up side by side in one strip: walk.webp, run.webp ...

It prints the ANIMS table to paste into Mascot.jsx (frame count and frame
height of each strip).
"""
import argparse
import json
import os

import cv2
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("cutout", help="the original character from step 1 (size and colour reference)")
ap.add_argument("outdir")
ap.add_argument("--hd", type=float, default=2, help="pixel density: 2 = sharp on retina/phone screens")
args = ap.parse_args()
os.makedirs(args.outdir, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))

# Each animation: which sheet, which part of it (left, top, right, bottom -
# leave out labels), which frames to skip, and how to measure its size:
#   "front" - match height and head width   "side" - match height only
#   measure - which frames show the character standing (for sizing)
ANIMS = {
    "idle":    dict(sheet="idle.webp"),
    "happy":   dict(sheet="happy.webp"),
    "walk":    dict(sheet="walk.webp", fit="side"),
    "run":     dict(sheet="run.webp", fit="side"),
    "jump":    dict(sheet="jump.webp", measure=[0, 4]),
    "excited": dict(sheet="excited-wave.webp", crop=(0, 0, 1774, 482), hide=[(0, 0, 268, 90)], measure=[0, 2]),
    "wave":    dict(sheet="excited-wave.webp", crop=(0, 482, 1774, 887), hide=[(0, 0, 268, 75)]),
    "look":    dict(sheet="look.webp", crop=(0, 0, 1774, 680)),
    "sleep":   dict(sheet="sleep.webp", measure=[0]),
    "sad":     dict(sheet="sad.webp", measure=[0]),
    "panic":   dict(sheet="panic.webp", crop=(0, 0, 1774, 680), measure=[0, 2]),
    # frame 1 (hand still reaching) is skipped and the hand is removed - on the
    # website the visitor's own cursor is the hand holding the fin
    # align="tip": frames are lined up by the fin tip (where the cursor holds
    # him) instead of the feet, so the tip stays still and the body swings
    "drag":    dict(sheet="drag.webp", crop=(0, 0, 1536, 795), skip=[0], measure=[0], no_hand=True, align="tip"),
}

TARGET_W = 140 * args.hd      # the mascot box is 140px wide at size=140
CW = round(200 * args.hd)     # frame width in the strip
TIP_Y = round(40 * args.hd)   # where the fin tip sits in "tip"-aligned frames


def navy(rgb):
    """The dark-blue suit (used to find frames and to measure the body)."""
    hsv = cv2.cvtColor(rgb, cv2.COLOR_BGR2HSV)
    blue = (hsv[..., 0] > 95) & (hsv[..., 0] < 140)   # skin shadows are dark too, but orange
    return blue & (hsv[..., 1] > 80) & (hsv[..., 2] < 175)


def suit(rgb):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_BGR2HSV)
    return (hsv[..., 0] > 100) & (hsv[..., 0] < 135) & (hsv[..., 1] > 70)


def body_size(mask):
    """(height, head width) of the suit - head width = widest row in the top 55%."""
    ys, _ = np.where(mask)
    top, h = ys.min(), ys.max() - ys.min() + 1
    return h, max(mask[y].sum() for y in range(top, top + int(h * 0.55)))


def frames_of(cfg):
    img = cv2.imread(os.path.join(HERE, "source", "hd", cfg["sheet"]))
    x0, y0, x1, y1 = cfg.get("crop", (0, 0, img.shape[1], img.shape[0]))
    U = img[y0:y1, x0:x1].copy()
    for hx0, hy0, hx1, hy1 in cfg.get("hide", []):   # paint over title labels
        U[hy0:hy1, hx0:hx1] = 255
    H, W = U.shape[:2]
    bgc = np.median(np.concatenate([U[:4].reshape(-1, 3), U[-4:].reshape(-1, 3)]), axis=0)
    diff = np.abs(U.astype(np.int16) - bgc).sum(2)

    # Each frame = one big dark-blue blob.
    body = (navy(U) * 255).astype(np.uint8)
    body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, labels, st, _ = cv2.connectedComponentsWithStats(body)
    comps = sorted([i for i in range(1, n) if st[i, 4] > 0.25 * st[1:, 4].max()], key=lambda i: st[i, 0])

    out = []
    for k, i in enumerate(comps):
        bx, by, bw, bh, _ = st[i]
        left = 0 if k == 0 else (st[comps[k - 1], 0] + st[comps[k - 1], 2] + bx) // 2
        right = W if k == len(comps) - 1 else (bx + bw + st[comps[k + 1], 0]) // 2
        sl, sd, sb = U[:, left:right], diff[:, left:right], labels[:, left:right] == i
        h, w = sd.shape

        # Background = what a paint-bucket fill from the edges reaches through
        # near-white pixels. Everything else is the character (or an effect).
        flood = np.zeros((h + 2, w + 2), np.uint8)
        blur = cv2.GaussianBlur(sl, (3, 3), 0)
        for yy, xx in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1), (0, w // 2), (h - 1, w // 2), (h // 2, 0), (h // 2, w - 1)]:
            if sd[yy, xx] < 30 and flood[yy + 1, xx + 1] == 0:
                cv2.floodFill(blur.copy(), flood, (xx, yy), 0, (4, 4, 4), (4, 4, 4), 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8))
        fg = ((flood[1:-1, 1:-1] == 0) & (sd > 12)).astype(np.uint8) * 255
        # The cream face is close to white: in side views it touches the
        # background, so warm (yellowish) pixels next to the body are character.
        near = np.zeros((h, w), np.uint8)
        cnts, _ = cv2.findContours(sb.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.fillPoly(near, [cv2.convexHull(np.vstack(cnts))], 255)
        lab = cv2.cvtColor(sl, cv2.COLOR_BGR2LAB)
        cream = (lab[..., 2] > 134) & (lab[..., 0] > 150) & (near > 0)
        cream = cv2.morphologyEx(cream.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
        fg[cream] = 255
        fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

        # Keep the character plus effects (Zz, tears, sparkles) - not bits of neighbours.
        nn, ll, ss, _ = cv2.connectedComponentsWithStats(fg)
        votes = np.bincount(ll[sb].ravel(), minlength=nn)
        votes[0] = 0
        main = int(votes.argmax())
        keep = np.zeros_like(fg)
        for j in range(1, nn):
            x, y, ww, hh, a = ss[j]
            if j != main and (a < 40 or x <= 1 or x + ww >= w - 1):
                continue
            keep[ll == j] = 255
        ff = np.pad(keep, 1)
        cv2.floodFill(ff, np.zeros((h + 4, w + 4), np.uint8), (0, 0), 255)
        keep |= 255 - ff[1:-1, 1:-1]  # fill holes
        # drop the soft grey ground shadow under the feet
        feet = by + bh
        hsv = cv2.cvtColor(sl, cv2.COLOR_BGR2HSV)
        keep[(np.arange(h)[:, None] > feet - 4) & (hsv[..., 1] < 60) & (sd < 70)] = 0
        alpha = cv2.GaussianBlur(keep, (3, 3), 0).astype(np.float32)

        if cfg.get("no_hand"):
            # Remove the drawn hand: the visitor's mouse cursor is the hand.
            hand = (hsv[..., 0] < 25) & (hsv[..., 1] > 30) & (hsv[..., 2] > 120)
            hand[by + 40:] = False          # only up at the fin, never the face
            hand = cv2.dilate(hand.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
            alpha[hand] = 0
            alpha[:max(by - 2, 0)] = 0      # anything above the fin tip

        # size = the character's outline, from the top of the suit down
        # (leaves out effects above the head and the hand in the drag frames)
        outline = (cv2.dilate((keep > 0).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0) & (ll == main)
        ff2 = np.pad(outline.astype(np.uint8) * 255, 1)
        cv2.floodFill(ff2, np.zeros((h + 4, w + 4), np.uint8), (0, 0), 255)
        outline = outline | (ff2[1:-1, 1:-1] == 0)
        outline[:by] = False
        out.append(dict(rgb=sl, alpha=alpha.clip(0, 255).astype(np.uint8), cx=bx + bw / 2 - left,
                        foot=feet, size=body_size(outline)))
    return [f for idx, f in enumerate(out) if idx not in cfg.get("skip", [])]


frames = {name: frames_of(cfg) for name, cfg in ANIMS.items()}

# Colour matching: make the suit's average colour and contrast (in Lab colour
# space) equal to the original artwork's suit.
orig = cv2.imread(args.cutout, cv2.IMREAD_UNCHANGED)
o_lab = cv2.cvtColor(orig[..., :3], cv2.COLOR_BGR2LAB).reshape(-1, 3)[(suit(orig[..., :3]) & (orig[..., 3] > 200)).ravel()].astype(float)
s_lab = np.concatenate([
    cv2.cvtColor(f["rgb"], cv2.COLOR_BGR2LAB).reshape(-1, 3)[(suit(f["rgb"]) & (f["alpha"] > 200)).ravel()]
    for fl in frames.values() for f in fl
]).astype(float)
o_mean, o_std, s_mean, s_std = o_lab.mean(0), o_lab.std(0), s_lab.mean(0), s_lab.std(0)

# Size matching: the original character, measured at its on-screen size.
o_h, o_head = body_size(orig[..., 3] > 128)
o_scale = TARGET_W / orig.shape[1]
ORIG_H, ORIG_HEAD = o_h * o_scale, o_head * o_scale

table = {}
for name, cfg in ANIMS.items():
    fl = frames[name]
    ref = [fl[i]["size"] for i in cfg.get("measure", range(len(fl))) if i < len(fl)]
    h_med, head_med = np.median([r[0] for r in ref]), np.median([r[1] for r in ref])
    f_h, f_head = ORIG_H / h_med, ORIG_HEAD / head_med
    scale = f_h if cfg.get("fit") == "side" else (f_h * f_head) ** 0.5

    foot = max(f["foot"] for f in fl)
    cells, top = [], foot
    for f in fl:
        lab = cv2.cvtColor(f["rgb"], cv2.COLOR_BGR2LAB).astype(float)
        weight = cv2.GaussianBlur(suit(f["rgb"]).astype(np.float32), (7, 7), 0)[..., None]
        lab = lab * (1 - weight) + ((lab - s_mean) / s_std * o_std + o_mean) * weight
        rgb = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
        ys, _ = np.where(f["alpha"] > 10)
        top = min(top, ys.min())
        cells.append((rgb, f))
    # strip height: tall enough for the tallest frame (+ a little room)
    CH = max(round(300 * args.hd), int((foot - top) * scale) + 8)
    strip = np.zeros((CH, CW * len(fl), 4), np.uint8)
    for c, (rgb, f) in enumerate(cells):
        h, w = f["alpha"].shape
        nw, nh = round(w * scale), round(h * scale)
        interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
        rgb_s = cv2.resize(rgb, (nw, nh), interpolation=interp)
        al = cv2.resize(f["alpha"], (nw, nh), interpolation=interp)
        if cfg.get("align") == "tip":
            # fin tip = highest point of the suit; put it at (centre, TIP_Y)
            ys, xs = np.where(navy(rgb_s) & (al > 128))
            tip_y, tip_x = ys.min(), xs[ys == ys.min()].mean()
            dy, dx = round(TIP_Y - tip_y), round(CW / 2 - tip_x)
        else:
            # feet on the bottom edge, body centred
            dy, dx = CH - round(foot * scale), round(CW / 2 - f["cx"] * scale)
        ys0, ys1, xs0, xs1 = max(0, -dy), min(nh, CH - dy), max(0, -dx), min(nw, CW - dx)
        cell = np.zeros((CH, CW, 4), np.uint8)
        cell[ys0 + dy:ys1 + dy, xs0 + dx:xs1 + dx] = np.dstack([rgb_s, al])[ys0:ys1, xs0:xs1]
        strip[:, c * CW:(c + 1) * CW] = cell
    Image.fromarray(cv2.cvtColor(strip, cv2.COLOR_BGRA2RGBA)).save(
        os.path.join(args.outdir, name + ".webp"), quality=82, method=6)
    table[name] = dict(frames=len(fl), h=round(CH / args.hd))
    print(f"{name:8} {len(fl)} frames  height {h_med * scale / args.hd:5.0f}  head {head_med * scale / args.hd:5.0f}"
          f"   (original {ORIG_H / args.hd:.0f} / {ORIG_HEAD / args.hd:.0f})")

print("ANIMS =", json.dumps(table))
