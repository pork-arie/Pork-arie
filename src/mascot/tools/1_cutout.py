"""Step 1 - cut the character out of a picture (remove the background).

Usage:
    python 1_cutout.py source/mascot-art.webp out/cutout.png --box 125 55 800 935

--box is a rectangle (left top right bottom, in pixels) around the character.
Open the picture in any image viewer to read the coordinates.

How it works: OpenCV's GrabCut. We tell it "the border of the box is surely
background, the dark-blue suit and the face centre are surely the character",
and it works out the rest by learning the colours of each side.
"""
import argparse

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("image")
ap.add_argument("out")
ap.add_argument("--box", type=int, nargs=4, required=True, metavar=("X0", "Y0", "X1", "Y1"))
args = ap.parse_args()

img = cv2.imread(args.image)
x0, y0, x1, y1 = args.box
crop = img[y0:y1, x0:x1].copy()
h, w = crop.shape[:2]

# 1. Hints for GrabCut: "probably background" everywhere to start with...
mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
# ...saturated, darker pixels (the navy suit) are probably the character...
navy = (hsv[..., 1] > 110) & (hsv[..., 2] < 215)
mask[navy] = cv2.GC_PR_FGD
mask[cv2.erode(navy.astype(np.uint8), np.ones((9, 9))) > 0] = cv2.GC_FGD
# ...the middle of the face is surely the character...
cv2.ellipse(mask, (w * 59 // 100, h * 56 // 100), (150, 110), 0, 0, 360, int(cv2.GC_FGD), -1)
# ...and the edge of the box is surely background.
mask[:6, :] = mask[-6:, :] = cv2.GC_BGD
mask[:, :6] = mask[:, -6:] = cv2.GC_BGD

# 2. Let GrabCut decide every "probably" pixel.
bg, fg = np.zeros((1, 65)), np.zeros((1, 65))
cv2.grabCut(crop, mask, None, bg, fg, 6, cv2.GC_INIT_WITH_MASK)
alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

# 3. Clean up: keep the biggest blob, fill holes, soften the edge.
n, lab, st, _ = cv2.connectedComponentsWithStats(alpha)
alpha = np.where(lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
cnts, _ = cv2.findContours(alpha, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
alpha = np.zeros_like(alpha)
cv2.drawContours(alpha, cnts, -1, 255, -1)
alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
alpha = cv2.GaussianBlur(alpha, (5, 5), 0)

# 4. Trim to the character and save as a transparent PNG.
ys, xs = np.where(alpha > 0)
rgba = np.dstack([crop, alpha])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
cv2.imwrite(args.out, rgba)
print("saved", args.out, rgba.shape[1], "x", rgba.shape[0])
