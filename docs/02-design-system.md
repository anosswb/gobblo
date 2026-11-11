# 02 — Design system (as built, Nov 2026)

Direction: **calm, flat, Apple-like**. Plain backgrounds, opaque cards, hairline edges, one colour theme chosen by the user, one character (the otter) that carries the emotion. No chunky 3D buttons, no glows, no gradients behind content. If this page and the code disagree, the code wins: fix this page.

Source files: `src/theme/tokens.ts`, `src/theme/motion.ts`, `src/theme/theme-provider.tsx`, `src/components/*`.

## Colour (`src/theme/tokens.ts`)
- **5 palettes × light + dark = 10 looks**: Ink (default, deep navy `#003459`), Blush, Cotton, Sage, Graphite. All free, picked in Settings › Appearance › Theme (`settings.palette`). Scheme follows the system unless overridden (System / Light / Dark).
- Each look is built by `makeLook(scheme, seed)` from a few seed colours (`seeds`); `palettes[p].light|dark` are `ColorTokens`. `looksOf(p)` falls back to Ink. The old tint picker (`accent`) is only kept in saves. A jest test checks WCAG contrast for all 10 looks.
- Components read colours only from `useTheme().colors`. No hex in components (illustration files such as `pet/`, `egg.tsx`, `wardrobe.tsx` are the exception).

| Token | Use |
|---|---|
| `bg`, `bgTop`, `bgBottom` | page background; the three form a very soft vertical tone (`Backdrop`) |
| `card`, `cardSolid`, `cardAlt` | rows and cards (opaque); wells and pressed rows |
| `cardBorder`, `line` | hairline edges and separators |
| `fill`, `fill2`, `thumb` | input wells, switch off-track, segmented thumb and knob |
| `glass`, `glassBorder`, `glassEdge` | floating layers (tab bar, toasts, chips) |
| `ink`, `ink2`, `ink3` | text: main, secondary (about 70%), hint (50%) |
| `primary` | the theme colour as a **fill**: buttons, selected states, dots |
| `onPrimary` | text or icon **on** a `primary` fill (dark on pastel themes, white or dark on the others) |
| `primaryInk` | the theme colour as **text or icon on the page**; a darker shade when `primary` is a pastel. `<Text tone="primary">` uses it |
| `primaryDeep`, `primarySoft` | pressed shade; about 12% tint for chips and soft buttons |
| `reward`, `rewardDeep`, `onReward` | the main "do it" button is **ink on the page** (black on light, light on dark) |
| `success`, `danger`, `pink`, `sun` | status colours; `sun` is the spark yellow |
| `shadow`, `scrim`, `tabBar` | shadows, dim behind sheets, tab bar fill |
| `focus*`, `onFocus*` | the night room (same in both themes; used by the evolution and share card) |
| `room*` | the focus timer room: follows the theme (light room in light, night room in dark) |
| `onLightScene` | text on a light Closet room (rooms stay light in dark mode) |
| `sceneDim`, `onTile`, `knob` | dims bright scenes in dark; white glyph on settings tiles; white switch knob |

Also in tokens: `tiles` (iOS Settings icon-tile colours), `petColors` (the otter's body colours, 10 + weekly), `roomGradients` (Closet rooms), `stageLook(...)` (Home stage tint **and water**: a soft tint of the theme, with calm water mixed from the tint toward `primary`, or from the room's bottom colour; `water`, `waterDeep`, `crest`).

Background rule: **pure and flat**. `Backdrop` is one soft linear gradient, nearly flat in dark. No glows, no blobs, no looping motion behind content.

## Type
- iOS: the system font (SF Pro, optical sizes and tracking for free). Android and web: **Inter** (400/500/600/700, `@expo-google-fonts/inter`), tracking set by hand (`tracking()`). `_layout.tsx` also still loads Nunito (not used by `font()`; can be removed).
- Use `<Text variant tone>` only. Variants: `title` (34), `title2` (22), `heading` (20), `body` (17), `bodyBold`, `subhead` (15), `caption` (13), `label` (12), `timer` (76, tabular numbers).
- Dynamic Type is capped at `MAX_FONT_SCALE = 1.4`. Copy is sentence case.

