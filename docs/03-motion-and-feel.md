# 03 — Motion, haptics, sound

Goal: the app should feel **alive** even when nobody touches it, and **juicy** when they do. One big peak (hatch, feed, evolve), many small rewards. Motion always supports meaning; nothing animates just to animate.

Libraries: `react-native-reanimated` (v4, with `react-native-worklets`), `react-native-gesture-handler`, `expo-haptics`, `expo-audio`, `@shopify/react-native-skia` (confetti, particles, optional pet renderer). Use Reanimated **layout animations** (`entering`, `exiting`, `LinearTransition`) for lists.

## Motion tokens (`src/theme/motion.ts`)
These are the real values from transitions.dev (`reference/design-refs/transitions-dev-tokens.css`) and Screenrove's motion guidelines (`reference/design-refs/screenrove-motion-guidelines.md`). The prototype uses them. Port them 1:1:
```ts
// transitions.dev durations
export const duration = { stagger: 40, micro: 80, quick: 150, fast: 250, medium: 350, slow: 400, verySlow: 500 };
// easings: smoothOut (transitions.dev), strongOut + sheet (Screenrove: quintic ease-out, Vaul iOS sheet curve), bounce (badge pop)
export const easing = {
  smoothOut: Easing.bezier(0.22, 1, 0.36, 1), strongOut: Easing.bezier(0.23, 1, 0.32, 1),
  sheet: Easing.bezier(0.32, 0.72, 0, 1), bounce: Easing.bezier(0.34, 1.36, 0.64, 1), digit: Easing.bezier(0.34, 1.45, 0.64, 1),
};
// recipes: number pop-in 500ms / 8px / 70ms stagger / 2px blur · text swap 150ms / 4px / 2px blur · modal 250 open, 150 close, scale 0.96
// icon swap 250ms from scale 0.25 + 2px blur · error shake 6px then 4px overshoot, 80/60ms segments · success check 500ms, rotate from 80deg, blur from 10px
// Screenrove rules: UI motion under 300ms, exit faster than enter, ease-out for enter/exit, never animate from scale(0) (start at 0.9+), buttons scale 0.97 on press,
// stagger 30-50ms capped at ~400ms total, sheets open with the Vaul curve over ~500ms while the page behind scales to ~0.94.
// Older starting values, kept for springs:
export const dur = { tap: 80, fast: 160, base: 240, slow: 400, hero: 700 };
export const spring = {
  pop:    { damping: 12, stiffness: 260, mass: 0.8 },  // bounces: chips, badges, pills
  gentle: { damping: 18, stiffness: 180 },             // sheets, cards
  wobble: { damping: 8,  stiffness: 200 },             // pet squish, egg shake
};
export const ease = { out: Easing.bezier(0.2, 0.9, 0.3, 1), inOut: Easing.bezier(0.45, 0, 0.55, 1) };
```

## transitions.dev → React Native mapping
The skill ships **CSS** recipes. Read the matching `NN-*.md` file, keep its numbers (duration, easing, distance, blur, scale), and rebuild it like this:
| transitions.dev recipe | where in Nomling | how in RN |
|---|---|---|
| Number pop-in (digit flip + blur + stagger) | sparks pill, stats, timer minute change | each digit is an `Animated.Text` sliding on Y with opacity; blur via Skia or skip on Android |
| Notification badge (diagonal slide + spring) | "+3 ✦" badge, new-bite counter | translateX/Y + `withSpring(spring.pop)` |
| Text states swap (blur) | speech bubble lines, button labels ("pause" ↔ "resume") | crossfade + 4 px Y offset; blur optional |
| Modal open/close (scale) | evolution screen, confirm dialogs | scale 0.92→1 + opacity, spring.gentle |
| Panel reveal | bottom sheets | gorhom bottom-sheet with custom spring config |
| Page side-by-side | onboarding steps | expo-router stack `animation: 'slide_from_right'` or a custom pager |
| Icon swap (scale + blur) | play/pause, sound on/off, tab icons | scale 0.6→1 + opacity |
| Success check (path draw + bob) | "already did it ✓", import success | SVG `strokeDashoffset` with `useAnimatedProps` |
| Error shake | empty dump submit, can't afford a hat | translateX sequence −6, 6, −6, 6, 0 (spring.wobble) |
| Menu dropdown (origin-aware) | sort/filter menu (later) | scale from the anchor corner |
| Card resize | bite card expand / chop result | `LinearTransition.springify()` |

