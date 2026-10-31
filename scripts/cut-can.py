"""Cut a can render out of a plain studio backdrop (white or tinted paper) and
normalise it onto the shared 600x1384 canvas used by the product carousel.

The backdrop colour is read from the picture's own border, so a warm or grey
studio background works as well as pure white. Whatever the backdrop reaches
from the edge of the picture becomes transparent and the rest stays opaque, so
the render should have no cast shadow (one would be cut as part of the can).
Every output has the can 1300 px tall with its lid 11 px from the top, so a set
of renders made at different sizes lines up on the page, lids and bases both.

usage: python -I scripts/cut-can.py <in.png> <out.png> [...more pairs]
"""

import sys

import numpy as np
from PIL import Image, ImageFilter

W, H, CAN_H, TOP = 600, 1384, 1300, 11
EDGE = 12  # levels from the backdrop at which a pixel counts as can


def cut(src: str, dst: str) -> None:
    img = np.asarray(Image.open(src).convert("RGB")).astype(np.int16)

    # the backdrop colour, from a frame around the picture
    frame = np.concatenate(
        [img[:20].reshape(-1, 3), img[-20:].reshape(-1, 3), img[:, :20].reshape(-1, 3), img[:, -20:].reshape(-1, 3)]
    )
    bg = np.median(frame, axis=0)
    near = np.abs(img - bg).max(axis=2) <= EDGE

    # outside the can: every pixel the backdrop reaches in a straight line from
    # the picture's edge. A can is convex, so that is all of the outside, and
    # the pale label and the lid's highlights, walled in by the can's shaded
    # edge, stay inside
    outside = (
        np.logical_and.accumulate(near, axis=0)
        | np.logical_and.accumulate(near[::-1], axis=0)[::-1]
        | np.logical_and.accumulate(near, axis=1)
        | np.logical_and.accumulate(near[:, ::-1], axis=1)[:, ::-1]
    )
    # drop stray specks, which a straight-line reach cannot clear
    mask = Image.fromarray(np.where(outside, 0, 255).astype(np.uint8))
    mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    solid = np.asarray(mask) > 127
    ys = np.where(solid.any(axis=1))[0]
    xs = np.where(solid.any(axis=0))[0]
    if ys.size == 0:
        raise SystemExit(f"{src}: no can found")
    top, bottom, x0, x1 = int(ys[0]), int(ys[-1]), int(xs[0]), int(xs[-1])

    # pull the edge in by a pixel and feather it, so none of the backdrop shows
    # as a light fringe on a coloured page
    soft = np.asarray(mask.filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255.0
    alpha = np.clip((soft - 0.69) / 0.24, 0.0, 1.0)
    rgba = np.dstack([img, alpha * 255.0]).round().astype(np.uint8)
    cut_img = Image.fromarray(rgba, "RGBA").crop((x0, top, x1 + 1, bottom + 1))

    # normalise: can 1300 px tall, lid 11 px from the top, centred. Resized
    # premultiplied, so the transparent surround does not bleed into the edge
    scale = CAN_H / (bottom - top + 1)
    size = (round((x1 - x0 + 1) * scale), CAN_H)
    resized = cut_img.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(resized, ((W - size[0]) // 2, TOP))
    canvas.save(dst, optimize=True)
    print(
        f"{dst}: backdrop #{int(bg[0]):02X}{int(bg[1]):02X}{int(bg[2]):02X}, "
        f"can x {x0}-{x1}, y {top}-{bottom} of {img.shape[1]}x{img.shape[0]}, "
        f"{size[0]}x{size[1]} at scale {scale:.3f}"
    )


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        cut(args[i], args[i + 1])
