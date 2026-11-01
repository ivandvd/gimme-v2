"""Bring every graded photo under public/.../shared to a fraction of its
grain (default: keep 25%). Two cases:

* the un-graded original sits next to the graded file (the avatars, the packs,
  the supplement scenes, the Calm accordion photo): the grade is applied again
  from the original, at the strength that best matches the existing file, with
  the grain scaled down;
* only the graded file exists (the three hero photos, the banner, beach and
  fridge shots, the on-ice tiles, the social cards, the benefit covers): the
  luminance is denoised with non-local means and the result blended with the
  file, `keep` parts file to `1 - keep` parts denoised. The file keeps that
  share of everything, texture included, so nothing is smoothed away as it
  was in the first, rejected attempt (which removed all grain and added a
  synthetic one). The grain level is read from flat areas only, so picture
  texture does not inflate it. Colour and tone are not touched.

Outputs take a `-g<percent>` suffix in place of `-film` (the hero files gain
it) so no cache anywhere keeps serving the old files, and the old files are
removed. Cut-outs (`-film.png`) carry no grain and are left alone.

usage: python -I scripts/regrain.py [--keep 0.25] [--dry-run] [--keep-sources]
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
# the grain the first batch was graded with (grade-photo.py, autumn 2026)
OLD_GRAIN = 0.028


def flat_sigma(y: np.ndarray) -> float:
    """Noise level of a float 0..1 plane, from its flattest 16x16 blocks: the
    diagonal Haar detail of white noise has the noise's own sigma, and the
    blocks with the least of it hold grain and nothing else."""
    h, w = y.shape
    e = y[: h // 2 * 2, : w // 2 * 2]
    detail = (e[0::2, 0::2] - e[0::2, 1::2] - e[1::2, 0::2] + e[1::2, 1::2]) / 2.0
    bh, bw = detail.shape[0] // 8, detail.shape[1] // 8
    blocks = detail[: bh * 8, : bw * 8].reshape(bh, 8, bw, 8).std(axis=(1, 3))
    return float(np.percentile(blocks, 20))


def noise_sigma(im: Image.Image) -> float:
    """Flat-area grain in levels of 255, for the report."""
    return flat_sigma(np.asarray(im.convert("L")).astype(np.float32) / 255.0) * 255


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


def soften_grain(im: Image.Image, keep: float) -> tuple[Image.Image, float]:
    """Keep `keep` of the file's grain: denoise the luminance gently and blend
    the file back over it. Chroma planes are untouched."""
    ycc = np.asarray(im.convert("YCbCr")).astype(np.float32) / 255.0
    y = ycc[..., 0]
    sigma = flat_sigma(y)
    clean = denoise_nl_means(y, h=1.0 * sigma, sigma=sigma, fast_mode=True, patch_size=5, patch_distance=6)
    out = ycc.copy()
    out[..., 0] = np.clip(keep * y + (1 - keep) * clean, 0, 1)
    return Image.fromarray((out * 255).round().astype(np.uint8), "YCbCr").convert("RGB"), sigma * 255


def targets() -> list[Path]:
    films = sorted(p for p in ROOT.rglob("*-film.*") if p.suffix.lower() in (".jpg", ".jpeg", ".webp"))
    return films + [p for p in HERO if p.exists()]


def main(argv: list[str]) -> None:
    keep = float(argv[argv.index("--keep") + 1]) if "--keep" in argv else 0.25
    suffix = f"-g{round(keep * 100)}"
    dry = "--dry-run" in argv
    keep_sources = "--keep-sources" in argv
    count = 0
    for src in targets():
        stem = src.name[: -len(src.suffix)]
        base = stem[:-5] if stem.endswith("-film") else stem
        dst = src.with_name(f"{base}{suffix}{src.suffix}")
        original = next((c for c in (src.with_name(base + ext) for ext in ORIGINAL_EXTS) if c.exists() and c != src), None)
        graded = Image.open(src).convert("RGB")
        before = noise_sigma(graded)
        if original is not None:
            k = fit_strength(Image.open(original), graded)
            out = grade_photo.grade_image(Image.open(original), k, OLD_GRAIN * keep)
            how = f"regraded from {original.name} at {k:.2f}, grain {OLD_GRAIN * keep:.4f}"
        else:
            out, sigma = soften_grain(graded, keep)
            how = f"blended {keep:.0%} file + {1 - keep:.0%} denoised (grain was {sigma:.1f})"
        if not dry:
            grade_photo.save(out, str(dst))
            if not keep_sources:
                src.unlink()
        after = noise_sigma(out)
        count += 1
        print(f"{str(src.relative_to(ROOT)).replace(chr(92), '/'):<52} -> {dst.name:<40} grain {before:5.2f} -> {after:4.2f}  {how}")
    print(f"{count} files, keeping {keep:.0%} of the grain{' (dry run)' if dry else ''}")


if __name__ == "__main__":
    main(sys.argv[1:])
