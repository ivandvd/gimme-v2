"""Turn a pack render on a plain studio backdrop into the square card picture.
The square is the box plus a small margin, whichever way the box is longer;
where the render has more than that, it is cropped around the box, and where
it has less, the edge rows or columns are smeared outward (extend-canvas.py)
so the backdrop simply continues; a box that runs off the top or bottom of
the render keeps that edge as the picture's edge. Then the picture is graded
like the cut-outs (grade-cutout.py at 0.7: tone and colour only, no vignette
or grain) and saved as a JPEG.

usage: python -I scripts/square-pack.py [--margin 0.03] [--tall 1.0] [--anchor w=0.86,cx=0.5,bottom=0.8] <in> <out.jpg> [...more pairs]

--margin is the air around the box as a share of its longer side; the closed
cartons sit well at the default, an open box seen from above wants ~0.12.
--tall is the picture's height as a share of its width: 1 is the square card
picture, 1.448 the mega menu's 290:420 tile (the extra height is backdrop).
--anchor frames every picture the same way instead, so a row of cards lines
up: the box's own sharp outline (not its shadow or blurred lid) is made `w`
of the picture's width (or `h` of its height, for a turned view that should
stay the size of the straight-on one), its centre put at `cx` of the width
and its bottom edge at `bottom` of the height (or its top edge at `top`). A
box the render cuts off at an edge keeps that edge, since no air can be
added there; a shadow reaching the edge is continued.
"""

import importlib.util
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

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
CUT = 60  # a side of the picture this far from the backdrop's colour is covered by the subject
TOUCH = 4  # a subject with no more backdrop rows than this above or below it runs off that edge
SHARP = 18  # lightness gradient (levels per pixel) of the box's own edges; shadow and lid blur stay under it


def sharp_box(im: Image.Image) -> tuple[int, int, int, int]:
    """x0, x1, y0, y1 of the box's crisp outline: a printed carton or an open
    box has sharp edges, while its shadow and out-of-focus lid flaps only
    have soft ones, so this is the box as the eye places it."""
    g = np.asarray(im.convert("L")).astype(np.float32)
    gy, gx = np.gradient(g)
    strong = np.hypot(gx, gy) > SHARP
    h, w = strong.shape
    cols = np.where(strong.sum(axis=0) > h * 0.01)[0]
    rows = np.where(strong.sum(axis=1) > w * 0.01)[0]
    if cols.size == 0 or rows.size == 0:
        raise SystemExit("no sharp edges found")
    return int(cols[0]), int(cols[-1]), int(rows[0]), int(rows[-1])


def place(length: int, at: float, target: float, side: int) -> tuple[int, int, int, int]:
    """Along one axis: where to crop from and how long, and how much to add
    before and after, so that render position `at` lands `target` pixels
    into a picture `side` long."""
    begin = int(round(at - target))
    before = max(0, -begin)
    after = max(0, begin + side - length)
    return max(0, begin), side - before - after, before, after


