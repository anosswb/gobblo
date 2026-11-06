# 02 — Design system

Direction: **chunky toy UI**. Soft lilac paper, cobalt for actions, lime for rewards. Big rounded shapes, 3D "press-down" buttons (Duolingo-style bottom shadow), one character that carries the emotion. Playful, but adults are not embarrassed to film it.

Reference check (Screenrove MCP): `get_design` for Duolingo (mascot-led, chunky buttons) and `get_flow` for Duolingo onboarding. Take patterns, never assets.

## Color tokens (`src/theme/tokens.ts`)
| token | light | dark | use |
|---|---|---|---|
| bg | #F0EFFF | #0F0D1F | screen background (60%) |
| card | #FFFFFF | #1A1733 | cards, sheets, tab bar |
| cardAlt | #E8E7FF | #24204A | selected chip, wells |
| ink | #1B1530 | #F3F1FF | main text |
| ink2 | ink @ 68% | ink @ 72% | secondary text |
| ink3 | ink @ 45% | ink @ 50% | hints, disabled |
| line | rgba(61,59,255,.13) | rgba(160,158,255,.16) | borders, button shadows |
| primary | #3D3BFF | #6F6CFF | buttons, active tab (10%) |
| primaryDeep | #2422C2 | #3D3BCC | primary button bottom edge |
| reward | #C6F432 | #C6F432 | sparks, success CTA |
| rewardDeep | #8DB50E | #8DB50E | reward button bottom edge |
| sun | #FFC83D | #FFC83D | timer ring, food |
| pink | #FF5C8A | #FF6F98 | cheeks, accents |
| danger | #E5484D | #FF6369 | destructive actions only |
| focusBg | gradient #4D49FF → #211D74 → #120F3D | same | focus screen (both themes) |

Sky gradients (scene card): morning #FFC9A8→#FFB3CF→#FFD9E6 · day #9FD3FF→#C9C4FF→#E4DEFF · night #14114A→#2E2380→#4A35A8 + stars. In dark theme, keep the sky but add a 12% black overlay to morning/day so it doesn't glow.

Pet colors: pink #FF5C8A · tangerine #FF8A3D · mint #22C993 · violet #8C6BFF (+ auto light/dark shades).

Rules: text on reward (lime) is always `ink` light value (#1B1530) in both themes. Check every pair with WCAG AA (replica-design's `contrast.py` works on a tokens.json). Shadows are tinted (primary at 15–30%), never pure black on color.

## Type
- Display: **Bricolage Grotesque** 600/700/800 (`@expo-google-fonts/bricolage-grotesque`). Chosen over rounded "kids" fonts so the app feels premium, not childish (docs/11)
- Body: **Figtree** 500/700 (`@expo-google-fonts/figtree`)
- Scale (only 4 + numerals): 13 / 16 / 22 / 34. Timer numerals 40–56 with `fontVariant: ['tabular-nums']`.
- Lowercase UI copy. Letter spacing −0.5 on 34, −0.3 on 22.
- Respect font scaling, capped with `maxFontSizeMultiplier={1.4}` on display text.

## Spacing, radius, elevation
- 8-pt grid: 4, 8, 12, 16, 24, 32, 48. Screen gutter 20.
- Radius: chip 999, button 18, card 24, scene 32, sheet top 32.
- Chunky button = `borderBottomWidth` 5 in the Deep color + translateY 4 on press-in (bottom edge shrinks to 1). Animate with Reanimated, 80 ms.
- Cards: 1 px `line` border + a soft tinted shadow (iOS) / elevation 2 (Android).

## Icons
- **Phosphor Icons** (`phosphor-react-native`), weight `bold` for UI and `fill`/`duotone` for active tab states. It's rounded and friendly, with 1,200+ icons, so it all stays one family. Expo now recommends specific icon packs over `@expo/vector-icons`.
- Tab bar: House, Shuffle (spin), PlusCircle (dump, a raised FAB), TShirt or CoatHanger (closet), Smiley (me). Active = fill + primary color + spring pop.
- Food: Apple color emoji look different on Android. For brand consistency, draw the 4 foods + snacks as small SVG illustrations (`src/art/food/*.tsx`) in v1.1. v1 may ship emoji.
- App icon: the pet's face (big eyes + antenna spark) on cobalt, no text. Make 1024×1024 + an Android adaptive icon (foreground pet + solid background) + a monochrome version for Android themed icons. iOS dark and tinted icon variants: provide them via app config.
- Splash: expo-splash-screen, cobalt background + pet face, both themes.

## The mascot (most important asset)
- Built in code with **react-native-svg** (same shapes as `reference/prototype.html` → `critSVG()`): body blob with a 2-path "breathing" morph, eyes with pupils + shine (pupils follow touch), blink every ~4.6 s, cheeks, smile ↔ open mouth, arms, feet, antenna with a glowing spark.
- Stage features: ears (1), belly patch + tooth (2), aura + sparkles (3).
- Accessories as separate SVG layers: party hat, bow, shades, frog hat, crown, headphones (focus mode).
- Moods: idle, poked (squish), hungry (mouth open, eyes big), eating (chomp loop), happy (hop), sleepy (eyes half-closed, Zzz, at night or comeback).
- Animate the parts with Reanimated shared values. `useAnimatedProps` on SVG paths is fine for small counts. If it drops frames on low-end Android, move the pet to **@shopify/react-native-skia**.
- Optional later: commission or generate (Nano Banana / Higgsfield) marketing art of the pet for store screenshots and TikTok, keeping the same silhouette and colors.

## Components to build (`src/ui/`)
Button (primary / reward / ghost / glass), Pill, Chip (selectable), Card, Sheet (gorhom bottom sheet), Toast, SpeechBubble, ProgressBar, Toggle, StatTile, TabBar with a raised FAB, EmptyState, ConfirmInline, SegmentedControl (theme picker), ScreenHeader.

## Screen quality checklist
One thing to notice first per screen · primary action in the thumb zone · values bigger than labels · every empty/error state has a pet illustration and a CTA · both themes screenshotted · Screenrove `check_my_ui` passes.
