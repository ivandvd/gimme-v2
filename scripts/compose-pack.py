"""Stand-in picture for The Lineup, composed from the graded can cut-outs on
the packs' cream with soft shadows: the five in a shallow arc, the middle one
forward. Until the owner's render arrives (prompt 9 in
incoming/for-higgsfield/PROMPTS.md). 1200x1200 JPEG in public/.../shared/packs.

usage: python -I scripts/compose-pack.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "public" / "sites" / "vibebevvy-com-5acc75fc" / "shared"
OUT = ROOT / "packs"
CREAM = (0xEF, 0xE3, 0xD4)
SIZE = 1200
DRINKS = ["energy", "focus", "calm", "sleep", "glow"]


def can(name: str, height: int) -> Image.Image:
    im = Image.open(ROOT / "products" / f"gimme-{name}-can-film.png").convert("RGBA")
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


def lineup() -> None:
    c = Image.new("RGBA", (SIZE, SIZE), CREAM + (255,))
    h = 640
    w = can("energy", h).width
    step = 206
    x0 = (SIZE - (w + 4 * step)) // 2
    # a shallow arc: the ends sit back and up, the middle forward
    lift = [70, 28, 0, 28, 70]
    scale = [0.92, 0.96, 1.0, 0.96, 0.92]
    for i in [0, 4, 1, 3, 2]:
        im = can(DRINKS[i], int(h * scale[i]))
        place(c, im, x0 + i * step + (w - im.width) // 2, 990 - lift[i], shadow=0.1 + 0.06 * scale[i])
    path = OUT / "the-lineup-stand-in.jpg"
    c.convert("RGB").save(path, quality=92, optimize=True, progressive=True)
    print(path.name)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    lineup()
