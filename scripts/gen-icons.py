#!/usr/bin/env python3
"""
App icons from the pet rig (same geometry as src/pet/pet.tsx, 'happy' face).

  python3 -I scripts/gen-icons.py

Writes:
  assets/images/icon.png                    1024, full bleed (web, fallback)
  assets/images/android-icon-foreground.png 512, pet inside the adaptive safe zone
  assets/images/android-icon-background.png 512, night gradient
  assets/images/android-icon-monochrome.png 512, white silhouette (themed icons)
  assets/images/splash-icon.png             512, pet only
  assets/images/favicon.png                 48
  assets/expo.icon/                         iOS 26 Icon Composer bundle (Liquid Glass):
                                            body + face as separate layers on a night fill

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

PINK = '#FF5C9D'
INK = '#2A1533'
ORB = '#C6F432'
ORB_LIGHT = '#F4FFC2'
BLUSH = '#FF3D7F'
NIGHT_TOP = '#3A2A86'
NIGHT_BOTTOM = '#140F33'


def shade(hex_color, amt):
    n = int(hex_color[1:], 16)
    t = 0 if amt < 0 else 255
    p = abs(amt)
    ch = lambda v: round((t - v) * p + v)
    r, g, b = ch(n >> 16), ch((n >> 8) & 255), ch(n & 255)
    return '#%02X%02X%02X' % (r, g, b)


LIGHT, LIT, DEEP, DEEPER = shade(PINK, 0.62), shade(PINK, 0.22), shade(PINK, -0.14), shade(PINK, -0.26)
BODY = 'M100 54 C146 54 170 90 170 138 C170 192 142 222 100 222 C58 222 30 192 30 138 C30 90 54 54 100 54Z'

DEFS = f'''<defs>
  <radialGradient id="body" cx="34%" cy="24%" r="88%">
    <stop offset="0" stop-color="{LIGHT}"/><stop offset="0.32" stop-color="{LIT}"/>
    <stop offset="0.72" stop-color="{PINK}"/><stop offset="1" stop-color="{DEEP}"/>
  </radialGradient>
  <linearGradient id="under" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.1"/>
  </linearGradient>
  <radialGradient id="orb" cx="38%" cy="34%" r="70%">
    <stop offset="0" stop-color="{ORB_LIGHT}"/><stop offset="1" stop-color="{ORB}"/>
  </radialGradient>
  <radialGradient id="limb" cx="40%" cy="30%" r="80%">
    <stop offset="0" stop-color="{LIT}"/><stop offset="1" stop-color="{PINK}"/>
  </radialGradient>
  <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{NIGHT_TOP}"/><stop offset="1" stop-color="{NIGHT_BOTTOM}"/>
  </linearGradient>
  <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0.45" stop-color="{ORB}" stop-opacity="0.55"/><stop offset="1" stop-color="{ORB}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="{PINK}" stop-opacity="0.55"/><stop offset="1" stop-color="{PINK}" stop-opacity="0"/>
  </radialGradient>
</defs>'''


def body_art(mono=False):
    if mono:
        w = '#FFFFFF'
        return f'''<path d="M100 58 Q96 36 111 22" stroke="{w}" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="112" cy="20" r="12" fill="{w}"/>
<ellipse cx="36" cy="152" rx="16" ry="11" transform="rotate(-28 36 152)" fill="{w}"/>
<ellipse cx="164" cy="152" rx="16" ry="11" transform="rotate(28 164 152)" fill="{w}"/>
<ellipse cx="78" cy="218" rx="20" ry="10" fill="{w}"/><ellipse cx="122" cy="218" rx="20" ry="10" fill="{w}"/>
<path d="{BODY}" fill="{w}"/>'''
    return f'''<path d="M100 58 Q96 36 111 22" stroke="{DEEPER}" stroke-width="5" fill="none" stroke-linecap="round"/>
<circle cx="112" cy="20" r="24" fill="url(#orbGlow)"/>
<circle cx="112" cy="20" r="11" fill="url(#orb)"/>
<circle cx="108.5" cy="16.5" r="3.2" fill="#fff" opacity="0.9"/>
<ellipse cx="78" cy="218" rx="20" ry="10" fill="{DEEPER}"/><ellipse cx="122" cy="218" rx="20" ry="10" fill="{DEEPER}"/>
<ellipse cx="36" cy="152" rx="16" ry="11" transform="rotate(-28 36 152)" fill="url(#limb)"/>
<ellipse cx="164" cy="152" rx="16" ry="11" transform="rotate(28 164 152)" fill="url(#limb)"/>
<path d="{BODY}" fill="url(#body)"/><path d="{BODY}" fill="url(#under)"/>
<path d="M156 112 Q166 142 157 172" stroke="#fff" stroke-width="3.5" fill="none" opacity="0.28" stroke-linecap="round"/>
<ellipse cx="70" cy="92" rx="17" ry="30" transform="rotate(-24 70 92)" fill="#fff" opacity="0.32"/>
<ellipse cx="64" cy="78" rx="6" ry="11" transform="rotate(-24 64 78)" fill="#fff" opacity="0.85"/>'''


def face_art(mono=False):
    if mono:  # punched out of the silhouette by drawing in black on a white-only image, then made transparent
        k = '#000000'
        return f'''<ellipse cx="80" cy="128" rx="9" ry="10.5" fill="{k}"/><ellipse cx="120" cy="128" rx="9" ry="10.5" fill="{k}"/>
<path d="M90 150 Q100 161 110 150" stroke="{k}" stroke-width="6" fill="none" stroke-linecap="round"/>'''
    return f'''<ellipse cx="62" cy="152" rx="13" ry="7.5" fill="{BLUSH}" opacity="0.3"/>
<ellipse cx="138" cy="152" rx="13" ry="7.5" fill="{BLUSH}" opacity="0.3"/>
<ellipse cx="80" cy="128" rx="8" ry="9.5" fill="{INK}"/><circle cx="82.8" cy="124.6" r="2.8" fill="#fff"/>
<ellipse cx="120" cy="128" rx="8" ry="9.5" fill="{INK}"/><circle cx="122.8" cy="124.6" r="2.8" fill="#fff"/>
<path d="M90 150 Q100 161 110 150" stroke="{INK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'''


def svg(w, h, inner, view='0 0 200 240'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{view}">{DEFS}{inner}</svg>'


def pet_on_canvas(size, pet_h, cy, background=True, glow=True, mono=False):
    """the pet centred horizontally, pet_h px tall, its middle at cy."""
    s = pet_h / 240.0
    tx = size / 2 - 100 * s
    ty = cy - 120 * s
    parts = []
    if background:
        parts.append(f'<rect width="{size}" height="{size}" fill="url(#night)"/>')
    if glow:
        parts.append(f'<circle cx="{size/2}" cy="{cy}" r="{size*0.42}" fill="url(#glow)"/>')
    parts.append(f'<g transform="translate({tx} {ty}) scale({s})">{body_art(mono)}{face_art(mono)}</g>')
    return svg(size, size, ''.join(parts), view=f'0 0 {size} {size}')


def render(svg_text, out_png, tmp):
    src = os.path.join(tmp, os.path.basename(out_png) + '.svg')
    with open(src, 'w') as f:
        f.write(svg_text)
    subprocess.run(['sips', '-s', 'format', 'png', src, '--out', out_png], check=True, capture_output=True)


def main():
    tmp = tempfile.mkdtemp()
    try:
        # 1024 full-bleed icon
        render(pet_on_canvas(1024, 840, 530), os.path.join(IMG, 'icon.png'), tmp)
        Image.open(os.path.join(IMG, 'icon.png')).convert('RGB').save(os.path.join(IMG, 'icon.png'))

        # Android adaptive: 512 canvas, keep the pet inside the 66 % safe circle
        render(pet_on_canvas(512, 300, 262, background=False, glow=False), os.path.join(IMG, 'android-icon-foreground.png'), tmp)
        render(svg(512, 512, f'<rect width="512" height="512" fill="url(#night)"/><circle cx="256" cy="262" r="215" fill="url(#glow)"/>', view='0 0 512 512'),
               os.path.join(IMG, 'android-icon-background.png'), tmp)
        mono = os.path.join(IMG, 'android-icon-monochrome.png')
        render(pet_on_canvas(512, 300, 262, background=False, glow=False, mono=True), mono, tmp)
        im = Image.open(mono).convert('RGBA')
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                # white body stays; black face holes and anti-aliased edges become transparency
                px[x, y] = (255, 255, 255, int(a * (r / 255.0)))
        im.save(mono)

        # splash + favicon
        render(svg(512, 615, body_art() + face_art()), os.path.join(IMG, 'splash-icon.png'), tmp)
        fav = os.path.join(tmp, 'fav.png')
        render(pet_on_canvas(256, 230, 132), fav, tmp)
        Image.open(fav).convert('RGB').resize((48, 48), Image.LANCZOS).save(os.path.join(IMG, 'favicon.png'))

        # iOS 26 Icon Composer bundle: two layers so Liquid Glass lights the body and face separately
        assets = os.path.join(ICON, 'Assets')
        shutil.rmtree(assets, ignore_errors=True)
        os.makedirs(assets)
        with open(os.path.join(assets, 'body.svg'), 'w') as f:
            f.write(svg(700, 840, body_art()))
        with open(os.path.join(assets, 'face.svg'), 'w') as f:
            f.write(svg(700, 840, face_art()))
        manifest = {
            'fill': {'automatic-gradient': 'extended-srgb:0.17647,0.12941,0.41176,1.00000'},
            'groups': [
                {
                    'layers': [
                        {'image-name': 'face.svg', 'name': 'face', 'position': {'scale': 1, 'translation-in-points': [0, 24]}},
                        {'image-name': 'body.svg', 'name': 'body', 'position': {'scale': 1, 'translation-in-points': [0, 24]}},
                    ],
                    'shadow': {'kind': 'neutral', 'opacity': 0.5},
                    'translucency': {'enabled': False, 'value': 0.2},
                }
            ],
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
