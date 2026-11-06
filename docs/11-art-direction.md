# 11 — Art direction: "lo-fi jelly" (chosen Nov 2026)

## The decision
Anass generated round 1 in Google Flow. The **3D glossy jelly pet** (G1 eating the to-do list, G2 at the desk with headphones) and the **moody flat scenes** (D1–D4) won. The kawaii 2D style (faces on food, flat pets, flat paywall) felt too childish, so it moved to `assets/flow/redo/`.

Feeling we want: **cozy, a bit funny, premium, not babyish.** Think "study with me" lo-fi stream + a collectible designer vinyl toy, not a kids' game.

## Why this fits ADHD Gen Z
- **Lo-fi / "study with me" culture** = body doubling. The focus room (D4) with the pet at a desk is exactly that vibe.
- **Low clutter, one hero thing per screen.** Moody backgrounds keep the eye on the pet and the one action.
- **Instant dopamine:** glossy squish, chomp, confetti. Satisfying, but short (under 1 s) so it doesn't drag.
- **Novelty:** new hats, species and rooms drop regularly.
- **Humor and self-awareness** ("your brain isn't lazy. it's hungry.") instead of baby talk.
- **No shame:** the pet naps, it never cries or dies.

## Rules
- **Pet:** glossy jelly bean, subtle specular highlights, soft shadow. **Small dot eyes by default** (calm, adult). Big eyes only for strong moments (hungry, surprised). The lime antenna orb is the brand signature.
- **Scenes:** flat illustration with soft gradients and grain. Morning/day/night by local time, the night focus room for Focus.
- **No faces on objects** (food, items) and no kawaii stickers in the UI. Food is either emoji (v1) or small glossy 3D icons with no faces.
- **UI:** Bricolage Grotesque display + Figtree body, chunky buttons, cobalt + lime accents. Dark mode is moody, not just inverted.
- **Marketing/TikTok:** the 3D renders (G1, G2) + real app screen recordings.

## Which file goes where (`assets/flow/keep/`)
| file | use |
|---|---|
| G1-marketing-eating-todo | onboarding splash hero, App Store screenshot 1, TikTok |
| G2-marketing-focus-desk | focus mode promo, App Store screenshot 3, landing page |
| D1 / D2 / D3 scene | Home scene card background (morning / day / night) |
| D4-focus-room-night | Focus screen background (with a dark gradient on top) |
| E4-celebration-burst | Evolution screen background |
| C2-app-icon-dark | app icon direction (polish it: bigger face, less empty space, a light version too) |
| maybe/G3 (crop) | paywall hero (crop to the pet + food) |
| maybe/D5, D6 | the pet's room (Plus feature): use only if redone in the jelly style |

The prototype (`reference/prototype.html`, v0.3) already uses all of this. Copy its look.

## In the real app (Claude Code)
- Rebuild the pet in **Skia** (radial gradients, blurred highlights, soft shadows) so it can animate and look like G1/G2. The SVG in the prototype shows the layering. Optional upgrade later: a Rive file.
- Backgrounds as WebP @2x/@3x, with a parallax layer split if Anass generates separate layers (sky / hills / floor).
