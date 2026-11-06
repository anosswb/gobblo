# transitions review — reference/prototype.html (v0.3), 2026-11-06

Skill: `transitions-polish` → `transitions review` (rules: match on usage, never the nearest number). Nothing was edited.
Good news: the prototype already imports the full transitions.dev token set (`:root` lines 11–19). Most values are on-grid. These are the ones that should change **when we port to Reanimated**:

| # | where (line) | usage | now | → token / fix | why |
|---|---|---|---|---|---|
| 1 | L235–236 `.focus` | panel open + close | 500ms, overshoot `(.2,.95,.3,1.05)` both ways | open `--duration-slow` 400ms, close `--duration-medium` 350ms, `--ease-smooth-out` | never bounce a close; closes are quicker |
| 2 | L374–375 `.toast` | toast open/close | 400ms overshoot `(.3,1.5,.5,1)` both ways | open 400ms ease (Sonner), close `--duration-medium` 350ms no overshoot | no bounce on exit |
| 3 | L213 `.sheet-bd` | sheet backdrop | 250ms default ease | 500ms `--ease-sheet` (same as the sheet) | Vaul: sheet, overlay and page share one curve |
| 4 | L259, L261 `.keep`, `.confirm` | modal open | 450ms / 350ms popin overshoot | `--duration-fast` 250ms + `--scale-large` 0.96 + smooth-out; close 150ms | in-place card, not a celebration |
| 5 | L271 + L1227 `.pitem` | list item enter (dump result) | 500ms, −30px, rotate −4°, scale .9, stagger **90ms × 12 = 1080ms** | `--distance-medium` 12px, scale ≥ .96, stagger `--duration-stagger` 40ms, cap 8 items | last item feels late; 30px reads sluggish |
| 6 | L195 + L981 `.bite` popin | list enter | stagger 50ms × all bites (uncapped) | 40ms, cap at 8 rows (total ≤ 320ms) | same |
| 7 | L255 `.fsay` | text swap (pet line on focus) | opacity 200ms only | `--duration-quick` 150ms ease-in-out + 4px Y + 2px blur | text-swap recipe, like the bubble already uses |
| 8 | L110 `.tab.on svg` | tab icon swap | 400ms overshoot (1.6) | `--duration-fast` 250ms; in RN: Screenrove plateau spring 620/42/0.35 | tabs sliding is symmetric 250ms |
| 9 | L130 sparks `.bump` | badge pop | 500ms `(.3,1.8,.5,1)` | 500ms `--ease-bounce` (0.34,1.36,0.64,1) | on-grid bounce, less wobble |
| 10 | L153, L306 belly / progress | progress fill | animates `width` 800ms | animate `scaleX` (transform) with spring 210/34/0.9 | width = layout = jank on Android |
| 11 | L360 `born` | hatch / evolve peak | scale 0.2 → 1 | keep (peak moment exception), but start at ≥ 0.55 for small "pop" icons | Screenrove: never animate from 0 for UI |

No matching token usage (left alone, these are character animation, not UI): pet bob 2.6s, blink 4.6s, spark 1.8s, aura 14s, chomp 280ms, squish 550ms, hop 700ms, typing, egg wobble, clouds, wheel 4.2s, confetti.
Reduced motion: there is one `prefers-reduced-motion` block. In the app we also add the in-app toggle and per-component fallbacks from research/motion-specs.md.

→ "Run `transitions polish` to apply these changes." We won't polish the prototype; these fixes go straight into the native motion tokens (`src/theme/motion.ts`).