## Space, radius
- 8-pt grid `space`: xs 4, s 8, m 12, l 16, xl 24, xxl 32, xxxl 48; gutter 16.
- `radius`: chip and button 999 (capsules), field 14, row 12, card 26, scene 32, sheet 38.
- Tap targets at least 44×44.

## Components (`src/components`)
- **PressScale**: the press feedback for every button (scale 0.97 in 80 ms, back in 150 ms, instant under Reduce Motion). There are no 3D press-down buttons.
- **Glass**: one material for floating layers. iOS 26: real Liquid Glass (`expo-glass-effect`); older iOS and web: blur plus bright edge; Android: frosted translucent fill. Never glass on glass.
- **Icon**: one set, no emoji in UI. iOS: SF Symbols (`expo-symbols`). Android and web: Lucide (`lucide-react-native`, one import per glyph). Names live in the `MAP` in `icon.tsx`. (Phosphor is no longer used.)
- Others: `Screen`, `Text`, `Toggle`, `Segmented`, `Toast`, `StartSheet`, `WhenPicker`, `Backdrop`, `StageBackdrop` (+ `StageWater`), `BiteIcon`/`FoodIcon`, `SlidingNumber`, floating `tab-bar`, `guide`, `settings-parts` (iOS inset-grouped rows, icon tiles).

## Motion (`src/theme/motion.ts`)
Numbers come from transitions.dev and Screenrove: `duration` (stagger 40, micro 80, quick 150, fast 250, medium 350, slow 400, verySlow 500), `easing` (smoothOut, strongOut, sheet, bounce for entrances only, inOut), `spring` (apple = no overshoot, the default; snappy, lens, sheet, squish for the pet, plateau, panel, firm, and more), `scale` (press 0.97, burstFrom 0.55), `distance`, `staggerDelay` (max 8 items). Rules in `.claude/rules/animation.md` and docs/03. Reduce Motion swaps movement for a fade.

## Screens
- **Home**: the plate (bites) first, the pet's stage above it. The stage is the theme tint (or the chosen Closet room) with a **water line** at the bottom (`WATER_SHARE` 18% of the stage). The otter floats just above it. When you feed a bite it does the **happy dive**: hop, splash, under the water line (about 1 s, 2 s for big bites and level-ups), bubbles, splash, back with the pebble (`src/pet/dive*.tsx`, docs/18 §5). Reduce Motion: fades only.
- **Long-press focus mode** (a bite on Home, `screens/home/bite-focus.tsx`): hold a bite and it lifts, the rest dims (blur on iOS, dim only on Android), and a small menu opens above it: Start, Do this first, Later (only for bites on today's plate), Remove. Dragging the lifted bite onto the otter still feeds it.
- **Closet** (`screens/closet`): hats, faces, colours, rooms. Items open by level, by the weekly surprise, by Plus, or are bought **one at a time with sparks** ("Get it · ✦ 40") on both platforms. Prices live in `features/closet/shop.ts` (`SHOP_PRICES`); ownership is `itemOpen` (free/level/week/Plus **or** bought, saved in `pet.owned`). Spending never lowers the level (`stats.total` is untouched). Android only: an optional video for +15 ✦.
- Settings: iOS-style pet card on top, one row per topic, each opening its own page.

## The otter
See docs/18 (mascot bible). Flat in the app, drawn in code with `react-native-svg` (`src/pet/pet.tsx`, `wardrobe.tsx`, `egg.tsx`). Default body caramel; the spark pebble is a chubby 4-point star. Colour options, hats, glasses and rooms come from the Closet. The old blob with the antenna is gone.

## App icon
The otter's face with the pebble on Ink deep blue `#003459` (docs/18 §4). iOS Icon Composer layers, Android adaptive and monochrome versions (`scripts/gen-icons.py`).

## Screen checklist
One thing to notice first · primary action in the thumb zone · all states (loading, empty, error, success) · light and dark of the chosen palette · small screens (SE, 360 dp) · Reduce Motion · `accessibilityLabel` on icon buttons.
