"""Give a photo the site's film look: lifted blacks, rolled-off highlights,
slightly muted colour, warm highlights and teal shadows, fine grain, a hint
of halation and a soft vignette. Strength 1.0 is the house grade; lower it
for a lighter touch.

usage: python -I scripts/grade-photo.py <in> <out.jpg> [strength] [--compare out.jpg]
"""

import sys

import numpy as np
from PIL import Image, ImageFilter


def grade(src: str, dst: str, strength: float = 1.0, compare: str | None = None) -> None:
    im = Image.open(src).convert("RGB")
    orig = np.asarray(im).astype(np.float32) / 255.0
    x = orig.copy()
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

    # halation: the brightest areas bloom softly
    bright = np.clip((lum - 0.80) / 0.20, 0, 1)
    glow = Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=max(6, im.width // 90)))
    glow = np.asarray(glow).astype(np.float32) / 255.0
    x = np.clip(x + glow[..., None] * np.array([0.10, 0.06, 0.02], dtype=np.float32) * k, 0, 1)

    # vignette
    h, w = lum.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r2 = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2
    x = x * (1 - 0.16 * k * np.clip(r2, 0, 1.4) / 1.4)[..., None]

    # grain: fine, luminance only, a little stronger in the mids and shadows
    rng = np.random.default_rng(7)
    noise = rng.normal(0, 0.028 * k, size=(h, w)).astype(np.float32)
    amount = (0.55 + 0.45 * (1 - lum))
    x = np.clip(x + (noise * amount)[..., None], 0, 1)

    out = Image.fromarray((x * 255).round().astype(np.uint8))
    out.save(dst, quality=90, optimize=True, progressive=True)
    print(f"{dst}: {out.size[0]}x{out.size[1]}, strength {k}")
    if compare:
        side = Image.new("RGB", (im.width, im.height))
        side.paste(im.crop((0, 0, im.width // 2, im.height)), (0, 0))
        side.paste(out.crop((im.width // 2, 0, im.width, im.height)), (im.width // 2, 0))
        side.save(compare, quality=88)
        print(f"{compare}: left half original, right half graded")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 2:
        raise SystemExit(__doc__)
    comp = a[a.index("--compare") + 1] if "--compare" in a else None
    strength = float(a[2]) if len(a) > 2 and a[2] != "--compare" else 1.0
    grade(a[0], a[1], strength, comp)
