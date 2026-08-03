#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph card for IMMEDIACY."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "social-card.png"

AMBER = (238, 162, 50)
RED = (202, 60, 55)
MUTED = (155, 160, 168)
WHITE = (245, 245, 244)
PANEL = (10, 12, 16)
LINE = (44, 48, 56)


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont:
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


SERIF_BOLD = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf",
]
SANS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]
SANS_BOLD = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]
MONO = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
]


def draw_spaced(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    spacing: int = 3,
) -> None:
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=font, fill=fill)
        left, _, right, _ = draw.textbbox((x, y), char, font=font)
        x += right - left + spacing


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), (2, 3, 5))
    draw = ImageDraw.Draw(image)

    for y in range(HEIGHT):
        shade = int(4 + 8 * (1 - y / HEIGHT))
        draw.line([(0, y), (WIDTH, y)], fill=(shade, shade + 1, shade + 3))

    for x in range(0, WIDTH, 60):
        draw.line([(x, 0), (x, HEIGHT)], fill=(18, 21, 26), width=1)
    for y in range(0, HEIGHT, 60):
        draw.line([(0, y), (WIDTH, y)], fill=(18, 21, 26), width=1)

    draw.rectangle([0, 0, 14, HEIGHT], fill=RED)
    draw.rectangle([14, 0, WIDTH, 8], fill=AMBER)

    draw_spaced(draw, (58, 32), "CYBER DISCLOSURE WAR GAME", load_font(SANS_BOLD, 17), AMBER, 2)
    draw.text((58, 64), "NORTHLINE SYSTEMS / ACTIVE INCIDENT", font=load_font(MONO, 14), fill=MUTED)

    draw_spaced(draw, (58, 150), "IMMEDIACY", load_font(SERIF_BOLD, 78), WHITE, 7)
    draw_spaced(draw, (61, 254), "EVERY SECOND COUNTS", load_font(SANS, 21), MUTED, 4)

    draw.multiline_text(
        (61, 330),
        "Make consequential decisions while the facts are incomplete,\n"
        "the clocks are running, and silence creates risk of its own.",
        font=load_font(SANS, 23),
        fill=(208, 211, 216),
        spacing=12,
    )

    x = 61
    for label, color in [
        ("5 PHASES", AMBER),
        ("19 DECISION NODES", WHITE),
        ("FAIR-INFORMED", WHITE),
    ]:
        chip_font = load_font(SANS_BOLD, 15)
        text_width = draw.textbbox((0, 0), label, font=chip_font)[2]
        draw.rounded_rectangle(
            [x, 458, x + text_width + 28, 494],
            radius=5,
            outline=(65, 69, 76),
            fill=(9, 11, 15),
            width=1,
        )
        draw.text((x + 14, 468), label, font=chip_font, fill=color)
        x += text_width + 42

    draw.line([(61, 548), (714, 548)], fill=LINE, width=1)
    draw.text((61, 566), "jtflack-grc.github.io/immediacy", font=load_font(MONO, 15), fill=(138, 143, 151))
    draw.text((565, 566), "i on GRC", font=load_font(SANS_BOLD, 15), fill=WHITE)

    x1, y1, x2, y2 = 760, 60, 1154, 574
    draw.rounded_rectangle([x1, y1, x2, y2], radius=10, fill=PANEL, outline=(55, 59, 66), width=2)
    draw.rectangle([x1, y1, x2, y1 + 46], fill=(17, 19, 24))
    draw.ellipse([x1 + 18, y1 + 17, x1 + 28, y1 + 27], fill=RED)
    draw.text((x1 + 40, y1 + 14), "WAR ROOM STATUS", font=load_font(SANS_BOLD, 15), fill=WHITE)
    draw.text((x2 - 84, y1 + 14), "LIVE", font=load_font(MONO, 14), fill=RED)

    draw.text((x1 + 24, y1 + 72), "DISCLOSURE CLOCK", font=load_font(SANS_BOLD, 13), fill=MUTED)
    draw.text((x1 + 24, y1 + 96), "01:47:36", font=load_font(MONO, 42), fill=AMBER)
    draw.text((x1 + 249, y1 + 112), "REMAINING", font=load_font(SANS_BOLD, 12), fill=MUTED)

    metrics = [
        ("OPERATIONAL CONTROL", 62, AMBER),
        ("EVIDENCE CONFIDENCE", 38, RED),
        ("DISCLOSURE DEBT", 71, RED),
    ]
    metric_y = y1 + 170
    for label, value, color in metrics:
        draw.text((x1 + 24, metric_y), label, font=load_font(SANS_BOLD, 12), fill=MUTED)
        draw.text((x2 - 58, metric_y - 2), str(value), font=load_font(MONO, 15), fill=WHITE, anchor="ra")
        bar_y = metric_y + 25
        draw.rounded_rectangle([x1 + 24, bar_y, x2 - 24, bar_y + 8], radius=4, fill=(31, 34, 40))
        bar_width = int((x2 - x1 - 48) * value / 100)
        draw.rounded_rectangle([x1 + 24, bar_y, x1 + 24 + bar_width, bar_y + 8], radius=4, fill=color)
        metric_y += 66

    draw.line([(x1 + 24, metric_y - 4), (x2 - 24, metric_y - 4)], fill=LINE, width=1)
    draw.text((x1 + 24, metric_y + 16), "DECISION REQUIRED", font=load_font(SANS_BOLD, 13), fill=AMBER)
    draw.multiline_text(
        (x1 + 24, metric_y + 44),
        "Reporter has the ransom note.\nScope remains unconfirmed.",
        font=load_font(SANS, 15),
        fill=WHITE,
        spacing=5,
    )
    draw.rounded_rectangle([x1 + 24, y2 - 54, x2 - 24, y2 - 14], radius=6, outline=AMBER, width=2)
    draw.text((x1 + 43, y2 - 43), "CHOOSE A DEFENSIBLE PATH", font=load_font(SANS_BOLD, 14), fill=AMBER)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, format="PNG", optimize=True)
    print(f"Generated {OUTPUT} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
