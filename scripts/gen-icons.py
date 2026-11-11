#!/usr/bin/env python3
"""
App icons from the otter (same geometry as src/pet/pet.tsx: HEAD, BAND, NOSE, ears, freckles,
'happy' face = dot eyes + smile, forehead spark, SPARK_PATH pebble, paws). If pet.tsx changes shape,
copy the numbers here. Icon = the otter's face + its lucky spark pebble on deep blue (docs/18).

  python3 -I scripts/gen-icons.py

Writes:
  assets/images/icon.png                    1024, full bleed (web, fallback)
  assets/images/android-icon-foreground.png 512, otter + pebble on transparent, inside the adaptive safe zone
  assets/images/android-icon-background.png 512, solid deep blue
  assets/images/android-icon-monochrome.png 512, white head silhouette, face + spark cut out (themed icons)
  assets/images/splash-icon.png             512, otter face + pebble on transparent
  assets/images/favicon.png                 48
  assets/expo.icon/                         iOS 26 Icon Composer bundle: otter layer + pebble layer on deep blue

macOS only: renders SVG with `sips`, finishes with Pillow.
"""
import json
import os
import shutil
import subprocess
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'images')
ICON = os.path.join(ROOT, 'assets', 'expo.icon')

BLUE = '#003459'
BLUE_LIGHT = '#0A4673'   # very soft lift behind the head
CARAMEL = '#C98B5E'
CREAM = '#FBEEDD'
INK = '#4A2E22'          # pet.tsx ART.ink (eyes, nose, mouth)
PEB = {'body': '#FFD166', 'base': '#F0B43C', 'light': '#FFE7A8'}


def shade(hex_color, amt):
    n = int(hex_color[1:], 16)
    t = 0 if amt < 0 else 255
    p = abs(amt)
    ch = lambda v: round((t - v) * p + v)
    return '#%02X%02X%02X' % (ch(n >> 16), ch((n >> 8) & 255), ch(n & 255))


DEEP, DEEPER = shade(CARAMEL, -0.16), shade(CARAMEL, -0.3)

# ---- geometry, 200 x 240 pet canvas (copied from src/pet/pet.tsx) ----
HEAD = 'M100 34 C152 34 180 68 180 108 C180 140 150 158 100 158 C50 158 20 140 20 108 C20 68 48 34 100 34Z'
BAND = 'M0 134 C18 128 42 114 66 117 C82 119 90 125 100 125 C110 125 118 119 134 117 C158 114 182 128 200 134 V240 H0Z'
BODY = 'M100 136 C136 136 152 170 152 196 C152 216 134 226 100 226 C66 226 48 216 48 196 C48 170 64 136 100 136Z'
NOSE = 'M91 118 Q91 113 100 113 Q109 113 109 118 Q109 123 100 125 Q91 123 91 118Z'
SPARK = ('M-4.5 -15.5 A4.5 4.5 0 0 1 4.5 -15.5 C4.5 -9.5 9.5 -4.5 15.5 -4.5 A4.5 4.5 0 0 1 15.5 4.5 C9.5 4.5 4.5 9.5 4.5 15.5 '
         'A4.5 4.5 0 0 1 -4.5 15.5 C-4.5 9.5 -9.5 4.5 -15.5 4.5 A4.5 4.5 0 0 1 -15.5 -4.5 C-9.5 -4.5 -4.5 -9.5 -4.5 -15.5Z')
EY, MY, LX, RX = 110, 127, 66, 134
# the pebble held up beside the right cheek (icon only; in the app it sits at the chest)
PX, PY, PS, PROT = 149, 157, 1.55, 10


def pebble(fill=None):
    t = f'translate({PX} {PY}) rotate({PROT}) scale({PS})'
    if fill:
        return f'<path d="{SPARK}" transform="{t}" fill="{fill}"/>'
    return (f'<g transform="{t}"><path d="{SPARK}" transform="translate(0 2.4)" fill="{PEB["base"]}"/>'
            f'<path d="{SPARK}" fill="{PEB["body"]}"/><path d="{SPARK}" transform="translate(-2.5 -3.5) scale(0.42)" fill="{PEB["light"]}"/></g>')


