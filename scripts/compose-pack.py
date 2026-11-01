"""Stand-in pictures for the three packs, composed from the graded can and jar
cut-outs on the packs' cream, each with a soft shadow, until the owner's
pack renders arrive (prompts in incoming/for-higgsfield/PROMPTS.md):

* starter-pack: two of each drink, ten in two rows
* the-lineup: the five in a shallow arc, the middle one forward
* the-routine-<softgel>: two drinks and the softgel's jar, one per softgel

All 1200x1200 JPEGs in public/.../shared/packs with a -stand-in suffix.

usage: python -I scripts/compose-pack.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "public" / "sites" / "vibebevvy-com-5acc75fc" / "shared"
OUT = ROOT / "packs"
CREAM = (0xEF, 0xE3, 0xD4)
SIZE = 1200
DRINKS = ["energy", "focus", "calm", "sleep", "glow"]
SOFTGELS = ["pms-relief", "glow-softgels", "urinary-health"]


def can(name: str, height: int) -> Image.Image:
    im = Image.open(ROOT / "products" / f"gimme-{name}-can-film.png").convert("RGBA")
    return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)


def jar(name: str, height: int) -> Image.Image:
    im = Image.open(ROOT / "supplements" / f"gimme-{name}-jar-v2-film.png").convert("RGBA")
    box = im.getbbox()
    im = im.crop(box)
    return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)


def place(canvas: Image.Image, item: Image.Image, x: int, bottom: int, shadow: float = 0.16) -> None:
    """Paste `item` with its bottom edge at `bottom`, over a soft ellipse of shadow."""
    w, h = item.size
    sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    rx, ry = int(w * 0.62), int(w * 0.16)
    d.ellipse((x + w // 2 - rx, bottom - ry, x + w // 2 + rx, bottom + ry), fill=(60, 40, 30, int(255 * shadow)))
    sh = sh.filter(ImageFilter.GaussianBlur(w * 0.09))
    canvas.alpha_composite(sh)
    canvas.alpha_composite(item, (x, bottom - h))


def new_canvas() -> Image.Image:
    return Image.new("RGBA", (SIZE, SIZE), CREAM + (255,))


def save(canvas: Image.Image, name: str) -> None:
    path = OUT / f"{name}-stand-in.jpg"
    canvas.convert("RGB").save(path, quality=92, optimize=True, progressive=True)
    print(path.name)


def starter() -> None:
    c = new_canvas()
    h = 560
    w = can("energy", h).width
    step = 196
    total = w + 4 * step
    x0 = (SIZE - total) // 2
    # back row a little smaller and higher, then the front row over it
    back = [can(n, int(h * 0.94)) for n in DRINKS]
    for i, im in enumerate(back):
        place(c, im, x0 + i * step + 36, 880 - 80, shadow=0.1)
    for i, n in enumerate(DRINKS):
        place(c, can(n, h), x0 + i * step, 960)
    save(c, "starter-pack")


def lineup() -> None:
    c = new_canvas()
    h = 640
    w = can("energy", h).width
    step = 206
    x0 = (SIZE - (w + 4 * step)) // 2
    # a shallow arc: the ends sit back and up, the middle forward
    lift = [70, 28, 0, 28, 70]
    scale = [0.92, 0.96, 1.0, 0.96, 0.92]
    order = [0, 4, 1, 3, 2]
    for i in order:
        im = can(DRINKS[i], int(h * scale[i]))
        place(c, im, x0 + i * step + (w - im.width) // 2, 990 - lift[i], shadow=0.1 + 0.06 * scale[i])
    save(c, "the-lineup")


def routine() -> None:
    for s in SOFTGELS:
        c = new_canvas()
        j = jar(s, 620)
        a = can("energy", 560)
        b = can("calm", 560)
        total = a.width + b.width + j.width + 2 * 26
        x = (SIZE - total) // 2
        place(c, a, x, 960, shadow=0.12)
        place(c, b, x + a.width + 26, 960, shadow=0.12)
        place(c, j, x + a.width + b.width + 52, 960, shadow=0.18)
        save(c, f"the-routine-{s}")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    starter()
    lineup()
    routine()