def subject_box(img: np.ndarray) -> tuple[int, int, int, int, np.ndarray]:
    """x0, x1, y0, y1 of everything that is not backdrop, and every pixel's
    distance from it. The backdrop is a vertical gradient, so each row's own
    outer 2% gives its colour: whichever side's is nearer the border's overall
    colour, in case the subject runs off the other side."""
    h, w = img.shape[:2]
    edge = max(4, w // 50)
    frame = np.median(
        np.concatenate([img[:edge].reshape(-1, 3), img[-edge:].reshape(-1, 3), img[:, :edge].reshape(-1, 3), img[:, -edge:].reshape(-1, 3)]),
        axis=0,
    )
    left = np.median(img[:, :edge], axis=1)  # h x 3
    right = np.median(img[:, -edge:], axis=1)
    both = np.median(np.concatenate([img[:, :edge], img[:, -edge:]], axis=1), axis=1)
    # both sides together, unless the subject covers one of them
    left_off = np.abs(left - frame).max(axis=1) > CUT
    right_off = np.abs(right - frame).max(axis=1) > CUT
    row_bg = np.where(left_off[:, None], right, np.where(right_off[:, None], left, both))
    dev = np.abs(img - row_bg[:, None, :]).max(axis=2)
    cols = np.where((dev > EDGE).mean(axis=0) > 0.01)[0]
    rows = np.where((dev > EDGE).mean(axis=1) > 0.01)[0]
    if cols.size == 0 or rows.size == 0:
        raise SystemExit("no subject found in front of the backdrop")
    return int(cols[0]), int(cols[-1]), int(rows[0]), int(rows[-1]), dev


def fit(length: int, s0: int, s1: int, side: int) -> tuple[int, int, int]:
    """Along one axis: where to crop from, or how much to add before and after,
    so that `side` pixels are centred on the subject (s0..s1)."""
    centre = (s0 + s1) / 2
    if length >= side:
        start = int(min(max(0, round(centre - side / 2)), length - side))
        return start, 0, 0
    before = int(min(max(0, round(side / 2 - centre)), side - length))
    return 0, before, side - length - before


def pad(crop: Image.Image, top: int, bottom: int, above: int, below: int) -> Image.Image:
    """Add `top` rows above the picture and `bottom` below. Each band is the
    picture's outermost backdrop rows (never the subject: at most `above` or
    `below` of them) stretched to the band's height, blurred and faded a
    little darker toward the far edge, then cross-faded into the picture, as
    extend-canvas.py does."""
    w, h = crop.size
    out = Image.new("RGB", (w, h + top + bottom))
    out.paste(crop, (0, top))

    def band(rows: Image.Image, height: int, flip: bool) -> Image.Image:
        strip = rows.resize((w, height), Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius=max(8, w // 120)))
        arr = np.asarray(strip).astype(np.float32)
        fade = np.linspace(1.0, 0.88, height, dtype=np.float32)
        arr *= (fade[::-1] if flip else fade)[:, None, None]
        return Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    if top:
        n = max(2, min(above, h // 40))
        out.paste(band(crop.crop((0, 0, w, n)), top, True), (0, 0))
    if bottom:
        n = max(2, min(below, h // 40))
        out.paste(band(crop.crop((0, h - n, w, h)), bottom, False), (0, h + top))
    arr = np.asarray(out).astype(np.float32)
    k = max(6, h // 60)
    if top:
        for i in range(min(k, above)):
            a = (i + 1) / (k + 1)
            arr[top + i] = arr[top + i] * a + arr[top - 1] * (1 - a)
    if bottom:
        for i in range(min(k, below)):
            a = (i + 1) / (k + 1)
            y = top + h - 1 - i
            arr[y] = arr[y] * a + arr[top + h] * (1 - a)
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))


def square(src: str, dst: str, margin: float = MARGIN, tall: float = 1.0, anchor: dict[str, float] | None = None) -> None:
    im = Image.open(src).convert("RGB")
    img = np.asarray(im).astype(np.int16)
    sx0, sx1, sy0, sy1, dev = subject_box(img)
    w, h = im.size
    if anchor:
        x0, x1, y0, y1 = sharp_box(im)
        # the box's size in the picture: by its width, or by its height (`h`),
        # which keeps a turned carton the size of its straight-on view
        side = int(round((y1 - y0 + 1) / anchor["h"] if "h" in anchor else (x1 - x0 + 1) / anchor.get("w", 0.86)))
        height = int(round(side * tall))
        cx, crop_w, left, right = place(w, (x0 + x1 + 1) / 2, anchor.get("cx", 0.5) * side, side)
        if "top" in anchor:
            cy, crop_h, top, bottom = place(h, y0, anchor["top"] * height, height)
        else:
            cy, crop_h, top, bottom = place(h, y1 + 1, anchor.get("bottom", 0.8) * height, height)
        # a box the render cuts off at its top or bottom keeps that edge, since
        # a band there would show it cut off in mid-air. Only the box counts:
        # its faint shadow reaching the edge continues into the band fine
        cut_top = sy0 <= TOUCH and (y0 <= TOUCH or dev[: TOUCH + 1].max() > 2 * EDGE)
        cut_bottom = h - 1 - sy1 <= TOUCH and (h - 1 - y1 <= TOUCH or dev[-(TOUCH + 1) :].max() > 2 * EDGE)
        if top and cut_top:
            cy, crop_h, top, bottom = place(h, 0, 0, height)
            print(f"  note: {Path(src).name} runs off the top (edge rows {dev[: TOUCH + 1].max()} from the backdrop), so its lid stays at the picture's edge")
        if bottom and cut_bottom:
            cy, crop_h, top, bottom = place(h, h, height, height)
            print(f"  note: {Path(src).name} runs off the bottom (edge rows {dev[-(TOUCH + 1) :].max()} from the backdrop), so it stays at the picture's edge")
    else:
        x0, x1, y0, y1 = sx0, sx1, sy0, sy1
        side = int(round(max(x1 - x0 + 1, y1 - y0 + 1) * (1 + 2 * margin)))
        side = min(side, max(w, h))
        height = int(round(side * tall))
        cx, left, right = fit(w, x0, x1, side)
        cy, top, bottom = fit(h, y0, y1, height)
        crop_w, crop_h = min(side, w), min(height, h)
    # the backdrop rows above and below the subject within the crop: what a
    # band is made from. A subject that runs off the top or the bottom of the
    # render keeps that edge as the picture's edge, with all the added room
    # on the other side: a band there would show it cut off in mid-air
    above = sy0 - cy
    below = cy + crop_h - 1 - sy1
    if not anchor and top + bottom and (above <= TOUCH) != (below <= TOUCH):
        top, bottom = (0, top + bottom) if above <= TOUCH else (top + bottom, 0)
    crop = im.crop((cx, cy, cx + crop_w, cy + crop_h))
    if top or bottom:
        crop = pad(crop, top, bottom, above, below)
    with tempfile.TemporaryDirectory() as tmp:
        step = Path(tmp) / "a.png"
        crop.save(step)
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
    ow, oh = out.size
    print(
        f"{dst}: box x {x0}-{x1} y {y0}-{y1} of {w}x{h} -> {ow}x{oh}, "
        f"crop from ({cx},{cy}), added {left}/{right} sideways, {top}/{bottom} up and down; "
        f"box in picture: w {(x1 - x0 + 1) / ow:.3f} cx {((x0 + x1 + 1) / 2 - cx + left) / ow:.3f} "
        f"top {(y0 - cy + top) / oh:.3f} bottom {(y1 + 1 - cy + top) / oh:.3f}"
    )


if __name__ == "__main__":
    args = sys.argv[1:]
    margin, tall, anchor = MARGIN, 1.0, None
    while args[:1] in (["--margin"], ["--tall"], ["--anchor"]):
        if args[0] == "--margin":
            margin = float(args[1])
        elif args[0] == "--tall":
            tall = float(args[1])
        else:
            anchor = {k: float(v) for k, v in (part.split("=") for part in args[1].split(","))}
        args = args[2:]
    if len(args) < 2 or len(args) % 2:
        raise SystemExit(__doc__)
    for i in range(0, len(args), 2):
        square(args[i], args[i + 1], margin, tall, anchor)