def ears():
    return (f'<circle cx="36" cy="60" r="16" fill="{DEEP}"/><circle cx="37" cy="61" r="8.5" fill="{DEEPER}"/>'
            f'<circle cx="164" cy="60" r="16" fill="{DEEP}"/><circle cx="163" cy="61" r="8.5" fill="{DEEPER}"/>')


def face():
    w = f'M100 {MY-3} V{MY} M88 {MY} Q94 {MY+7} 100 {MY} Q106 {MY+7} 100 {MY}'  # placeholder replaced below
    w = f'M100 {MY-3} V{MY} M{100-12} {MY} Q{100-6} {MY+7} 100 {MY} Q{100+6} {MY+7} {100+12} {MY}'
    return (f'<g fill="{DEEP}" opacity="0.8"><circle cx="44" cy="128" r="2"/><circle cx="52" cy="126" r="2"/><circle cx="49" cy="133" r="2"/>'
            f'<circle cx="156" cy="128" r="2"/><circle cx="148" cy="126" r="2"/><circle cx="151" cy="133" r="2"/></g>'
            f'<ellipse cx="{LX}" cy="{EY}" rx="7.5" ry="8.5" fill="{INK}"/><ellipse cx="{RX}" cy="{EY}" rx="7.5" ry="8.5" fill="{INK}"/>'
            f'<path d="{w}" stroke="{INK}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{NOSE}" fill="{INK}"/>')


def head():
    return (f'<defs><clipPath id="hc"><path d="{HEAD}"/></clipPath></defs>'
            f'<path d="{HEAD}" fill="{CARAMEL}"/>'
            f'<g clip-path="url(#hc)"><path d="{BAND}" fill="{CREAM}"/><path d="M0 150 Q100 166 200 150 V240 H0Z" fill="{DEEP}" opacity="0.18"/></g>'
            f'<path d="{SPARK}" transform="translate(100 80) scale(0.42)" fill="{CREAM}"/>' + face())


CHEST = 'M100 136 C136 136 152 170 152 196 V240 H48 V196 C48 170 64 136 100 136Z'  # BODY run down to the canvas edge (cropped at the chest)


def body():
    return f'<path d="{CHEST}" fill="{CARAMEL}"/>'


def belly():
    return f'<ellipse cx="100" cy="204" rx="30" ry="30" fill="{CREAM}"/>'


def arms():
    # left arm + paw as in the app; right arm reaches up to the pebble
    return (f'<ellipse cx="70" cy="176" rx="13" ry="17" transform="rotate(-20 70 176)" fill="{CARAMEL}"/>'
            f'<ellipse cx="70" cy="180" rx="9" ry="10" fill="{CARAMEL}"/>'
            f'<ellipse cx="136" cy="186" rx="14" ry="22" transform="rotate(-18 136 186)" fill="{CARAMEL}"/>')


def right_paw():
    return (f'<ellipse cx="153" cy="181" rx="11.5" ry="12" fill="{CARAMEL}"/>'
            f'<path d="M147 176 h5 M147 182 h5" stroke="{DEEPER}" stroke-width="2" stroke-linecap="round"/>')


def otter_layer():
    return ears() + body() + arms() + belly() + head()


def pebble_layer():
    return pebble() + right_paw()


def svg(w, h, inner):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{inner}</svg>'


def place(inner, s, cx, ty):
    """pet units -> px: x centred on cx (pet x=100), pet y=0 at ty."""
    return f'<g transform="translate({cx - 100 * s} {ty}) scale({s})">{inner}</g>'


def render(svg_text, out_png, tmp):
    src = os.path.join(tmp, os.path.basename(out_png) + '.svg')
    with open(src, 'w') as f:
        f.write(svg_text)
    subprocess.run(['sips', '-s', 'format', 'png', src, '--out', out_png], check=True, capture_output=True)


def icon_art(size, s, ty, background=True):
    parts = []
    if background:
        parts.append(f'<defs><radialGradient id="lift" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="{BLUE_LIGHT}"/>'
                     f'<stop offset="1" stop-color="{BLUE}"/></radialGradient></defs><rect width="{size}" height="{size}" fill="url(#lift)"/>')
    parts.append(place(otter_layer() + pebble_layer(), s, size / 2, ty))
    return svg(size, size, ''.join(parts))


