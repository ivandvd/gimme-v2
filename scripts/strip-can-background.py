"""Turn a can render on a white studio background into a transparent PNG.

The can itself is kept fully opaque (found as the tall block of saturated
pixels plus the neutral lid and rim above and below it). Everything outside
that block is converted white-to-alpha, so the soft drop shadow survives as a
semi-transparent dark wash and the white disappears. Framing is kept, so a set
of renders made in the same box stays the same size on the page.

usage: python -I scripts/strip-can-background.py <in.png> <out.png> [...pairs]
"""

import sys

import numpy as np
from PIL import Image


def strip(src: str, dst: str) -> None:
    img = np.asarray(Image.open(src).convert("RGB")).astype(np.int16)
    h, w, _ = img.shape
    dist = (255 - img).max(axis=2)  # distance from pure white, 0..255
    sat = img.max(axis=2) - img.min(axis=2)  # 0 for neutral greys and whites

    # the can's columns: tall stacks of clearly non-white pixels
    col = (dist > 60).sum(axis=0)
    cols = np.where(col > 0.3 * h)[0]
    if cols.size == 0:
        raise SystemExit(f"{src}: no can found")
    x0, x1 = int(cols[0]), int(cols[-1])
    inner = slice(x0, x1 + 1)
    width = x1 - x0 + 1

    # the coloured body rows, then the neutral lid and rim above and below it:
    # metal rows carry dark edge lines (lum < 150), the soft shadow never does
    colored = (sat[:, inner] > 25).sum(axis=1) > 0.2 * width
    rows = np.where(colored)[0]
    body_top, body_bottom = int(rows[0]), int(rows[-1])
    # above the body nothing but the lid is non-white, so take its first row
    non_bg = (dist[:, inner] > 30).sum(axis=1) > 0.2 * width
    top = int(np.where(non_bg[:body_top])[0][0]) if non_bg[:body_top].any() else body_top
    # below the body the shadow is non-white too, so walk down only while
    # the rows still carry the rim's dark edge lines
    lum = img.mean(axis=2)
    core = slice(x0 + width // 5, x1 - width // 5)
    dark = (lum[:, core] < 150).mean(axis=1)
    bottom = body_bottom
    while bottom < h - 1 and dark[bottom + 1] > 0.05:
        bottom += 1
    lid = body_top - top

    # white-to-alpha everywhere (ignoring the first few levels of near-white
    # noise so the empty background goes fully clear), then force the can
    # block opaque
    alpha = np.clip((dist.astype(np.float32) - 6.0) / 249.0, 0.0, 1.0)
    rgb = img.astype(np.float32)
    safe = np.where(alpha > 0, alpha, 1.0)[..., None]
    unpremul = 255.0 - (255.0 - rgb) / safe
    out_rgb = np.clip(unpremul, 0, 255)
    out_a = alpha.copy()

    box = np.zeros((h, w), dtype=bool)
    box[top : bottom + 1, inner] = True
    out_rgb[box] = rgb[box]
    out_a[box] = 1.0
    # let true background white through at the rounded rim corners
    band = np.zeros((h, w), dtype=bool)
    band_h = max(2, int(lid * 1.2))
    band[top : top + band_h, inner] = True
    band[max(top, bottom - band_h) : bottom + 1, inner] = True
    corner_white = band & (dist < 5)
    out_a[corner_white] = 0.0

    rgba = np.dstack([out_rgb, out_a * 255.0]).round().astype(np.uint8)

    # crop every render to the same tight window around the can (a fixed
    # size, centred on the can, so the whole set keeps one scale): the can
    # fills about 85% of the width, with room below for the shadow
    crop_w, crop_h = CROP
    left = min(max(0, (x0 + x1) // 2 - crop_w // 2), w - crop_w)
    top_c = min(max(0, top - 25), h - crop_h)
    rgba = rgba[top_c : top_c + crop_h, left : left + crop_w]
    Image.fromarray(rgba, "RGBA").save(dst, optimize=True)
    print(f"{dst}: can x {x0}-{x1}, y {top}-{bottom} (lid {lid}px) of {w}x{h}; cropped to {crop_w}x{crop_h} at ({left},{top_c})")


CROP = (590, 1310)


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        strip(args[i], args[i + 1])
