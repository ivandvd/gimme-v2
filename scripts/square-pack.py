"""Turn a pack render on a plain studio backdrop into the square card picture.
The square is the box plus a small margin, whichever way the box is longer;
where the render has more than that, it is cropped around the box, and where
it has less, the edge rows or columns are smeared outward (extend-canvas.py)
so the backdrop simply continues. Then the picture is graded like the
cut-outs (grade-cutout.py at 0.7: tone and colour only, no vignette or
grain) and saved as a JPEG.

usage: python -I scripts/square-pack.py [--margin 0.03] <in> <out.jpg> [...more pairs]

--margin is the air around the box as a share of its longer side; the closed
cartons sit well at the default, an open box seen from above wants ~0.12.
"""

import importlib.util
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent


def load(name: str, file: str):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


extend_canvas = load("extend_canvas", "extend-canvas.py")
grade_cutout = load("grade_cutout", "grade-cutout.py")

MARGIN = 0.03  # of the box's longer side, each side of it
EDGE = 24  # levels from the backdrop at which a pixel counts as subject


def subject_box(img: np.ndarray) -> tuple[int, int, int, int]:
    """x0, x1, y0, y1 of everything that is not backdrop. The backdrop is a
    vertical gradient, so each row's own outer 2% gives its colour."""
    h, w = img.shape[:2]
    edge = max(4, w // 50)
    row_bg = np.median(np.concatenate([img[:, :edge], img[:, -edge:]], axis=1), axis=1)  # h x 3
    dev = np.abs(img - row_bg[:, None, :]).max(axis=2)
    cols = np.where((dev > EDGE).mean(axis=0) > 0.01)[0]
    rows = np.where((dev > EDGE).mean(axis=1) > 0.01)[0]
    if cols.size == 0 or rows.size == 0:
        raise SystemExit("no subject found in front of the backdrop")
    return int(cols[0]), int(cols[-1]), int(rows[0]), int(rows[-1])


def fit(length: int, s0: int, s1: int, side: int) -> tuple[int, int, int]:
    """Along one axis: where to crop from, or how much to add before and after,
    so that `side` pixels are centred on the subject (s0..s1)."""
    centre = (s0 + s1) / 2
    if length >= side:
        start = int(min(max(0, round(centre - side / 2)), length - side))
        return start, 0, 0
    before = int(min(max(0, round(side / 2 - centre)), side - length))
    return 0, before, side - length - before


def square(src: str, dst: str, margin: float = MARGIN) -> None:
    im = Image.open(src).convert("RGB")
    img = np.asarray(im).astype(np.int16)
    x0, x1, y0, y1 = subject_box(img)
    w, h = im.size
    side = int(round(max(x1 - x0 + 1, y1 - y0 + 1) * (1 + 2 * margin)))
    side = min(side, max(w, h))
    cx, left, right = fit(w, x0, x1, side)
    cy, top, bottom = fit(h, y0, y1, side)
    crop = im.crop((cx, cy, cx + min(side, w), cy + min(side, h)))
    with tempfile.TemporaryDirectory() as tmp:
        step = Path(tmp) / "a.png"
        crop.save(step)
        if top or bottom:
            extend_canvas.extend(str(step), str(step), top, bottom)
        if left or right:
            # extend-canvas works on the top and bottom: turn the picture on
            # its side (left edge down), pad, turn it back
            Image.open(step).transpose(Image.Transpose.ROTATE_90).save(step)
            extend_canvas.extend(str(step), str(step), right, left)
            Image.open(step).transpose(Image.Transpose.ROTATE_270).save(step)
        graded = Path(tmp) / "graded.png"
        grade_cutout.grade_cutout(str(step), str(graded), 0.7)
        out = Image.open(graded).convert("RGB")
        out.save(dst, quality=92, optimize=True, progressive=True)
    print(
        f"{dst}: box x {x0}-{x1} y {y0}-{y1} of {w}x{h} -> {out.size[0]}x{out.size[1]}, "
        f"crop from ({cx},{cy}), added {left}/{right} sideways, {top}/{bottom} up and down"
    )


if __name__ == "__main__":
    args = sys.argv[1:]
    margin = MARGIN
    if args[:1] == ["--margin"]:
        margin = float(args[1])
        args = args[2:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        square(args[i], args[i + 1], margin)
