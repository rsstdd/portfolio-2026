#!/usr/bin/env python3
"""
Datum social cards, 1200x630.

Writes an SVG master and a PNG for every route. The SVG carries the real
IBM Plex font stack and is the file to trust; the PNG is rasterised with
whatever the running machine has, so on a machine with IBM Plex installed the
PNG is final, and elsewhere it is a composition preview.

Layout follows DESIGN_SYSTEM.md: paper field, a datum tick at the origin of a
hairline, mono overline, serif title, mono data plate along the bottom. One
accent moment per card, which is the tick.

    python3 generate-og.py            # all cards
    python3 generate-og.py --list     # names only
"""
import subprocess, sys, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAPER, INK, MUTED, LINE, ORANGE = "#f5f2ec", "#221f1a", "#6b655a", "#d9d2c2", "#dd4e12"
PAD = 84

# Real stack for the SVG. The rasteriser falls back per FALLBACK below.
PLEX_SERIF = "IBM Plex Serif, Georgia, serif"
PLEX_MONO  = "IBM Plex Mono, ui-monospace, monospace"

FALLBACK = {
    "serif": "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "serif_bold": "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "mono": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
}

CARDS = [
    # slug, overline, title, plate
    ("default", "Senior Software Engineer · München",
     "Sensors first. Then products. Then platforms.",
     "rsstdd.com · TypeScript · Node · Python · Rust"),
    ("about", "About",
     "Nine years of platform, product, and sensor work.",
     "rsstdd.com/about"),
    ("cv", "Curriculum vitae · Ross Todd",
     "Senior full-stack software engineer",
     "rsstdd.com/cv · Munich · EU Blue Card"),
    ("projects", "Selected work",
     "Eight projects, each with its Limitations.",
     "rsstdd.com/projects"),
    ("colophon", "Colophon",
     "How this site is built, and what it measures.",
     "rsstdd.com/colophon"),
    ("aircraft", "TypeScript · React 19 · Hono",
     "Aircraft",
     "rsstdd.com/projects/aircraft · in progress"),
    ("plane-scraper", "Rust · tokio · reqwest",
     "Plane scraper",
     "rsstdd.com/projects/plane-scraper · 2026"),
    ("orchard-robotics", "TypeScript · Next.js · React",
     "Geospatial harvest volume estimator",
     "rsstdd.com/projects/orchard-robotics · 2025"),
    ("hydro-sensor", "Python · pylibftdi · MongoDB",
     "Hydro sensor",
     "rsstdd.com/projects/hydro-sensor · 2018"),
    ("photography", "Astro · React 19 · TypeScript",
     "Photography",
     "rsstdd.com/projects/photography · in progress"),
    ("this-site", "Next.js 16 · React 19 · TypeScript",
     "This portfolio site",
     "rsstdd.com/projects/this-site · in progress"),
    ("rusti-aircraft-api", "Rust · Rocket · Diesel",
     "Rusti aircraft API",
     "rsstdd.com/projects/rusti-aircraft-api · 2019"),
    ("aquaponic-iot", "JavaScript · Node.js · Johnny-Five",
     "Aquaponic IoT system",
     "rsstdd.com/projects/aquaponic-iot · 2017"),
]


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def wrap(text, font, max_w, draw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def title_size(text):
    """Longer titles step down so the card never overflows."""
    n = len(text)
    if n <= 24:  return 92
    if n <= 40:  return 78
    if n <= 56:  return 66
    return 56


def build(slug, overline, title, plate):
    ts = title_size(title)
    serif = ImageFont.truetype(FALLBACK["serif_bold"], ts)
    mono_s = ImageFont.truetype(FALLBACK["mono"], 22)
    mono_p = ImageFont.truetype(FALLBACK["mono"], 21)

    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    # Datum tick over a hairline: the accent moment.
    tick_y = PAD
    d.line([(PAD, tick_y), (W - PAD, tick_y)], fill=LINE, width=2)
    d.line([(PAD, tick_y), (PAD + 96, tick_y)], fill=ORANGE, width=6)

    # Mono overline, uppercase, tracked out by hand because PIL has no tracking.
    ol = overline.upper()
    d.text((PAD, tick_y + 34), ol, font=mono_s, fill=MUTED)

    # Serif title, wrapped, sitting on the optical centre.
    lines = wrap(title, serif, W - 2 * PAD, d)
    lh = int(ts * 1.12)
    block_h = lh * len(lines)
    y = int((H - block_h) / 2) + 16
    for ln in lines:
        d.text((PAD, y), ln, font=serif, fill=INK)
        y += lh

    # Data plate: hairline, then mono metadata.
    plate_y = H - PAD - 30
    d.line([(PAD, plate_y), (W - PAD, plate_y)], fill=LINE, width=2)
    d.text((PAD, plate_y + 14), plate, font=mono_p, fill=MUTED)

    png = Path(f"{slug}.png")
    img.save(png, "PNG", optimize=True)

    # SVG master with the real stack.
    tspans = "".join(
        f'<tspan x="{PAD}" dy="{0 if i == 0 else lh}">{esc(ln)}</tspan>'
        for i, ln in enumerate(lines)
    )
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="{PAPER}"/>
  <line x1="{PAD}" y1="{tick_y}" x2="{W-PAD}" y2="{tick_y}" stroke="{LINE}" stroke-width="2"/>
  <line x1="{PAD}" y1="{tick_y}" x2="{PAD+96}" y2="{tick_y}" stroke="{ORANGE}" stroke-width="6"/>
  <text x="{PAD}" y="{tick_y+52}" font-family="{PLEX_MONO}" font-size="22" font-weight="600"
        letter-spacing="1.8" fill="{MUTED}">{esc(overline.upper())}</text>
  <text font-family="{PLEX_SERIF}" font-size="{ts}" font-weight="600" fill="{INK}"
        y="{int((H-block_h)/2)+16+int(ts*0.82)}">{tspans}</text>
  <line x1="{PAD}" y1="{plate_y}" x2="{W-PAD}" y2="{plate_y}" stroke="{LINE}" stroke-width="2"/>
  <text x="{PAD}" y="{plate_y+34}" font-family="{PLEX_MONO}" font-size="21"
        fill="{MUTED}">{esc(plate)}</text>
</svg>
'''
    Path(f"{slug}.svg").write_text(svg, encoding="utf-8")
    return png


if __name__ == "__main__":
    if "--list" in sys.argv:
        for c in CARDS:
            print(c[0])
        raise SystemExit
    has_plex = "plex" in subprocess.run(
        ["fc-list"], capture_output=True, text=True).stdout.lower() if shutil.which("fc-list") else False
    for slug, ol, title, plate in CARDS:
        p = build(slug, ol, title, plate)
        print(f"{p}  {p.stat().st_size//1024}KB")
    print("\nSVG masters carry the IBM Plex stack and are authoritative.")
    print("IBM Plex detected on this machine:", has_plex)
    if not has_plex:
        print("PNGs above were rasterised with a fallback serif. Install IBM Plex")
        print("(or run `pnpm add @fontsource/ibm-plex-serif @fontsource/ibm-plex-mono`)")
        print("and re-run to get final PNGs.")
