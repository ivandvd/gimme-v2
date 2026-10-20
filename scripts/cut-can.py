"""Cut a can render out of a plain studio backdrop (white or tinted paper) and
normalise it onto the shared 590x1310 canvas used by the product carousel.

The backdrop colour is read from the picture's own border, so a warm or grey
studio background works as well as pure white. The can itself (body, lid and
base rim) stays fully opaque; everything around it becomes transparent, except
the soft contact shadow, which is kept as a translucent black wash. Every
output has the can 499 px wide with its lid 25 px from the top, so a set of
renders made at different sizes lines up on the page.

usage: python -I scripts/cut-can.py <in.png> <out.png> [...more pairs]
"""

import sys

import numpy as np
from PIL import Image

W, H, CAN_W, TOP = 590, 1310, 499, 25


def cut(src: str, dst: str) -> None:
    img = np.asarray(Image.open(src).convert("RGB")).astype(np.int16)
    h, w, _ = img.shape

    # the backdrop colour, from a frame around the picture
    frame = np.concatenate(
        [img[:20].reshape(-1, 3), img[-20:].reshape(-1, 3), img[:, :20].reshape(-1, 3), img[:, -20:].reshape(-1, 3)]
    )
    bg = np.median(frame, axis=0)
    dist = np.abs(img - bg).max(axis=2)  # how far each pixel is from the backdrop
    sat = img.max(axis=2) - img.min(axis=2)
    lum = img.mean(axis=2)
    bg_lum = float(bg.mean())

    # the can's columns: tall stacks of pixels that are clearly not backdrop
    cols = np.where((dist > 60).sum(axis=0) > 0.3 * h)[0]
    if cols.size == 0:
        raise SystemExit(f"{src}: no can found")
    x0, x1 = int(cols[0]), int(cols[-1])
    width = x1 - x0 + 1
    inner = slice(x0, x1 + 1)

    # the coloured body: rows where a fifth of the width is both clearly not
    # backdrop and clearly more saturated than the backdrop (warm paper has a
    # little saturation of its own, so the comparison is relative)
    bg_sat = float(bg.max() - bg.min())
    body_px = (dist[:, inner] > 40) & (sat[:, inner] > bg_sat + 15)
    rows = np.where(body_px.sum(axis=1) > 0.2 * width)[0]
    if rows.size == 0:
        raise SystemExit(f"{src}: no coloured body found")
    body_top, body_bottom = int(rows[0]), int(rows[-1])
    # the neutral lid above and rim below carry dark edge lines; the lid is
    # also plainly not backdrop, which the soft shadow underneath is not
    core = slice(x0 + width // 5, x1 - width // 5)
    dark = (lum[:, core] < 150).mean(axis=1)
    non_bg = (dist[:, core] > 18).mean(axis=1)
    top = body_top
    while top > 0 and (dark[top - 1] > 0.05 or non_bg[top - 1] > 0.5):
        top -= 1
    bottom = body_bottom
    while bottom < h - 1 and dark[bottom + 1] > 0.05:
        bottom += 1
    lid = body_top - top

    # outside the can: only the contact shadow survives, as translucent black.
    # It is read only in a zone under and beside the base, with a noise floor
    # so the backdrop's own grain never leaks through as a haze.
    shadow = np.clip((bg_lum - lum - 12.0) / 60.0, 0.0, 1.0) * 0.85
    # a feathered zone: full strength directly under the can, fading out over
    # a third of the can's width to each side and over a quarter of it above
    # the base, so a shadow cast sideways by the studio light thins away
    # instead of ending in a hard edge or spreading as a smear
    xs = np.arange(w, dtype=np.float32)
    side = width / 3.0
    fx = np.clip(np.minimum(xs - (x0 - side), (x1 + side) - xs) / side, 0.0, 1.0)
    ys = np.arange(h, dtype=np.float32)
    fy = np.clip((ys - (body_bottom - width / 4.0)) / (width / 4.0), 0.0, 1.0)
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    shadow *= fy[:, None] * fx[None, :]
    out_rgb = np.zeros((h, w, 3), dtype=np.float32)
    out_a = shadow.astype(np.float32)

    box = np.zeros((h, w), dtype=bool)
    box[top : bottom + 1, inner] = True
    out_rgb[box] = img[box]
    out_a[box] = 1.0

    # the rounded corners of the lid and base show backdrop inside the box
    band_h = max(4, int(lid * 1.5))
    edge = max(6, width // 8)
    for y0, y1 in ((top, top + band_h), (max(top, bottom - band_h), bottom + 1)):
        for xs in (slice(x0, x0 + edge), slice(x1 - edge + 1, x1 + 1)):
            patch = dist[y0:y1, xs] < 10
            sub = out_a[y0:y1, xs]
            sub[patch] = 0.0
            out_a[y0:y1, xs] = sub

    rgba = np.dstack([out_rgb, out_a * 255.0]).round().astype(np.uint8)
    cut_img = Image.fromarray(rgba, "RGBA")

    # normalise: can 499 px wide, lid 25 px from the top, centred
    scale = CAN_W / width
    resized = cut_img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx = round((x0 + x1) / 2 * scale)
    canvas.alpha_composite(resized, (W // 2 - cx, TOP - round(top * scale)))
    canvas.save(dst, optimize=True)
    print(
        f"{dst}: backdrop #{int(bg[0]):02X}{int(bg[1]):02X}{int(bg[2]):02X}, "
        f"can x {x0}-{x1}, y {top}-{bottom} (lid {lid}px) of {w}x{h}, scale {scale:.3f}"
    )


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        cut(args[i], args[i + 1])
