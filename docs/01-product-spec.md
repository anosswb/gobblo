# 01 — Product spec (v1)

## The core loop (protect it above everything)
1. **Dump** what's in your head → it becomes **bites** (food).
2. **Pick** a bite (tap it, drag it into the pet's mouth, or spin the wheel).
3. **Start** it: 2 min ("the trick"), 15 or 25 min. The pet works next to you (body double).
4. **Feed**: the pet eats the food. Confetti, sparks, the belly fills up, the pet evolves.
Every screen should shorten this loop. If a feature makes it longer, cut it.

## Why it beats the competition (from real reviews, see docs/07)
- Free core forever, no paywall after onboarding (the #1 complaint).
- 10-second capture, zero setup ("confusing", "extra work", "overwhelming").
- Notifications you control, never spam (40 reviews complained).
- No streak shame: the pet "naps", comebacks only go up.
- Rating prompt never in the first session (several 1★ reviews were about that).
- Local-first, nothing lost on updates, export/backup.

## Audience
- v1: 16–30 year olds who say they have ADHD or "ADHD brain", students and young workers. Play target audience: 13+ (see docs/05). No kid mode in v1.
- v1.2 idea (not now): Family mode, where a parent sets "quests" for a kid. That pulls in Kids Category / Families policy rules, so it's a separate project.

## Screens
### 0. Onboarding (max 60 s, no paywall, no account)
1. **Splash/hook**: "your brain isn't lazy. it's *hungry*." Egg wobbling, food orbiting. CTA "hatch my nomling".
2. **Quiz** (multi-select chips, skippable): what wrecks your day? starting things / time vanishes / 47 tabs in my brain / boring stuff = impossible / i forget everything / start 10 finish 0. Show one tailored line next.
3. **Pick egg + name**: 4 colors (pink, tangerine, mint, violet), name field with a 🎲 random-name button.
4. **Notification ask (soft)**: explain in one line, buttons "yes, gentle nudges" / "not now". Only then call the OS permission. Never on first launch before value.
5. **Hatch**: tap the egg 3× → cracks, shake, haptics escalate → flash → pet pops out, confetti. "meet {name}!! it's hungry for tasks." This is the **peak moment**. It must feel great on video.
6. Land on Home with a speech bubble: "drag a bite into my mouth 👇". Pre-fill 3 example bites (marked "example", swipe to delete).

### 1. Home
- Header: greeting by time of day + sparks pill (✦ count, bumps on change).
- **Scene card**: sky changes with time (morning peach, day blue-lilac, night with stars). Pet idles (breathes, blinks, eyes follow the finger). Tap = squish + random line. Chips: "lv 2 · lil gremlin", belly meter (starving → snacky → happy → stuffed, resets daily).
- **Bites list**: food emoji/icon by size (🍬 tiny ~2m +1✦, 🍪 small ~5m +2✦, 🍩 medium ~15m +3✦, 🍕 big ~25m +5✦), text, "example" tag. Long-press to reorder (drag handle), swipe left to delete (undo snackbar), swipe right = "already did it".
- **Drag-to-feed**: press and drag the food onto the pet → its mouth opens, eyes widen, drop zone glows → on drop, the start sheet opens. This is the signature interaction.
- Empty state: pet with an empty plate + "dump your brain" button.

### 2. Start sheet (bottom sheet)
Options: **2 min (THE TRICK)** highlighted, 15 min, 25 min. For big bites: "🔪 chop it smaller" splits into 3–4 tiny steps (local templates by keyword: study, clean, email/text, laundry, call; else generic). "remove" link.

### 3. Focus (body double)
- Full-screen, deep blue gradient (both themes), slow floating particles.
- Ring timer = a donut being eaten (stroke shrinks, food in the middle shrinks and rotates). Big mm:ss, "ends at 9:41 pm" (fights time blindness).
- Pet with headphones at a little desk, typing animation. Lines: "i'm working too. you're not alone in this."
- Controls: pause, +5 min, brown noise toggle (generated, looped), "done! feed {name}", "i drifted off (it's ok)" (supportive line, no penalty), leave (inline confirm, the bite stays).
- Starting gives +1 ✦ immediately ("that was the hard part").
- After 2-min mode ends: "2 minutes done. you started." → "ride the wave (+10)" / "i'm done, feed {name}".
- Keep the screen awake (expo-keep-awake). Schedule a local notification for the end time in case the app is in the background, and cancel it if the user returns or finishes.
- Live Activity / Dynamic Island timer = v1.1 (not v1).

### 4. Feed sequence (peak moment)
Food flies in an arc into the mouth → chomp ×3 with crumbs + chomp sounds + haptic pattern → hop → confetti → "+3 ✦" floats up → speech bubble → belly fills. If a level threshold is crossed, the **Evolution** full-screen follows (rays, flash, bigger pet, "LET'S GOOO").

### 5. Brain dump
Big text field ("messy is perfect"). "try an example" chip. "chop it into bites ✦" parses by new lines, commas, ";", "and then", "then", "also", and "and" before a verb; strips "i need to", "gotta", "ok so". Size guessed by keywords. Preview list: tap the food to cycle size, × to remove. "serve N bites" adds them with a staggered pop-in on Home. Optional mic button = v1.1.

### 6. Spin (choice paralysis)
Wheel with up to 8 slices from your bites, padded with "snacks" (5-min resets: chug water, one song full volume, 10 jumping jacks, step outside 2 min, grab a snack, tidy for one song). Spin with ticks + haptic ticks that slow down. Result card → "start it, just 2 min".

### 7. Closet
Pet preview + grid of cosmetics: hats (party, bow, shades, frog, crown…), later backgrounds and pet colors. Earned with sparks on both platforms. Android: rewarded-ad options ("watch ad → +5 ✦", "try this hat for 24 h"). iOS: a "Plus" card (one-time purchase). See docs/06.

### 8. Me
- Level + progress to the next evolution. Stats: bites eaten, minutes focused, comeback days (never resets), all-time sparks.
- **Brain card** (shareable): gradient card with the pet + a title from behavior ("2-minute legend", "midnight hyperfocus goblin", "chaotic early bird", "side-quest hero"). "Share" renders the card to an image (react-native-view-shot) → native share sheet. Watermark with the app name (free marketing).
- Settings: pet name, theme (System/Light/Dark), sounds, haptics, nudge level, reduce motion (follows the system + manual), export backup (JSON via share sheet), import, replay hatching, reset (2-step confirm), About (version, "not a medical device", privacy, terms, contact email).

## Evolution stages (by all-time sparks)
0 baby blob · 8 lil gremlin (ears) · 20 big chonk (belly patch, tooth) · 40 cosmic menace (aura, sparkles). v1.1: more stages and random "mutations" each week (novelty fights boredom, a top ADHD hook).

## Notifications ("nudge level", default = gentle)
- off · gentle: 1/day (a late-morning "one tiny bite?") · normal: 2/day · chaos: 4/day.
- Content rotates and is written by the pet. Never guilt. Never more than the level. No notification at night (22:00–08:00 local).
- Comeback: if no visit for 3+ days, ONE note: "i napped. zero guilt. one bite?" Then silence until they open the app.

## Data model (local, MMKV, versioned + migrations)
```ts
type Size = 0 | 1 | 2 | 3;               // tiny small medium big
interface Bite { id: string; text: string; size: Size; example?: boolean; createdAt: number; order: number }
interface Session { id: string; biteText: string; plannedMin: number; spentMin: number; mode: '2min'|'15'|'25'; startedAt: number; endedAt: number; done: boolean; drifts: number }
interface Pet { name: string; color: 'pink'|'tangerine'|'mint'|'violet'; hat: string; owned: string[] }
interface Stats { sparks: number; total: number; eaten: number; minutes: number; comebacks: number; lastVisit: string; todayEaten: number; starts2: number; byPart: { morning: number; day: number; night: number } }
interface Settings { theme: 'system'|'light'|'dark'; sound: boolean; haptics: boolean; nudge: 'off'|'gentle'|'normal'|'chaos'; onboarded: boolean; firstOpen: number; reviewAskedVersion?: string }
```

## Copy bank (use, extend, keep the tone)
Pet pokes: "feed me tasks pls" · "we're doing ONE thing. one." · "your brain isn't broken, it's spicy" · "i believe in u (mostly)" · "2 minutes. that's all i ask." · "starting > finishing. i said what i said."
After feeding: "NOM. {n} min of focus, delicious." · "brain: 1. task paralysis: 0." · "that was ELITE. my belly says thanks"
Comeback: "you're back!! i napped {n} days. zero guilt. let's eat."
