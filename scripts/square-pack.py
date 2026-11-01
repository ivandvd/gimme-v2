"""Turn a pack render on a plain studio backdrop into the square card picture:
crop to the box with a small margin at the sides, pad above and below with
more of the backdrop (the edge rows smeared outward, as extend-canvas.py does)
so the box sits in the middle of a square, then grade like the cut-outs
(grade-cutout.py at 0.7: tone and colour only, no vignette or grain). Saves a
JPEG at the render's own width.

usage: python -I scripts/square-pack.py <in> <out.jpg> [...more pairs]
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

MARGIN = 0.03  # of the width, each side of the box
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


def square(src: str, dst: str) -> None:
    im = Image.open(src).convert("RGB")
    img = np.asarray(im).astype(np.int16)
    x0, x1, y0, y1 = subject_box(img)
    w, h = im.size
    m = round(w * MARGIN)
    left, right = max(0, x0 - m), min(w, x1 + 1 + m)
    crop = im.crop((left, 0, right, h))
    side = crop.width
    pad = side - h
    if pad < 0:
        raise SystemExit(f"{src}: the box is taller than it is wide; crop it by hand")
    # the box's middle lands in the middle of the square
    centre = (y0 + y1) / 2
    top = int(min(pad, max(0, round(side / 2 - centre))))
    bottom = pad - top
    with tempfile.TemporaryDirectory() as tmp:
        cropped = Path(tmp) / "crop.png"
        padded = Path(tmp) / "padded.png"
        graded = Path(tmp) / "graded.png"
        crop.save(cropped)
        extend_canvas.extend(str(cropped), str(padded), top, bottom)
        grade_cutout.grade_cutout(str(padded), str(graded), 0.7)
        Image.open(graded).convert("RGB").save(dst, quality=92, optimize=True, progressive=True)
    print(f"{dst}: box x {x0}-{x1} y {y0}-{y1} of {w}x{h}, cropped to {side} wide, padded {top} above / {bottom} below")


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        square(args[i], args[i + 1])
