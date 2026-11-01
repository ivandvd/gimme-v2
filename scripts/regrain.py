"""Bring every graded photo under public/.../shared to the lighter house grain
(see grade-photo.py). Two cases:

* the un-graded original sits next to the graded file (the avatars, the packs,
  the supplement scenes, the Calm accordion photo): the grade is applied again
  from the original, at the strength that best matches the existing file, with
  the new grain;
* only the graded file exists (the three hero photos, the banner, beach and
  fridge shots, the on-ice tiles, the social cards, the benefit covers): the
  old grain is taken out of the luminance with non-local means and the finer
  grain is laid on top. Colour and tone are left as they are.

Outputs take the `-grade` suffix in place of `-film` (the hero files gain it),
so no cache anywhere keeps serving the old files, and the old files are
removed. Cut-outs (`-film.png`) carry no grain and are left alone.

usage: python -I scripts/regrain.py [--grain 0.008] [--dry-run] [--keep]
"""

import importlib.util
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from skimage.restoration import denoise_nl_means

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("grade_photo", HERE / "grade-photo.py")
grade_photo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(grade_photo)

ROOT = HERE.parent / "public" / "sites" / "vibebevvy-com-5acc75fc" / "shared"
# graded in place without the -film suffix
HERO = [ROOT / "photos" / f"gimme-hero-{name}.webp" for name in ("pool-2", "car", "focus")]
ORIGINAL_EXTS = (".jpg", ".jpeg", ".png", ".webp")


def noise_sigma(im: Image.Image) -> float:
    """Immerkaer's estimate of the noise level in levels of 255 (texture counts too)."""
    g = np.asarray(im.convert("L")).astype(np.float32)
    c = (
        g[:-2, :-2] - 2 * g[:-2, 1:-1] + g[:-2, 2:]
        - 2 * g[1:-1, :-2] + 4 * g[1:-1, 1:-1] - 2 * g[1:-1, 2:]
        + g[2:, :-2] - 2 * g[2:, 1:-1] + g[2:, 2:]
    )
    return math.sqrt(math.pi / 2) * float(np.abs(c).mean()) / 6.0


def fit_strength(original: Image.Image, graded: Image.Image) -> float:
    """The grade strength that reproduces `graded` from `original` best, judged
    on a small, blurred copy so the old grain does not take part."""

    def small(im: Image.Image) -> np.ndarray:
        w = min(600, im.width)
        im = im.convert("RGB").resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        return np.asarray(im.filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255.0

    o, g = small(original), small(graded)
    best = min((float(np.abs(grade_photo.grade_array(o, k, 0.0) - g).mean()), k) for k in np.arange(0.3, 1.251, 0.05))
    return round(best[1], 2)


def regrain(im: Image.Image, grain: float) -> tuple[Image.Image, float]:
    """Take the old grain out of the luminance and put the fine one on; the
    chroma planes are untouched. Returns the image and the noise it removed."""
    ycc = np.asarray(im.convert("YCbCr")).astype(np.float32) / 255.0
    y = ycc[..., 0]
    h, w = y.shape
    even = y[: h // 2 * 2, : w // 2 * 2]
    # Donoho's estimate on the diagonal Haar detail: robust to picture texture
    detail = (even[0::2, 0::2] - even[0::2, 1::2] - even[1::2, 0::2] + even[1::2, 1::2]) / 2.0
    sigma = float(np.median(np.abs(detail)) / 0.6745)
    clean = denoise_nl_means(y, h=0.8 * sigma, sigma=sigma, fast_mode=True, patch_size=5, patch_distance=6)
    rng = np.random.default_rng(7)
    amount = 0.55 + 0.45 * (1 - clean)  # as in the grade: a little more in the shadows
    out = ycc.copy()
    out[..., 0] = np.clip(clean + rng.normal(0, grain, size=y.shape).astype(np.float32) * amount, 0, 1)
    return Image.fromarray((out * 255).round().astype(np.uint8), "YCbCr").convert("RGB"), sigma * 255


def targets() -> list[Path]:
    films = sorted(p for p in ROOT.rglob("*-film.*") if p.suffix.lower() in (".jpg", ".jpeg", ".webp"))
    return films + [p for p in HERO if p.exists()]


def main(argv: list[str]) -> None:
    grain = float(argv[argv.index("--grain") + 1]) if "--grain" in argv else grade_photo.GRAIN
    dry = "--dry-run" in argv
    keep = "--keep" in argv
    rows = []
    for src in targets():
        stem = src.name[: -len(src.suffix)]
        base = stem[:-5] if stem.endswith("-film") else stem
        dst = src.with_name(f"{base}-grade{src.suffix}")
        original = next((c for c in (src.with_name(base + ext) for ext in ORIGINAL_EXTS) if c.exists() and c != src), None)
        graded = Image.open(src).convert("RGB")
        before = noise_sigma(graded)
        if original is not None:
            k = fit_strength(Image.open(original), graded)
            out = grade_photo.grade_image(Image.open(original), k, grain)
            how = f"regraded from {original.name} at {k:.2f}"
        else:
            out, removed = regrain(graded, grain)
            how = f"denoised (removed sigma {removed:.1f})"
        if not dry:
            grade_photo.save(out, str(dst))
            if not keep:
                src.unlink()
        after = noise_sigma(out)
        rows.append((str(src.relative_to(ROOT)).replace("\\", "/"), dst.name, before, after, how))
        print(f"{rows[-1][0]:<52} -> {dst.name:<44} noise {before:5.2f} -> {after:4.2f}  {how}")
    print(f"{len(rows)} files, grain {grain}{' (dry run)' if dry else ''}")


if __name__ == "__main__":
    main(sys.argv[1:])
