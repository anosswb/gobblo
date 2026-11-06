# Research phase — summary (2026-11-06)

## Proof of tools used
| tool | what ran | output |
|---|---|---|
| Expo plugin + MCP | installed, logged in, MCP tools load (docs search, EAS build/workflow, simulator, observe) | ready for Phase 1 |
| Screenrove MCP | list_products, get_flow (duolingo), get_design (duolingo, product), search_screens ×7, get_screen_image ×4, find_related_screens, compare_screens, check_my_ui ×2, search_motion, get_motion ×8, suggest_polish (sound: true) | research/refs/ (36 screens + README), research/motion-specs.md |
| transitions.dev | skill installed; `transitions review` on the prototype | research/transitions-review.md (11 fixes) |
| replica-recon | Finch + Tiimo, clean room, public sources | replica/recon.md, replica/features.csv (62 rows) |
| replica-entrepreneur | re-run with Google Play + Reddit + Goblin Tools | running (docs/07 update) |
| replica-brand | "Nomling" name check + sweep.py | running (docs/brand-name-check.md) |
| mobile-app-ui-design | installed; its rules applied to the boards (8-pt grid, 60/30/10, thumb zone, one hero per screen) | research/directions/ |
| websites | screenrove.com, transitions.dev, RevenueCat report (deck.gallery needs an account) | research/web-notes.md |
| Later phases | build_recipe/build_handoff (before each screen), check_my_ui on real screenshots, replica-design + contrast.py (on chosen direction), replica-diff, replica-test, replica-launch, replica-deploy | not yet: they need the direction pick or built screens |

## What I learned (the honest part)
- **Screenrove = desktop web captures (1440×900)**, mostly SaaS. Good for flows, states, motion. Not for mobile layout. `check_my_ui` found no close mobile match for our home screen.
- **Finch also starts with "pick egg colour → name with shuffle → tap to hatch".** Our onboarding is too close. Apple 4.3 (copycat) risk and it looks unoriginal. → Fix in improvement #1.
- RevenueCat: ~50 % of paid conversions happen on day 0; Health & Fitness D35 conversion 2.9 % median; hard paywalls convert 5× but refund more. One in four apps offer lifetime.
- The prototype v0.3 is already on the transitions.dev tokens. The 11 off-token values are mostly bouncy closes and long staggers.
- Your images are 896×1200: too small and too short (3:4) for full-screen phone backgrounds.

## Top 10 improvements (beyond the spec)
1. **Hatch by feeding, not by tapping.** The egg is hungry: you type your first thought ("text mom back"), drag it into the egg, and the egg cracks and hatches *because it ate*. It's original (not Finch's tap-to-hatch), it teaches the core loop in onboarding, and it's the TikTok moment.
2. **The pet reacts to everything** (Duolingo's mascot answers every quiz pick): the quiz bubble replies per chip, the pet watches you type in the dump, its eyes follow scrolling, it dozes after 20 s idle, sleeps at night, and wakes up happy on a comeback.
3. **Value in under 90 s:** hook → 1 quiz screen → feed-to-hatch → 2-minute start offer. No separate "name" screen: you name it right after it hatches ("it needs a name!"), with the dice.
4. **Shared-element bite → focus:** the food you drop flies into the timer ring and becomes the donut that gets eaten. One continuous motion from home to focus.
5. **Feed result card** (Duolingo lesson-complete pattern, our content): 2 stat tiles "+3 ✦" and "12 min focused" with a like-burst, sliding-number sparks and one "continue". Android: "double it (watch ad)" appears only after the celebration ends.
6. **Sheets and toasts from real specs:** start/chop sheets on the Vaul curve with the page scaling back (500 ms, 0.32/0.72/0/1); stacked toasts (Sonner) for "+1 ✦ you started" and undo.
7. **"Keep daily" toggle on a bite** (recon MATCH gap): it stays on the plate every day. No forced days, no times.
8. **Free basic pet widget** in v1.1 for both stores (Finch's is free); the interactive "start 2 min" widget and the Live Activity stay Plus.
9. **Soft Plus moment after the first feed** (day 0, after value), as a dismissible "meet the plus friends" card. Never a modal, never in onboarding. "one-time · no subscription" is the headline.
10. **Living scenes:** time-of-day scenes with 2–3 parallax layers (expo-sensors tilt, max 8 px) and small ambient loops (clouds, fireflies, lamp flicker). They only work if the art comes in layers (see art requests).

## Screen list (v1)
| # | screen | states |
|---|---|---|
| 1 | Hook | first launch, returning (skipped) |
| 2 | Quiz "what wrecks your day?" | none picked, picked (pet reply), skipped |
| 3 | Feed-to-hatch | egg idle, typing, dragging, cracking (3 stages), hatched + name + dice |
| 4 | Gentle nudges ask | yes → OS prompt, not now |
| 5 | Home | populated, empty plate, first-time (bubble hint), returning, comeback (wake up), night (sleepy), loading skeleton |
| 6 | Brain dump (modal) | empty, typing (pet watches), parsed preview, nothing found (shake), served |
| 7 | Start sheet | 2/15/25, big bite + chop, chopped result |
| 8 | Focus | running, paused, 2-min done "keep going", drifted, leave confirm, background + notification |
| 9 | Feed result | celebration, stats card, (Android) double-sparks offer |
| 10 | Evolution | stage 1→2, 2→3, 3→4 |
| 11 | Spin | idle, spinning, result, no bites (snacks only) |
| 12 | Closet | owned, locked (sparks), Plus item (iOS), try-for-24h (Android ad), buy success, can't afford (shake) |
| 13 | Plus paywall (iOS) | loading price, ready, purchasing, success, error, restore |
| 14 | Rewarded ad flow (Android) | consent (UMP), loading, earned, failed, daily cap reached |
| 15 | Me | stats, stage progress, brain card, share sheet |
| 16 | Settings | theme, sound, haptics, reduce motion, nudges + quiet hours, backup export/import, privacy options (Android), restore (iOS), about (not a medical device), reset 2-step |
| 17 | Dev: pet lab | all moods, stages, hats, colours (dev build only) |

## Art requests for Flow (round 3)
1. **R1 expression sheet first** (style guide for the Skia pet). Final look: small dot eyes + lime antenna orb.
2. D1, D2, D3, D4, E4 again at **9:16, 2K**, and if Flow can, **in layers**: sky only / hills or room only / floor only (for parallax).
3. A **hungry egg** (R-new): same jelly material, a soft mouth-shaped crack, plain lilac background, 1:1.
4. C2 as a square 1:1 with a bigger face (and R10/R11).
