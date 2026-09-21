"""Render the fictional member ID card as PNG + PDF.

Usage:
  python scripts/member_card.py [name] [number] [seal] [date] [-o OUT_PREFIX]

Defaults produce the demo card. The card mirrors the reference key-art
(gothic title, eye emblem, guilloche watermark, photo panel) but carries
only in-fiction fields and is watermarked as fictional.
"""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SCRIPTS = Path(__file__).resolve().parent
EMBLEM = SCRIPTS.parent.parent / "public" / "assets" / "email" / "emblem.jpg"
GOTHIC = SCRIPTS / "fonts" / "UnifrakturCook-Bold.ttf"
DV = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
DVB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

W, H, R = 1600, 1000, 70


def _f(path, size):
    return ImageFont.truetype(path, size)


def _ls(draw, xy, text, font, fill, spacing):
    """Draw text with manual letter-spacing; returns total width."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + spacing
    return x - xy[0]


def _ls_width(draw, text, font, spacing):
    return sum(draw.textlength(ch, font=font) + spacing for ch in text) - spacing


def render_card(name: str, number: int, seal: str, date: str) -> Image.Image:
    img = Image.new("RGB", (W, H), (237, 243, 241))
    d = ImageDraw.Draw(img)

    # guilloche watermark
    cx, cy = 430, 540
    for r in range(80, 940, 26):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(201, 220, 215), width=2)
    d.polygon([(430, 240), (150, 830), (710, 830)], outline=(188, 209, 203), width=3)
    d.ellipse([310, 580, 550, 700], outline=(188, 209, 203), width=3)
    d.ellipse([395, 615, 465, 685], outline=(188, 209, 203), width=3)

    # borders
    d.rounded_rectangle([18, 18, W - 18, H - 18], R, outline=(125, 154, 148), width=6)
    d.rounded_rectangle([36, 36, W - 36, H - 36], R - 12, outline=(150, 180, 175), width=2)

    # gothic title
    d.text((80, 42), "Illuminati", font=_f(str(GOTHIC), 168), fill=(10, 14, 16))

    # emblem top-right + caption (framed so the parchment reads as a stamp)
    emb = Image.open(EMBLEM).convert("RGB")
    ew = 250
    emb = emb.resize((ew, ew))
    img.paste(emb, (W - 330, 58))
    d.rectangle([W - 330, 58, W - 330 + ew, 58 + ew], outline=(125, 154, 148), width=3)
    cap = _f(DVB, 30)
    cw = _ls_width(d, "ILLUMINATI", cap, 6)
    _ls(d, (W - 330 + (ew - cw) // 2, 320), "ILLUMINATI", cap, (23, 26, 24), 6)

    # photo panel with hooded silhouette (no real person)
    px0, py0, px1, py1 = W - 560, 400, W - 110, 880
    d.rectangle([px0, py0, px1, py1], fill=(38, 45, 43))
    pcx = (px0 + px1) // 2
    d.polygon([(pcx - 195, py1), (pcx - 140, 700), (pcx + 140, 700), (pcx + 195, py1)], fill=(12, 16, 15))
    d.ellipse([pcx - 150, 450, pcx + 150, 780], fill=(12, 16, 15))
    d.ellipse([pcx - 95, 500, pcx + 95, 740], fill=(22, 28, 26))
    d.ellipse([pcx - 44, 600, pcx - 30, 614], fill=(58, 68, 65))
    d.ellipse([pcx + 30, 600, pcx + 44, 614], fill=(58, 68, 65))
    d.rectangle([px0, py0, px1, py1], outline=(125, 154, 148), width=5)

    # vertical motto beside photo
    motto = "AD LUCEM · MMXXVI"
    mf = _f(DVB, 28)
    mw = int(_ls_width(d, motto, mf, 8)) + 20
    vt = Image.new("RGBA", (mw, 60), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vt)
    _ls(vd, (10, 10), motto, mf, (76, 99, 94), 8)
    vt = vt.rotate(90, expand=True)
    img.paste(vt, (W - 612, (H - vt.height) // 2 + 40), vt)

    # fields
    label_f, value_f = _f(DV, 30), _f(DVB, 60)
    rows = [
        ("MEMBER NAME", name.upper()),
        ("INITIATE \u2116", f"{number:04d}"),
        ("SEAL", seal),
        ("INITIATED", date),
    ]
    y = 372
    for label, value in rows:
        _ls(d, (92, y), label, label_f, (76, 99, 94), 4)
        d.text((92, y + 38), value, font=value_f, fill=(19, 26, 24))
        y += 150

    # fictional watermark strip
    strip = "FICTIONAL MEMBER CARD — VALID ONLY WITHIN THE EXPERIENCE"
    sf = _f(DV, 28)
    sw = d.textlength(strip, font=sf)
    d.text(((W - sw) / 2, 930), strip, font=sf, fill=(76, 99, 94))

    # rounded corners
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, W, H], R, fill=255)
    out = Image.new("RGB", (W, H), (217, 205, 180))
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