def mono_art(size, s, ty):
    k = '#000000'
    sil = (f'<defs><clipPath id="hc2"><path d="{HEAD}"/></clipPath></defs>'
           f'<circle cx="36" cy="60" r="16" fill="#fff"/><circle cx="164" cy="60" r="16" fill="#fff"/><path d="{HEAD}" fill="#fff"/>'
           f'<ellipse cx="{LX}" cy="{EY}" rx="7.5" ry="8.5" fill="{k}"/><ellipse cx="{RX}" cy="{EY}" rx="7.5" ry="8.5" fill="{k}"/>'
           f'<path d="{NOSE}" fill="{k}"/><path d="M100 {MY-3} V{MY} M88 {MY} Q94 {MY+7} 100 {MY} Q106 {MY+7} 112 {MY}" stroke="{k}" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
           f'<path d="{SPARK}" transform="translate(100 78) scale(0.6)" fill="{k}"/>')
    return svg(size, size, place(sil, s, size / 2, ty))


def main():
    tmp = tempfile.mkdtemp()
    try:
        # 1024 full-bleed: face ~72 % wide (units 20..180 -> 4.6 px/unit), cropped at the chest
        icon = os.path.join(IMG, 'icon.png')
        render(icon_art(1024, 4.6, 150 - 34 * 4.6 + 20), icon, tmp)
        Image.open(icon).convert('RGB').save(icon)

        # Android adaptive foreground: transparent, otter + pebble inside the safe zone
        render(icon_art(512, 1.55, 78, background=False), os.path.join(IMG, 'android-icon-foreground.png'), tmp)
        Image.new('RGB', (512, 512), BLUE).save(os.path.join(IMG, 'android-icon-background.png'))
        mono = os.path.join(IMG, 'android-icon-monochrome.png')
        render(mono_art(512, 1.9, 262 - 96 * 1.9), mono, tmp)
        im = Image.open(mono).convert('RGBA')
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                px[x, y] = (255, 255, 255, int(a * (r / 255.0)))
        im.save(mono)

        # splash: face + pebble, centred
        splash = place(ears() + head() + pebble_layer(), 2.7, 256, 36 - 34 * 2.7 + 12)
        render(svg(512, 512, splash), os.path.join(IMG, 'splash-icon.png'), tmp)

        fav = os.path.join(tmp, 'fav.png')
        render(icon_art(256, 1.15, 38 - 34 * 1.15 + 5), fav, tmp)
        Image.open(fav).convert('RGB').resize((48, 48), Image.LANCZOS).save(os.path.join(IMG, 'favicon.png'))

        # iOS 26 Icon Composer: two layers (otter, pebble+paw) on a solid deep-blue fill, 1024 canvas
        assets = os.path.join(ICON, 'Assets')
        shutil.rmtree(assets, ignore_errors=True)
        os.makedirs(assets)
        s, ty = 4.6, 150 - 34 * 4.6 + 20
        with open(os.path.join(assets, 'otter.svg'), 'w') as f:
            f.write(svg(1024, 1024, place(otter_layer(), s, 512, ty)))
        with open(os.path.join(assets, 'pebble.svg'), 'w') as f:
            f.write(svg(1024, 1024, place(pebble_layer(), s, 512, ty)))
        pos = {'scale': 1, 'translation-in-points': [0, 0]}
        manifest = {
            'fill': {'solid': 'extended-srgb:0.00000,0.20392,0.34902,1.00000'},
            'groups': [{
                'layers': [
                    {'image-name': 'pebble.svg', 'name': 'pebble', 'position': pos},
                    {'image-name': 'otter.svg', 'name': 'otter', 'position': pos},
                ],
                'shadow': {'kind': 'neutral', 'opacity': 0.5},
                'translucency': {'enabled': False, 'value': 0.2},
            }],
            'supported-platforms': {'circles': ['watchOS'], 'squares': 'shared'},
        }
        with open(os.path.join(ICON, 'icon.json'), 'w') as f:
            json.dump(manifest, f, indent=2)
            f.write('\n')
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('icons written')


if __name__ == '__main__':
    main()
