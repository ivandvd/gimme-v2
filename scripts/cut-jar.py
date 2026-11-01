"""Cut a supplement jar render out of a plain studio backdrop and frame it on
the 1200x1200 transparent canvas the supplement cards use (jar 88% of the
canvas tall, centred, 6% below). A render that is already cut out
(transparent PNG) is only framed.

The backdrop may be any plain colour with a soft gradient (white, or the
cream of the studio renders): each row's own outer columns give its colour,
and a pixel is jar where it differs from that in chroma (the pastel cap and
bands, the softgels) or in local contrast (the glass edges, which hardly
change the colour but draw a sharp line). Lightness alone does not count,
because the soft cast shadow is only darker, so it goes with the backdrop.
A jar is convex, so every row of it is one span: rows are filled between
their first and last jar pixel, rows the clear glass leaves undetected are
bridged from their neighbours, and the cut stops at the last row where a
sharp edge still reaches most of the jar's width (below that is only
shadow). The edge is pulled in by about a pixel and feathered so no backdrop
fringes the jar on the page.

usage: python -I scripts/cut-jar.py <in> <out.png> [...more pairs]
"""

import sys

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.color import rgb2lab

W = H = 1200
JAR_H = round(H * 0.88)
BOTTOM = round(H * 0.06)
CHROMA = 6.0  # Lab chroma away from the backdrop that counts as jar
CONTRAST = 8.0  # lightness step to the next pixel that counts as an edge
SPECK = 60  # detected blobs smaller than this many pixels are noise


def detect(rgb: np.ndarray) -> np.ndarray:
    """The coloured or sharp-edged pixels: the jar, never its soft shadow."""
    lab = rgb2lab(rgb)
    h, w = lab.shape[:2]
    edge = max(6, w // 40)
    bg = np.median(np.concatenate([lab[:, :edge], lab[:, -edge:]], axis=1), axis=1)
    dc = np.hypot(lab[..., 1] - bg[:, None, 1], lab[..., 2] - bg[:, None, 2])
    grad = np.hypot(ndimage.sobel(lab[..., 0], axis=0), ndimage.sobel(lab[..., 0], axis=1)) / 4
    return despeck((dc > CHROMA) | (grad > CONTRAST))


def despeck(mask: np.ndarray) -> np.ndarray:
    labels, n = ndimage.label(mask)
    if n == 0:
        return mask
    sizes = ndimage.sum(mask, labels, index=np.arange(1, n + 1))
    keep = np.flatnonzero(sizes >= SPECK) + 1
    return np.isin(labels, keep)


def spans(mask: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Per row: whether anything was detected, and the first and last column."""
    h, w = mask.shape
    present = mask.any(axis=1)
    first = mask.argmax(axis=1)
    last = w - 1 - mask[:, ::-1].argmax(axis=1)
    return present, first, last


def jar_alpha(rgb: np.ndarray) -> np.ndarray:
    crisp = detect(rgb)
    h, w = crisp.shape
    present, first, last = spans(crisp)
    if not present.any():
        raise SystemExit("no jar found in front of the backdrop")
    # the jar's extent: from the first detected row to the last row where a
    # sharp edge still spans most of the jar's width (the base rim), not the
    # shadow under it
    width = np.where(present, last - first + 1, 0)
    wide = width >= 0.6 * width.max()
    top = int(np.flatnonzero(present)[0])
    bottom = int(np.flatnonzero(wide)[-1])
    rows = np.arange(top, bottom + 1)
    known = rows[present[top : bottom + 1]]
    f = np.interp(rows, known, first[known])
    l = np.interp(rows, known, last[known])
    cols = np.arange(w)
    solid = np.zeros((h, w), dtype=bool)
    solid[top : bottom + 1] = (cols[None, :] >= np.floor(f)[:, None]) & (cols[None, :] <= np.ceil(l)[:, None])
    # pull the edge in by about a pixel and feather it
    soft = ndimage.gaussian_filter(solid.astype(np.float32), 1.2)
    return np.clip((soft - 0.6) / 0.3, 0.0, 1.0)


def cut(src: str, dst: str) -> None:
    source = Image.open(src)
    if source.mode == "RGBA" and np.asarray(source)[..., 3].min() <= 8:
        # already cut out: keep its own alpha, just frame it
        rgba = np.asarray(source)
    else:
        rgb = np.asarray(source.convert("RGB")).astype(np.float32) / 255.0
        alpha = jar_alpha(rgb)
        rgba = np.dstack([rgb * 255.0, alpha * 255.0]).round().astype(np.uint8)
    solid = rgba[..., 3] > 5
    ys = np.where(solid.any(axis=1))[0]
    xs = np.where(solid.any(axis=0))[0]
    if ys.size == 0:
        raise SystemExit(f"{src}: nothing found in front of the backdrop")
    top, bottom, x0, x1 = int(ys[0]), int(ys[-1]), int(xs[0]), int(xs[-1])
    cut_img = Image.fromarray(rgba, "RGBA").crop((x0, top, x1 + 1, bottom + 1))

    # normalise: jar JAR_H tall, BOTTOM above the canvas edge, centred. Resized
    # premultiplied, so the transparent surround does not bleed into the edge
    scale = JAR_H / (bottom - top + 1)
    size = (round((x1 - x0 + 1) * scale), JAR_H)
    resized = cut_img.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(resized, ((W - size[0]) // 2, H - BOTTOM - JAR_H))
    canvas.save(dst, optimize=True)
    print(f"{dst}: jar x {x0}-{x1}, y {top}-{bottom} of {source.width}x{source.height}, placed {size[0]}x{size[1]}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        cut(args[i], args[i + 1])
