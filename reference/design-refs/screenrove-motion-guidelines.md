# Motion guidelines

Default rules for UI motion, drawn from published guidance by design engineers and from the motion tokens of Material 3, Open Props and Apple, each with a starting number and a link to its source. An entry's own spec always wins over these defaults.

- **Animate only when it explains something.** Good reasons are cause and effect, where something came from, feedback on an action, or rare and deliberate delight. If the motion does none of these, leave it out. ([source](https://github.com/vercel-labs/web-interface-guidelines#animations))
- **Don't animate what people use all day, and never animate keyboard-initiated actions.** A command menu opened hundreds of times a day should appear instantly (Raycast has no open animation). Keyboard-driven highlights and shortcuts that animate feel delayed and disconnected from the key press. ([source](https://emilkowal.ski/ui/you-dont-need-animations))
- **Keep UI animation under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. Typical values are 100-160ms for press feedback, about 125ms for tooltips, 150-200ms for menus and popovers, and 200-300ms for modals and sheets. ([source](https://emilkowal.ski/ui/7-practical-animation-tips))
- **Size the duration to the change: about 100ms for small feedback, 200-400ms for bigger moves.** A checkbox or toggle should take about 100ms in total. Most UI animation fits in 100-400ms, and at 500ms animation starts to feel like a drag. ([source](https://www.nngroup.com/articles/animation-duration/))
- **Exit faster than you enter.** Something appearing needs slightly more time than something leaving. A popup might take 300ms to appear and only 200-250ms to disappear. ([source](https://www.nngroup.com/articles/animation-duration/))
- **Enter and exit with ease-out, never ease-in.** Ease-out starts fast, so the UI feels like it reacts immediately. A 300ms ease-in dropdown feels slower than a 300ms ease-out one because ease-in speeds up at the end, which is the opposite of what UI needs. ([source](https://emilkowal.ski/ui/7-practical-animation-tips))
- **Use a stronger ease-out than the CSS keyword.** The built-in curves are too weak. Start from a quintic ease-out such as cubic-bezier(0.23, 1, 0.32, 1), and from cubic-bezier(0.77, 0, 0.175, 1) when you need ease-in-out. ([source](https://web.dev/articles/choosing-the-right-easing))
- **Use ease-in-out only for short moves between two on-screen positions.** Its slow start feels sluggish, so keep it short (300-500ms at most) and use it for an element moving or morphing in view, not for something entering or leaving. ([source](https://web.dev/articles/the-basics-of-easing))
- **Never animate from scale(0).** Start at 0.9 or higher (0.93 works well) together with opacity 0. An element that grows from nothing looks like it came from nowhere. Even a deflated balloon keeps its shape. ([source](https://emilkowal.ski/ui/7-practical-animation-tips))
- **Scale buttons to 0.97 while pressed.** Use transform: scale(0.97) on :active with a quick ease-out. The interface then feels like it is listening to the press. ([source](https://emilkowal.ski/ui/7-practical-animation-tips))
- **Scale popovers and menus from their trigger.** transform-origin defaults to center, which is wrong for anything anchored to a trigger. Use var(--radix-dropdown-menu-content-transform-origin) in Radix or var(--transform-origin) in Base UI. ([source](https://emilkowal.ski/ui/7-practical-animation-tips))
- **Delay the first tooltip, then show the next ones instantly.** The first tooltip waits to avoid accidental opens. Once one is open, neighbouring tooltips appear with no delay and no animation. Base UI sets data-instant for this, so set transition-duration: 0ms on it. The open animation itself is 125ms ease-out from scale 0.97. ([source](https://emilkowal.ski/ui/7-practical-animation-tips))
- **Animate transform and opacity, never layout, and never transition: all.** Transform and opacity only trigger compositing. Width, height, top, left, margin and padding also trigger layout and paint, which drops frames. List the properties you mean to animate, because transition: all animates layout properties by accident. ([source](https://emilkowal.ski/ui/great-animations))
- **Make every animation interruptible.** A new input mid-animation should retarget from the current value, not wait or jump. CSS transitions retarget and keyframe animations restart, so prefer transitions (or springs) for interactive state. ([source](https://emilkowal.ski/ui/great-animations))
- **Let gestures track the finger 1:1, then decide on release.** Apply the drag delta immediately and only animate once a distance or velocity threshold is crossed. Keep the release velocity so thrown items carry momentum. Trigger destructive results such as dismissing only when the gesture ends, never midway through it. ([source](https://rauno.me/craft/interaction-design))
- **Leave the way you came.** A view revealed by sliding down should not be dismissed sideways. Sonner toasts enter and exit in the same direction, which is what makes swipe-down-to-dismiss feel obvious. ([source](https://developer.apple.com/design/human-interface-guidelines/motion))
- **Stagger lists 30-50ms per item and cap the total.** motion-primitives defaults to 30ms per character, 50ms per word and 100ms per line. Keep the whole sequence under about 400ms and stagger only what is visible. ([source](https://github.com/ibelick/motion-primitives/blob/main/components/core/text-effect.tsx))
- **When a crossfade still feels off, add 2px of blur.** A little filter: blur() during the swap blends the old and new states, so the eye sees one thing changing rather than two separate objects. ([source](https://emilkowal.ski/ui/7-practical-animation-tips))
- **With reduced motion, keep the meaning and drop the movement.** Under prefers-reduced-motion: reduce, replace translation and scale with an opacity fade of the same or shorter length, or no animation. The state change itself must still happen, and motion should never be the only way information is shown. ([source](https://emilkowal.ski/ui/great-animations))
- **Prefer CSS, then the Web Animations API, then JS libraries.** requestAnimationFrame animation drops frames when the main thread is busy, for example while a new page loads. CSS and WAAPI animations of transform and opacity stay smooth. ([source](https://github.com/vercel-labs/web-interface-guidelines#animations))

## Durations

| Token | Value | Use |
|---|---|---|
| md.sys.motion.duration.short1 | `50ms` | Smallest state changes, such as a ripple start or selection tick. Value from Material 3. |
| md.sys.motion.duration.short2 | `100ms` | Checkbox, toggle and other micro-feedback. Value from Material 3; NN/g also gives about 100ms for these. |
| md.sys.motion.duration.short3 | `150ms` | Hover and press colour or scale changes. Value from Material 3. |
| md.sys.motion.duration.short4 | `200ms` | Small exits, tooltips and menus closing. Value from Material 3. |
| md.sys.motion.duration.medium1 | `250ms` | Menus, popovers and small panels opening. Value from Material 3. |
| md.sys.motion.duration.medium2 | `300ms` | Dialogs and cards expanding. The practical ceiling for everyday UI. Value from Material 3. |
| md.sys.motion.duration.medium3 | `350ms` | Larger surfaces entering. Value from Material 3. |
| md.sys.motion.duration.medium4 | `400ms` | Full-width moves. Value from Material 3; Sonner's toast enter also uses 400ms. |
| md.sys.motion.duration.long1 | `450ms` | Large container transforms. Value from Material 3. |
| md.sys.motion.duration.long2 | `500ms` | Full-screen sheets. Value from Material 3; Vaul's drawer also uses 500ms. |
| md.sys.motion.duration.long4 | `600ms` | Page-level transitions. Rare in product UI. Value from Material 3. |
| md.sys.motion.duration.extra-long1 | `700ms` | Ambient or onboarding motion only, never feedback. Value from Material 3, where extra-long2-4 are 800/900/1000ms. |
| tooltip | `125ms` | Tooltip open, ease-out from scale 0.97 (Emil Kowalski). |
| dropdown | `180ms` | Select or dropdown open. Noticeably snappier than 400ms (Emil Kowalski). |

## Easing curves

| Token | Value | Use |
|---|---|---|
| ease-out (strong) | `cubic-bezier(0.23, 1, 0.32, 1)` | Default for anything entering or leaving: menus, popovers, toasts, check marks. Quintic ease-out. |
| ease-in-out (strong) | `cubic-bezier(0.77, 0, 0.175, 1)` | Elements moving or morphing between two on-screen positions. Quartic ease-in-out. |
| iOS sheet (Vaul) | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers, sheets and large panels, over 500ms. Taken from Vaul's TRANSITIONS.EASE. |
| md.sys.motion.easing.standard | `cubic-bezier(0.2, 0, 0, 1)` | Material 3 default for utility transitions that begin and end on screen. |
| md.sys.motion.easing.standard.decelerate | `cubic-bezier(0, 0, 0, 1)` | Material 3 enter for small elements. |
| md.sys.motion.easing.standard.accelerate | `cubic-bezier(0.3, 0, 1, 1)` | Material 3 exit that leaves the screen for good. Keep it short. |
| md.sys.motion.easing.emphasized.decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Material 3 expressive enter for dialogs and large surfaces. |
| md.sys.motion.easing.emphasized.accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Material 3 expressive exit, paired with a shorter duration. |
| md.sys.motion.easing.legacy | `cubic-bezier(0.4, 0, 0.2, 1)` | The classic Material standard curve, still common in older systems. |
| --ease-3 (Open Props) | `cubic-bezier(.25, 0, .3, 1)` | Gentle general-purpose ease for colour and opacity. |
| --ease-out-3 (Open Props) | `cubic-bezier(0, 0, .3, 1)` | Medium ease-out for hover and small enters. |
| --ease-out-5 (Open Props) | `cubic-bezier(0, 0, 0, 1)` | Strongest ease-out: almost all the movement happens at the start. |
| --ease-in-out-3 (Open Props) | `cubic-bezier(.5, 0, .5, 1)` | Symmetric ease-in-out for on-screen moves. |
| --ease-elastic-out-3 (Open Props) | `cubic-bezier(.5, 1.25, .75, 1.25)` | Overshoots and settles. For playful, rare moments only. |
| --ease-spring-2 (Open Props) | `linear(0, 0.007, 0.029 2.2%, 0.118 4.7%, 0.625 14.4%, 0.826 19%, 0.902, 0.962, 1.008 26.1%, 1.041 28.7%, 1.064 32.1%, 1.07 36%, 1.061 40.5%, 1.015 53.4%, 0.999 61.6%, 0.995 71.2%, 1)` | A CSS-only spring with about 7% overshoot, for a lively scale-in. |
| Sonner toast | `ease` | Sonner uses the plain ease keyword over 400ms on purpose: slower and softer than usual, to suit the toast. |

## Springs

| Token | Value | Use |
|---|---|---|
| M3 spatial fast | `spring(stiffness: 1400, damping ratio: 0.9) ≈ linear(0, 0.135, 0.352, 0.568, 0.733, 0.839, 0.911, 0.955, 0.977, 0.99, 0.997, 1, 1, 1.001, 1) over 220ms` | Small moves such as switches, chips and handles. Value from Material 3. |
| M3 spatial default | `spring(stiffness: 700, damping ratio: 0.9) ≈ linear(0, 0.075, 0.235, 0.401, 0.553, 0.685, 0.781, 0.853, 0.907, 0.941, 0.965, 0.98, 0.99, 0.995, 0.998, 1, 1.001, 1.001, 1) over 295ms` | Menus, cards and panels moving or resizing. Value from Material 3. |
| M3 spatial slow | `spring(stiffness: 300, damping ratio: 0.9) ≈ linear(0, 0.059, 0.177, 0.316, 0.454, 0.577, 0.685, 0.77, 0.835, 0.885, 0.922, 0.948, 0.966, 0.98, 0.988, 0.994, 0.997, 0.999, 1, 1.001, 1.001, 1.001, 1.001, 1) over 480ms` | Full-screen or large container moves. Value from Material 3. |
| M3 effects default | `spring(stiffness: 1600, damping ratio: 1) ≈ linear(0, 0.146, 0.364, 0.57, 0.722, 0.82, 0.889, 0.93, 0.958, 0.975, 0.985, 0.991, 0.995, 0.997, 0.998, 0.999, 0.999, 1, 1, 1) over 300ms` | Opacity and colour, which should never overshoot. Material 3 effects fast is 3800, slow is 800. |
| SwiftUI .smooth | `spring(duration: 0.5s, bounce: 0) = stiffness 157.9, damping 25.1 ≈ linear(0, 0.07, 0.21, 0.367, 0.507, 0.625, 0.72, 0.795, 0.851, 0.893, 0.923, 0.945, 0.961, 0.973, 0.981, 0.986, 0.991, 0.993, 0.995, 0.997, 0.998, 0.998, 0.999, 1) over 770ms` | Calm, no-bounce settle for views and sheets. Visually done at about 500ms. |
| SwiftUI .snappy | `spring(duration: 0.5s, bounce: 0.15) = stiffness 157.9, damping 21.4 ≈ linear(0, 0.067, 0.214, 0.377, 0.532, 0.667, 0.772, 0.851, 0.907, 0.948, 0.973, 0.989, 0.999, 1.003, 1.005, 1.006, 1.005, 1.004, 1.003, 1.002, 1.002, 1.001, 1.001, 1) over 740ms` | Responsive UI with a hint of life: toggles, tabs, popovers. |
| SwiftUI .bouncy | `spring(duration: 0.5s, bounce: 0.3) = stiffness 157.9, damping 17.6 ≈ linear(0, 0.094, 0.28, 0.494, 0.685, 0.83, 0.935, 0.998, 1.031, 1.044, 1.043, 1.036, 1.026, 1.017, 1.01, 1.005, 1.001, 0.999, 0.998, 0.998, 0.998, 0.999, 0.999, 1) over 860ms` | Playful confirmation, such as a like or a badge. Use sparingly. |
| Digit roll (motion-primitives) | `spring(stiffness: 280, damping: 18, mass: 0.3) ≈ linear(0, 0.094, 0.268, 0.444, 0.595, 0.713, 0.801, 0.864, 0.909, 0.939, 0.96, 0.974, 0.983, 0.989, 0.993, 0.995, 0.997, 0.998, 0.999, 0.999, 1, 1, 1) over 350ms` | Light, near-critical spring for numbers and per-character text morphs. |

## Sources

- interior.dev (`interior`, MIT): 54 entries, installable from its registry
- Beautiful UI (`beautifului`, MIT): 25 entries, installable from its registry
- Cuelume (`cuelume`, MIT): 14 entries, npm `cuelume`
- Sonner (`sonner`, MIT): 1 entries
- Vaul (`vaul`, MIT): 1 entries
- Motion-Primitives (`motion-primitives`, MIT): 9 entries
- SmoothUI (`smoothui`, MIT): 1 entries
- Damn Good UI (`damngoodui`, Original work of each credited designer): 59 entries
- WAI-ARIA Authoring Practices Guide (`apg`, W3C Software and Document License): 1 entries

List a whole source with search_motion source=<id> fields=brief (counts by category and by the source's own sections). For a UI you are polishing, suggest_polish maps its elements to entries and sounds.

Browse examples: https://screenrove.com/motion · search with search_motion, then get_motion for the spec and code.