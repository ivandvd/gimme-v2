"""Cut a supplement jar render out of its white backdrop and frame it on the
1200x1200 transparent canvas the supplement cards use (jar and capsules 88%
of the canvas tall, centred, 6% below), like the first jars were.

The backdrop is every near-white pixel connected to the picture's edge, so
the frosted jar body and the light glass band, which are walled in by the
jar's outline, stay. Soft cast shadows on the white are near-white too and
go with the backdrop; the edge is feathered by a pixel so nothing fringes on
the cream card.

usage: python -I scripts/cut-jar.py <in> <out.png> [...more pairs]
"""

import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

W = H = 1200
JAR_H = round(H * 0.88)
BOTTOM = round(H * 0.06)
TOLERANCE = 18  # levels below white that still count as backdrop


def cut(src: str, dst: str) -> None:
    img = np.asarray(Image.open(src).convert("RGB")).astype(np.int16)
    near_white = (255 - img.min(axis=2)) <= TOLERANCE
    labels, _ = ndimage.label(near_white)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    backdrop = np.isin(labels, edge[edge != 0])
    mask = Image.fromarray(np.where(backdrop, 0, 255).astype(np.uint8))
    # drop stray specks of backdrop-coloured pixels inside, and of jar outside
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    solid = np.asarray(mask) > 127
    ys = np.where(solid.any(axis=1))[0]
    xs = np.where(solid.any(axis=0))[0]
    if ys.size == 0:
        raise SystemExit(f"{src}: nothing found in front of the backdrop")
    top, bottom, x0, x1 = int(ys[0]), int(ys[-1]), int(xs[0]), int(xs[-1])

    soft = np.asarray(mask.filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32) / 255.0
    alpha = np.clip((soft - 0.35) / 0.3, 0.0, 1.0)
    rgba = np.dstack([img, alpha * 255.0]).round().astype(np.uint8)
    cut_img = Image.fromarray(rgba, "RGBA").crop((x0, top, x1 + 1, bottom + 1))

    scale = JAR_H / (bottom - top + 1)
    size = (round((x1 - x0 + 1) * scale), JAR_H)
    resized = cut_img.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(resized, ((W - size[0]) // 2, H - BOTTOM - JAR_H))
    canvas.save(dst, optimize=True)
    print(f"{dst}: subject x {x0}-{x1}, y {top}-{bottom} of {img.shape[1]}x{img.shape[0]}, placed {size[0]}x{size[1]}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        cut(args[i], args[i + 1])
