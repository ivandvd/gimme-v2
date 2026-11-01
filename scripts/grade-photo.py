"""Give a photo the site's film look: lifted blacks, rolled-off highlights,
slightly muted colour, warm highlights and teal shadows, a hint of halation,
a soft vignette and a fine grain. Strength 1.0 is the house grade; lower it
for a lighter touch.

The grain has its own knob and the house setting is now 0: the first batch
(autumn 2026) used 0.028, which the owner found rough, and on 2026-11-01 he
asked for clean photos, no grain at all. scripts/regrain.py takes it out of
already-graded files.

usage: python -I scripts/grade-photo.py <in> <out.jpg> [strength] [--grain 0] [--compare out.jpg]
"""

import sys

import numpy as np
from PIL import Image, ImageFilter

GRAIN = 0.0


def grade_array(orig: np.ndarray, strength: float = 1.0, grain: float = GRAIN) -> np.ndarray:
    """The grade on a float32 HxWx3 array in 0..1; returns the same shape."""
    x = orig.copy()
    k = strength
    h, w = x.shape[:2]

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
    glow = Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=max(6, w // 90)))
    glow = np.asarray(glow).astype(np.float32) / 255.0
    x = np.clip(x + glow[..., None] * np.array([0.10, 0.06, 0.02], dtype=np.float32) * k, 0, 1)

    # vignette
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r2 = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2
    x = x * (1 - 0.16 * k * np.clip(r2, 0, 1.4) / 1.4)[..., None]

    # grain: fine, luminance only, a little stronger in the mids and shadows
    if grain > 0:
        rng = np.random.default_rng(7)
        noise = rng.normal(0, grain * k, size=(h, w)).astype(np.float32)
        amount = 0.55 + 0.45 * (1 - lum)
        x = np.clip(x + (noise * amount)[..., None], 0, 1)
    return x


def grade_image(im: Image.Image, strength: float = 1.0, grain: float = GRAIN) -> Image.Image:
    arr = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    return Image.fromarray((grade_array(arr, strength, grain) * 255).round().astype(np.uint8))


def save(im: Image.Image, dst: str) -> None:
    """jpg: quality 90, progressive; webp: quality 90, slow encoder."""
    if dst.lower().endswith(".webp"):
        im.save(dst, quality=90, method=6)
    else:
        im.save(dst, quality=90, optimize=True, progressive=True)


def grade(src: str, dst: str, strength: float = 1.0, compare: str | None = None, grain: float = GRAIN) -> None:
    im = Image.open(src).convert("RGB")
    out = grade_image(im, strength, grain)
    save(out, dst)
    print(f"{dst}: {out.size[0]}x{out.size[1]}, strength {strength}, grain {grain}")
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
    grain = float(a[a.index("--grain") + 1]) if "--grain" in a else GRAIN
    strength = float(a[2]) if len(a) > 2 and not a[2].startswith("--") else 1.0
    grade(a[0], a[1], strength, comp, grain)
