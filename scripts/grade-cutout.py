"""Film grade for transparent cutouts (the product cans). The same tone and
colour moves as grade-photo.py (lifted blacks, rolled highlights, a little
desaturation, warm highlights, cool shadows), applied to the colour channels
only; alpha is kept as is. No vignette or halation, since a cutout has no
frame, and no grain, because the catalogue section lays its own grain over
the whole strip.

usage: python -I scripts/grade-cutout.py <in.png> <out.png> [strength]
"""

import sys

import numpy as np
from PIL import Image


def grade_cutout(src: str, dst: str, strength: float = 0.7) -> None:
    im = Image.open(src)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    arr = np.asarray(im).astype(np.float32) / 255.0
    x = arr[..., :3].copy()
    alpha = arr[..., 3]
    k = strength

    # tone: lift the blacks, roll the highlights, gentle S in the mids
    x = x * (1 - 0.07 * k) + 0.07 * k
    knee, ceil = 0.72, 0.96
    hi = x > knee
    x[hi] = knee + (ceil - knee) * (1 - np.exp(-(x[hi] - knee) / (ceil - knee)))
    x = x + k * 0.10 * (x - 0.5) * (1 - np.abs(x - 0.5) * 2)

    # colour: mute a little, warm the highlights, cool the shadows
    lum = x @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    x = x * (1 - 0.14 * k) + lum[..., None] * (0.14 * k)
    shadow_w = np.clip(1 - lum / 0.45, 0, 1)[..., None]
    high_w = np.clip((lum - 0.55) / 0.45, 0, 1)[..., None]
    x = x + shadow_w * np.array([-0.010, 0.004, 0.022], dtype=np.float32) * k
    x = x + high_w * np.array([0.030, 0.012, -0.018], dtype=np.float32) * k
    x = np.clip(x, 0, 1)

    # fully transparent pixels keep their original colour so the edges do not fringe
    x = np.where(alpha[..., None] > 0, x, arr[..., :3])

    out = np.concatenate([x, alpha[..., None]], axis=-1)
    Image.fromarray((out * 255).round().astype(np.uint8), "RGBA").save(dst, optimize=True)
    print(f"{dst}: {im.size[0]}x{im.size[1]}, strength {k}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    grade_cutout(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 0.7)
