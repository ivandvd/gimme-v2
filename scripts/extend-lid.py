"""Give a render whose box lid runs into the top edge some air above it.

The three-quarter Duo renders were framed with the lid's far edge at, or a
hair beyond, the top of the picture, so square-pack.py could put no air
above them and their hover views sat high in the card. This continues the
backdrop upward by `rows` (its vertical gradient extrapolated, its left to
right variation kept, cross-faded into the picture) and, in the columns
where the lid touched the edge, extends the lid up to its own top edge, a
line fitted on the part of that edge that is visible, with the edge's
highlight copied from there. The result goes through square-pack.py like
any other render.

usage: python -I scripts/extend-lid.py [--rows 320] <in.png> <out.png> [...more pairs]
"""

import sys

import numpy as np
from PIL import Image, ImageFilter

EDGE = 24  # levels from the backdrop at which a pixel counts as subject


def extend(src: str, dst: str, rows: int = 320) -> None:
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    margin = w // 50
    bg_row = np.median(np.concatenate([a[:, :margin], a[:, -margin:]], axis=1), axis=1)
    subj = np.abs(a - bg_row[:, None, :]).max(axis=2) > EDGE
    # the lid's span: columns the subject occupies in the top rows
    occ = np.where(subj[:200].mean(axis=0) > 0.05)[0]
    lid_cols = np.zeros(w, bool)
    if occ.size:
        lid_cols[max(0, occ[0] - 20) : min(w, occ[-1] + 21)] = True
    bg_cols = np.where(~lid_cols)[0]
    # the backdrop's vertical gradient, from its top 80 rows, and its top colour
    # per column (the lid's columns interpolated across from the sides)
    k = np.arange(80)
    rowmean = a[:80][:, bg_cols].mean(axis=1)
    slope = np.array([np.polyfit(k, rowmean[:, c], 1)[0] for c in range(3)], np.float32)
    top = np.median(a[:6], axis=0)
    for c in range(3):
        top[lid_cols, c] = np.interp(np.where(lid_cols)[0], bg_cols, top[bg_cols, c])
    band = top[None, :, :] - slope[None, None, :] * (rows - np.arange(rows))[:, None, None]
    band = np.asarray(Image.fromarray(band.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=max(6, w // 150)))).astype(np.float32)
    # cross-fade the band's last rows into the picture's first row
    for i in range(12):
        t = (i + 1) / 13
        band[rows - 12 + i] = band[rows - 12 + i] * (1 - t) + a[0] * t
    # the lid's top boundary per column; where it is row 0 the lid is cut
    ytop = np.full(w, -1)
    for x in np.where(lid_cols)[0]:
        r = np.where(subj[:200, x])[0]
        if r.size and subj[r[0] : r[0] + 12, x].mean() > 0.8:
            ytop[x] = r[0]
    cut = np.where(ytop == 0)[0]
    if cut.size:
        left = np.where((ytop >= 3) & (np.arange(w) < cut[0]))[0][-160:]
        s, b = np.linalg.lstsq(np.vstack([left, np.ones_like(left)]).T, ytop[left], rcond=None)[0]
        edge_line = np.median(np.stack([a[ytop[x], x] for x in left[-40:]]), axis=0)  # the cardboard edge's colour
        added = 0
        for x in cut:
            up = int(round(-(s * x + b)))
            up = max(1, min(up, rows - 2))
            added = max(added, up)
            face = np.median(a[0:4, x], axis=0)
            band[rows - up : rows, x] = face
            band[rows - up - 1, x] = edge_line
        print(f"  {src}: lid touched the edge over {cut.size} columns; extended by up to {added} rows along its edge (slope {s:.3f})")
    out = np.concatenate([band, a], axis=0).clip(0, 255).astype(np.uint8)
    Image.fromarray(out).save(dst)
    print(f"{dst}: {w}x{h} -> {w}x{h + rows}")


if __name__ == "__main__":
    args = sys.argv[1:]
    rows = 320
    if args[:1] == ["--rows"]:
        rows = int(args[1])
        args = args[2:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        extend(args[i], args[i + 1], rows)
