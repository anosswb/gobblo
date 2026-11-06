# Motion specs → Reanimated (from Screenrove `get_motion`, exact values from source)

Source of every number: Screenrove motion library, captured 2026-11-06. Values are kept 1:1.
Reanimated spring = `withSpring(to, { stiffness, damping, mass })`. Bezier = `Easing.bezier(a,b,c,d)`.
Reduce Motion: every row below has a fallback; we use `useReducedMotion()` + the in-app toggle.

| Nomling interaction | Screenrove entry | Spec to port | Reduce Motion |
|---|---|---|---|
| Start sheet, chop sheet, paywall sheet | `vaul-drawer` | sheet translateY 100%→0, overlay 0→1, page behind scale `(W−26)/W`, translateY 14, radius 8 — all 500 ms `bezier(0.32,0.72,0,1)`. Drag 1:1, close if v > 0.4 px/ms or ≥ 25 % height, rubber-band up `8·(ln(d+1)−2)` | 200 ms fade, no page scale |
| Sparks pill, stats, timer minutes | `motion-primitives-sliding-number` | one column per digit, spring 280/18/0.3 (looks done 190 ms), tabular nums, retarget don't restart | digits swap in place |
| Feed success (like burst) | `interior-like-burst` | icon from scale 0.55 → 1 spring 520/34/0.45; 8 square sparks 3–4 px fly 13–22 px over 440 ms `bezier(0.23,1,0.32,1)`, 0–50 ms jitter; count rolls ±7 px spring 260/34/0.8 | no sparks, instant swap |
| Bites list reorder | `interior-reorder-list` | lift scale 1.02 + deeper tinted shadow (150 ms), neighbours spring 520/34/0.45, swap when leading edge passes neighbour centre, drop carries velocity → spring 200/40/1 | jump to slot, keep shadow |
| Tab bar ("plateau springing") | `interior-tabs` | one plateau/pill moves between tabs spring 620/42/0.35; incoming content slides 12 px from travel direction spring 460/38/0.8; label weight swap with width reserved | zero duration |
| Theme picker, nudge level | `interior-segmented-control` | thumb translateX index×100 % spring 520/34/0.45, inverted label copy counter-moves (two-colour glyphs) | thumb jumps |
| Focus timer pill (in-app now, Live Activity v1.1) | `interior-live-activity` | pod springs width/height 420/36/0.9; enter y −10, scale 0.9, blur 6→0 (200 ms); faces cross-fade 260/34/0.8; check draws 300 ms; exit 160 ms `bezier(0.4,0,1,1)` to y −8, scale 0.97 | instant morph, opacity only |
| Toasts ("+1 ✦ you started", undo delete) | `sonner-toast-stack` | enter Y 100 %→0 400 ms ease; stack lift 14 px & scale −0.05 per toast, max 3; auto-hide 4 s paused on press; swipe ≥ 45 px or > 0.11 px/ms, exit 200 ms ease-out | 150 ms fade |

## House rules (Screenrove `get_motion_guidelines` + transitions.dev tokens)
- UI motion under 300 ms; exits ~70 % of enters; ease-out for enter/exit; never scale from 0 (start ≥ 0.9, or 0.55 for a burst icon); press = scale 0.97; stagger 30–50 ms, total ≤ 400 ms.
- transitions.dev tokens (already in docs/03): 40 / 80 / 150 / 250 / 350 / 400 / 500 ms; smoothOut `(0.22,1,0.36,1)`, bounce `(0.34,1.36,0.64,1)`.
- Peaks (hatch, feed, evolve) are the only things allowed to run longer (700–1400 ms).

## Sound pairing (Screenrove `suggest_polish`, sound: true → Cuelume cues)
select → tab/chip/segmented · open/close → sheets · count → sparks rolling · success → feed done · toggle → settings switches · tap → dump FAB.
Cuelume is a web package; we make our own short sounds with the same roles (≤ 200 KB total, original or CC0), via expo-audio.
