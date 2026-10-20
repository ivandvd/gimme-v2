"""Extend a photo upward (and/or downward) by stretching its edge rows, so a
wide picture gains headroom without cropping its subject. The added band is
the outermost rows smeared outward and blurred, which reads as more of the
same sky, wall or floor; a gentle gradient blends the seam.

usage: python -I scripts/extend-canvas.py <in> <out> <top_px> [bottom_px]
"""

import sys

import numpy as np
from PIL import Image, ImageFilter


def extend(src: str, dst: str, top: int, bottom: int = 0) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    out = Image.new("RGB", (w, h + top + bottom))
    out.paste(im, (0, top))

    def band(rows: Image.Image, height: int, flip: bool) -> Image.Image:
        # stretch the edge rows to the band height, then blur so no single row shows
        strip = rows.resize((w, height), Image.BILINEAR)
        strip = strip.filter(ImageFilter.GaussianBlur(radius=max(8, w // 120)))
        arr = np.asarray(strip).astype(np.float32)
        # fade a little darker toward the far edge, like a vignette, so the
        # extension never reads brighter than the picture
        fade = np.linspace(1.0, 0.88, height, dtype=np.float32)
        if flip:
            fade = fade[::-1]
        arr = arr * fade[:, None, None]
        return Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    if top:
        src_rows = im.crop((0, 0, w, max(2, h // 40)))
        out.paste(band(src_rows, top, flip=True), (0, 0))
    if bottom:
        src_rows = im.crop((0, h - max(2, h // 40), w, h))
        out.paste(band(src_rows, bottom, flip=False), (0, h + top))

    # crossfade the photo into the band over a few rows so the seam never shows
    arr = np.asarray(out).astype(np.float32)
    k = max(6, h // 60)
    if top:
        for i in range(k):
            a = (i + 1) / (k + 1)
            arr[top + i] = arr[top + i] * a + arr[top - 1] * (1 - a)
    if bottom:
        for i in range(k):
            a = (i + 1) / (k + 1)
            y = top + h - 1 - i
            arr[y] = arr[y] * a + arr[top + h] * (1 - a)
    out = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    out.save(dst, quality=95)
    print(f"{dst}: {w}x{h} -> {out.size[0]}x{out.size[1]} (top +{top}, bottom +{bottom})")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 3:
        raise SystemExit(__doc__)
    extend(a[0], a[1], int(a[2]), int(a[3]) if len(a) > 3 else 0)
