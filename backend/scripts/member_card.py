"""Render the fictional member ID card (dark "otherworld" style) as PNG + PDF.

Usage:
  python scripts/member_card.py [name] [number] [seal] [date] [-o OUT_PREFIX]

The card mirrors the site's dark gold-on-black brand: gothic title,
engraved emblem, hooded silhouette photo panel. Carries only in-fiction
fields and is labelled as not a government-issued ID.
"""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SCRIPTS = Path(__file__).resolve().parent
GOTHIC = SCRIPTS / "fonts" / "UnifrakturCook-Bold.ttf"
DV = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
DVB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
DSB = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

W, H, R = 1600, 1000, 70
GOLD = (201, 162, 75)
GOLD_LIGHT = (230, 200, 120)
GOLD_DIM = (141, 132, 116)
CREAM = (240, 230, 207)


def _f(path, size):
    return ImageFont.truetype(path, size)


def _ls(draw, xy, text, font, fill, spacing):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + spacing
    return x - xy[0]


def _ls_width(draw, text, font, spacing):
    return sum(draw.textlength(ch, font=font) + spacing for ch in text) - spacing


def _emblem(draw, cx, cy, size, color, width=3):
    """Engraved eye-in-triangle, vector, gold."""
    k = size / 100
    tri = [(cx, cy - 44 * k), (cx + 45 * k, cy + 38 * k), (cx - 45 * k, cy + 38 * k)]
    draw.polygon(tri, outline=color, width=max(2, int(width * k)))
    draw.ellipse([cx - 17 * k, cy - 2 * k, cx + 17 * k, cy + 16 * k], outline=color, width=max(1, int(width * 0.7 * k)))
    r = 5 * k
    draw.ellipse([cx - r, cy + 2 * k, cx + r, cy + 2 * k + 2 * r], fill=color)


def render_card(name: str, number: int, seal: str, date: str) -> Image.Image:
    img = Image.new("RGB", (W, H), (5, 2, 3))
    d = ImageDraw.Draw(img)

    # vertical gradient base
    for y in range(H):
        t = y / H
        shade = (int(21 - 16 * t), int(16 - 13 * t), int(12 - 9 * t))
        d.line([(0, y), (W, y)], fill=shade)

    # faint gold watermark rings + triangle
    for r in range(80, 940, 30):
        d.ellipse([430 - r, 560 - r, 430 + r, 560 + r], outline=(52, 40, 20), width=2)
    d.polygon([(430, 240), (150, 830), (710, 830)], outline=(52, 40, 20), width=3)

    # gold borders
    d.rounded_rectangle([18, 18, W - 18, H - 18], R, outline=GOLD, width=6)
    d.rounded_rectangle([36, 36, W - 36, H - 36], R - 12, outline=(230, 200, 120, ), width=2)

    # gothic title in gold
    d.text((80, 55), "Illuminati", font=_f(str(GOTHIC), 150), fill=GOLD_LIGHT)

    # emblem + house caption, top right
    _emblem(d, W - 220, 165, 170, GOLD_LIGHT, 4)
    cap = _f(DVB, 26)
    cw = _ls_width(d, "ILLUMINATI", cap, 8)
    _ls(d, (W - 220 - cw // 2, 285), "ILLUMINATI", cap, (168, 144, 90), 8)
    cap2 = _f(DVB, 15)
    cw2 = _ls_width(d, "BROTHERHOOD", cap2, 6)
    _ls(d, (W - 220 - cw2 // 2, 320), "BROTHERHOOD", cap2, (168, 144, 90), 6)

    # photo panel with hooded silhouette
    px0, py0, px1, py1 = W - 560, 400, W - 110, 880
    d.rectangle([px0, py0, px1, py1], fill=(11, 7, 5))
    pcx = (px0 + px1) // 2
    d.polygon([(pcx - 195, py1), (pcx - 140, 700), (pcx + 140, 700), (pcx + 195, py1)], fill=(0, 0, 0))
    d.ellipse([pcx - 150, 450, pcx + 150, 780], fill=(0, 0, 0))
    d.ellipse([pcx - 95, 500, pcx + 95, 740], fill=(22, 16, 9))
    d.ellipse([pcx - 44, 600, pcx - 30, 614], fill=(122, 92, 34))
    d.ellipse([pcx + 30, 600, pcx + 44, 614], fill=(122, 92, 34))
    d.rectangle([px0, py0, px1, py1], outline=GOLD, width=4)

    # vertical motto
    vt = Image.new("RGBA", (700, 60), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vt)
    _ls(vd, (10, 10), "AD LUCEM · MMXXVI", _f(DVB, 28), GOLD_DIM, 8)
    vt = vt.rotate(90, expand=True)
    img.paste(vt, (W - 640, (H - vt.height) // 2 + 40), vt)

    # fields: Inter labels, serif values in cream, gold underlines
    label_f, value_f = _f(DV, 28), _f(DSB, 58)
    rows = [
        ("Member name", name.upper()),
        ("Initiate №", f"{number:04d}"),
        ("Seal", seal),
        ("Initiated", date),
    ]
    y = 372
    for label, value in rows:
        _ls(d, (92, y), label, label_f, GOLD_DIM, 4)
        d.text((92, y + 38), value, font=value_f, fill=CREAM)
        vw = d.textlength(value, font=value_f)
        d.line([(92, y + 108), (92 + min(560, vw), y + 108)], fill=(230, 200, 120, ), width=2)
        y += 150

    # honest strip
    strip = "MEMBER CARD · NOT A GOVERNMENT-ISSUED ID"
    sf = _f(DV, 26)
    sw = d.textlength(strip, font=sf)
    d.text(((W - sw) / 2, 935), strip, font=sf, fill=GOLD_DIM)

    # rounded corners
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, W, H], R, fill=255)
    out = Image.new("RGB", (W, H), (0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name", nargs="?", default="Sample Initiate")
    ap.add_argument("number", nargs="?", type=int, default=1776)
    ap.add_argument("seal", nargs="?", default="IB-1776-OCULUS")
    ap.add_argument("date", nargs="?", default="21 Sep 2026")
    ap.add_argument("-o", "--out", default="member-card")
    a = ap.parse_args()

    card = render_card(a.name, a.number, a.seal, a.date)
    png = Path(a.out).with_suffix(".png")
    card.save(png, "PNG")
    print(f"wrote: {png}")

    pdf = Path(a.out).with_suffix(".pdf")
    from reportlab.pdfgen import canvas

    c = canvas.Canvas(str(pdf), pagesize=(486, 306))  # 2x CR80 card size
    c.drawImage(str(png), 0, 0, 486, 306)
    c.showPage()
    c.save()
    print(f"wrote: {pdf}")


if __name__ == "__main__":
    main()