## Signature interactions (build these with extra care)
1. **Pet idle**: breathe (scaleY 1→1.03, 2.6 s loop), body path morph (3.4 s), blink (every 4–5 s, random jitter), antenna spark pulse (1.8 s). Pupils follow the active touch point (max 6 px).
2. **Poke**: squish (scaleX 1.16 / scaleY 0.82 → overshoot → rest, spring.wobble) + `Haptics.impactAsync(Light)` + a random line in a bubble (scale-in spring.pop, auto-hide 3 s).
3. **Drag to feed**: Pan gesture on the food handle, with a ghost following the finger (scale 1.15, tilt by velocity). Over the pet → mouth opens, eyes scale 1.12, scene shows a dashed glow, `selectionAsync()` on enter. Drop → ghost shrinks into the mouth (220 ms) → start sheet. Not over → spring back to the card.
4. **Feed**: arc flight (bezier path, 850 ms, rotate 400°) → chomp ×3 (mouth scaleY 1→0.15, 280 ms each) + crumbs (8–10 particles) + `notificationAsync(Success)` → hop (−42 px, slight rotate) → Skia confetti burst (80 pieces from the mouth) → "+N ✦" floats up and fades → belly bar springs to its new width.
5. **Hatch**: each tap = egg shake (rotate ±12° decaying) + a new crack path drawn + haptic (Light → Medium → Heavy). 3rd tap: scale 1.6 + fade, white flash 700 ms, pet "born" (scale 0.2 → 1, spring.pop), confetti 140.
6. **Evolution**: rotating light rays behind (20 s loop), pet born animation, 5-note arpeggio, haptic pattern.
7. **Spin wheel**: decelerate over ~4.2 s (`Easing.bezier(0.12,0.82,0.16,1)`). Tick sound + `selectionAsync()` each time a slice passes the pointer (compute from the angle in a worklet, call haptics with `runOnJS`).
8. **Timer ring**: smooth stroke shrink (animated every frame, not every second), food in the center scales 1 → 0.55 and rotates −20° as time runs out.
9. **Tab bar**: active icon pops (scale 0.7 → 1, spring.pop), FAB tilts −6° at rest and 0° when pressed.
10. **Lists**: bites enter with stagger (FadeInDown.springify().delay(i*50)), exit with FadeOutLeft, reorder with LinearTransition.

## Haptics map (respect the haptics toggle)
tap/select → `selectionAsync` · poke, chip toggle → Light · start session, hatch crack 2 → Medium · hatch 3rd crack, evolution → Heavy + Success · fed → Success · can't afford → Warning · wheel ticks → selection.

## Sound (expo-audio, respect the sound toggle and the silent switch)
Small UI pack (≤ 200 KB total, original or CC0 only, list licenses in `assets/sounds/LICENSES.md`): pop, boop, chomp, crack, spark arpeggio, tick, evolve fanfare, nope. Brown noise: **generate it** (loop a pre-rendered 10 s brown-noise .m4a made with a script in `scripts/`) and play it on a loop with a fade in/out. Set the iOS audio session so it mixes with the user's music only when they want (default: mix).

## Reduce Motion
If the system Reduce Motion is on (`useReducedMotion()`) or the in-app toggle is on: no confetti, no flight arcs, no shakes, no rays. Use 150 ms fades and instant state changes. Keep haptics.

## Performance
60 fps on a mid-range Android (test a 3–4 year old device or an emulator with a low-end profile). All animation runs on the UI thread (worklets). No `setState` per frame. Memoize list rows. The pet SVG must not re-render the whole tree on each frame: animate props only.
