# 15 — Lead plan: unslop Gobblo, then launch

Written 2026-11-09 by the lead session. **Nothing is built yet. Anass must say OK first.**

How I checked: every screen in the web preview (375 pt wide, light and dark) with a made-up "day 10" user, the full onboarding, the core loop (add → start → focus → feed), all copy in `src/i18n/`, the code, panel v3, and Screenrove references (Duolingo lesson start, captured 2026-09-24: one hero thing, one button, the mascot next to the action; Habitify journal and progress, captured 2026-10-22). Patterns only, nothing copied.

Not checked: a real phone (nothing has run on one for these screens), real motion timing (the preview pane was in the background), sounds.

---

## The verdict in 5 lines

1. The idea is strong and the pet is good. Dark mode looks premium. Brain dump is the best screen.
2. The app does too much. 4 tabs, 6 tools, about 40 settings, 3 different "quote" features, a help button on every page, 2 celebrations in a row.
3. The one thing that makes Gobblo special, **feeding the pet**, gets the least space. Today the chomp plays off-screen.
4. Outside the pet, the screens look like iPhone Settings: grey rows, icon squares, chevrons. That is why it can feel "made by AI".
5. Fix order: show the core, cut the extra, then make it look like Gobblo. Then phones and stores.

---

## Question 1 — The 10 most "AI-looking" things, and the fix

| # | What I saw | Fix |
|---|---|---|
| 1 | **Home shows zero bites when you open it.** "Good evening" on 2 lines, 3 round buttons, 2 pills, a huge empty stage, a quote card. Your list starts below the screen. | Smaller pet stage, no quote card, one-line header. At least 3 bites visible on open. |
| 2 | **Three quote machines:** "Pet wisdom" card on Home, "Mindful note", and "Daily tip". Quote cards with a sparkle icon are the #1 AI look. | One voice only: the pet's speech bubble. It talks when you tap it or after you feed it. The cards go. |
| 3 | **The feeding moment is hidden.** After "Done! Feed Pip" you land on the list. The pet eats above the screen. Then a toast and a "Want nudges?" card appear. | The screen goes to the pet. Chomp, sound, haptic, +✦ on the pet. One second. Nothing else pops up for 3 seconds. |
| 4 | **Two celebrations in a row.** A full screen with sun rays ("Pip evolved · Big chonk · Let's go. · It's giving main character. · Nice.") then a second card ("Level 7! · Nice!"). The tab bar draws on top of the card. | One moment. The pet really changes shape, the new item lands on it, one button. No rays. |
| 5 | **Progress is a dashboard.** Ring card, level strip, 4 same stat tiles, bar chart, hours strip, share card, jar. Seven blocks. | Pet + level + Road to 20 on top. One sentence ("19 bites, 235 minutes"). The week chart. The share card. The rest goes. |
| 6 | **Toolkit = 6 same cards with rainbow icon squares.** Same rainbow squares in Settings and Reminders. | 4 tools in a short list. Each one shows the pet doing it (breathing, pointing) instead of a coloured square. |
| 7 | **"?" button on every page, and a 3-step lesson opens by itself on every tool.** A page that needs a lesson is not finished. | No auto lessons. One line of text on the page is enough. Guides live in Settings › Questions & answers. Home keeps the drag demo. |
| 8 | **Settings form inside onboarding** (step 3 of 6: theme, accent, sounds, volume, focus sound, 16 controls) before the egg even hatches. And the pet talks in the quiz before it is born. | Remove that step. Onboarding = hook → quiz (the egg wiggles) → feed → hatch → name → nudges. |
| 9 | **Bites look like Settings rows.** Grey icon square, chevron, three facts ("Small · ~5 min · +2 ✦"). The start sheet has 11 buttons. The focus screen has 9, and the time sits outside an empty ring. | Bites look like food on a plate: icon, name, one fact ("5 min"). Start sheet: one big "Start 2 min" + 5 / 15 / 25, the rest behind "More". Focus: time inside the ring, Pause · +5 · Done. |
| 10 | **Filler words and the sparkle everywhere.** "It's giving main character", "Trust.", "Elite.", "It's spicy", "Most people quit before this point" (a made-up fact), sparkle icons on buttons that have nothing to do with sparks. | A copy pass. The sparkle means sparks only. No made-up facts. Fewer jokes, better ones. |

Small real bugs found on the way: "Feed it" and the dice button stick out of their card at 375 pt; Breathe's mute label still says "bowl sound"; some text on Progress and Reminders is not in the copy file.

**Code slop** (you can't see it, but it slows every change):
- `@shopify/react-native-skia` is installed and **not used anywhere**. It is the library that broke the Android builds. Also unused: `expo-sensors`, `expo-image`, `expo-device`, `expo-store-review` (the rating prompt was never built).
- The same card style is copied by hand 24 times in 13 files.
- `src/screens/home/index.tsx` is 680 lines with 18 pieces of state.
- Dead code: `playBreath` / `stopBreath` in `src/lib/sound.ts`, emoji fields in the closet and food data.
- `docs/02` and `docs/11` still describe the old design (cobalt, lime, chunky buttons, Bricolage font). Every new session reads the wrong brief. That makes slop by itself.
- No payments SDK (RevenueCat) and no ads SDK (AdMob) is installed yet. The panel's "banner ads" were in the test story, not in the app.

---

## Question 2 — What to remove or simplify

Nothing below deletes a feature people love. Most of it is **merging**.

| Today | After | Why |
|---|---|---|
| Spin is a full tab with one button | "Pick for me" button on Home (and in the toolkit) | A tab for one button. The bar becomes Home · Closet · Me · + |
| 6 tools | 4 tools: **Unstick me · Calm · Pick for me · Reminders** | Breathe joins Calm (it becomes its first mode). "Sit with me" joins Focus as "No task, just sit with me". Daily tip becomes the pet's voice. |
| ~40 settings | ~20 | Gone: confetti amount, accent colour (the pet's colour is the accent), volume levels (the phone has volume), "mix with music", "Chaos 4/day", mindful nudge, 3 pet-talk levels (becomes on/off), week start and 24-hour (follow the phone), replay hatching. Saved choices stay safe in storage. |
| Closet opens on 18 Faces | Opens on Hats; Faces goes last | The pet already reacts by itself. Hats are what people collect. |
| "?" on 13 pages + auto lessons | Guides in Settings only | See #7 |
| 2 Plus packs + a bundle | One "Gobblo Plus", one price | Two testers could not tell which pack had the widget. |
| Banner ads on Android (planned) | Never build them. Rewarded ads only, or no ads at launch | 10 of 11 Android testers hated banners. |
| Widget "Start" opens the app unless you pay | One-tap start is free | Starting is the core loop. The rule says the paywall never blocks it. 10 of 20 asked. |

---

## Question 3 — What makes Gobblo premium and unique

1. **The pet is the interface.** It speaks (one voice). It shows hunger with its face, not with a bar. It is on every key screen doing a real thing: eating, working at a desk, sleeping.
2. **A signature moment.** The chomp. One second, always in view, great sound and haptic. This is the clip people post.
3. **Tasks are food.** A plate, not a list from Settings. No other to-do app can copy this without copying the pet.
4. **Less.** 3 tabs, 4 tools, 20 settings. Premium apps feel calm because they say no.
5. **One accent, used rarely.** Today pink is on buttons, chips, tabs, bars and the "+". It should be the pet, the main button, and nothing else.
6. **New things every week that feel real.** A hat or a room, not only a colour. Hats and rooms are drawn in code, so I can make them without new Flow art.

---

## The plan

Sizes: **S** = about 1 hour · **M** = half a day · **L** = 1 to 2 days. "Lead" = I do it (design work). "Helper" = a cheaper Sonnet helper does it from my exact list.
Rules for every item: one commit · tests, types and lint pass · checked in light and dark at 375 pt · no push without Anass.

### Part A — Show the core (biggest effect)

**1. Home shows your bites first — L, lead**
- What: one-line header (date + sparks + toolkit). Pet stage about 40% shorter. Hunger shown by the pet's face and one small label. Remove the "Pet wisdom" and "Mindful" cards. Remove the permanent hint line. Bite rows: icon, name, one fact. "Pick for me" button next to the list title.
- Why: #1 and #9. The list is the job; today you must scroll to see it.
- Files: `src/screens/home/index.tsx` (split into `header.tsx`, `stage.tsx`, `plate.tsx`), `bite-row.tsx`, `src/components/stage-backdrop.tsx`, `src/i18n/en.ts`.
- Done when: on a 375×812 screen, 3 bites are visible on open with no scroll, in light and dark, and at iPhone SE size 2 are visible. Home file under 300 lines.

**2. The feeding moment — M, lead**
- What: after a feed, Home scrolls to the pet first. Chomp → pet reacts → "+2 ✦" floats from the pet → then the list. No toast, no card for 3 seconds. The nudge question waits for the next open.
- Why: #3. It is the product's reward and its ad.
- Files: `src/screens/home/index.tsx`, `src/pet/burst.tsx`, `src/features/nudges/ask-again.ts`, `src/components/toast.tsx`.
- Done when: finishing a timer always shows the full chomp on screen; Reduce Motion gives a fade + the number; a test covers "ask again never shows in the same visit as a feed".

**3. One celebration — M, lead**
- What: merge the evolution screen and the level-up card into one. The pet changes shape, the new item appears on it, "Wear it" / "Later". No rays, one line of text.
- Why: #4.
- Files: `src/pet/evolution.tsx`, `src/pet/level-up.tsx` (one file after), `src/i18n/en.ts`.
- Done when: a level-up shows exactly one screen and one tap closes it; the tab bar never draws over it.

**4. One pet voice — S, lead writes, helper wires**
- What: the pet's lines (wisdom, tips, mindful) become one list, shown only in the speech bubble: on tap, after a feed, or once a day. "Pet talk" becomes on/off.
- Why: #2.
- Files: `src/i18n/en.ts`, `src/features/toolkit/tips.json`, `src/screens/home/`, `src/screens/tools/tip.tsx` (removed; saved tips move to the bubble's long-press), `src/state/schema.ts` (no data lost).
- Done when: no quote card exists anywhere; the medical-words test still passes on every line.

### Part B — Cut and merge

**5. Three tabs, four tools — L, lead designs, helper moves files**
- What: remove the Spin tab; "Pick for me" opens the same drum as a sheet. Toolkit = Unstick me, Calm (Breathe is mode 1), Pick for me, Reminders. "Sit with me" becomes a Focus start with no task.
- Why: Question 2. One tester said it plainly: "too many extras".
- Files: `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/spin.tsx`, `src/components/tab-bar/`, `src/screens/spin/`, `src/screens/tools/*`, `src/app/tools/[tool].tsx`, `src/features/focus/timer.ts`, guides + FAQ copy.
- Done when: the bar shows Home · Closet · Me · +; every old feature is still reachable in 2 taps; old deep links (`/spin`, `/tools/sit`) land somewhere sensible.

**6. Start sheet and Focus screen — M, lead**
- What: start sheet = bite name, big "Start 2 min", 5 / 15 / 25, then "More" (60 min, when, daily, do first, steps, already did, remove). Focus = time inside the ring, the pet bigger at a small desk, Pause · +5 · Done; Restart lives inside Pause; no "?".
- Why: #9. The most used sheet in the app has 11 buttons.
- Files: `src/components/start-sheet.tsx`, `src/screens/focus/index.tsx`.
- Done when: the sheet shows 4 start buttons + "More" and fits iPhone SE without scroll; Focus has 3 main buttons.

**7. Onboarding — S, helper**
- What: remove the "Make it yours" step. In the quiz the egg wiggles and "answers" (no pet before the hatch). Fix the two buttons that stick out of their card.
- Why: #8.
- Files: `src/screens/onboarding/index.tsx`, `src/i18n/en.ts`.
- Done when: 5 dots; no pet is drawn before the hatch; nothing overflows at 360 and 375 pt.

**8. Guides out of the way — S, helper**
- What: no guide opens by itself. Remove the "?" button from pages (keep Home's drag demo). All guides listed in Settings › Questions & answers.
- Why: #7.
- Files: `src/components/guide/page-guide.tsx`, every screen that renders `GuideHelp`, `src/screens/settings/`.
- Done when: opening any tool for the first time shows the tool, not a sheet.

**9. Settings 40 → about 20 — M, helper from my list**
- What: remove the rows listed in Question 2. Stored values stay; defaults apply. Time pickers use the native picker instead of − / +.
- Why: fewer choices is the ADHD-friendly choice.
- Files: `src/screens/settings/pages.tsx`, `src/components/settings-parts.tsx`, `src/screens/reminders/index.tsx`, `src/state/schema.ts`, `src/state/migrations.ts` (+ test).
- Done when: each settings page fits one screen without scroll (except Questions & answers); the migration test proves old saves still load.

**10. Progress tells a story — M, lead**
- What: top = pet, level, Road to 20. One sentence with the numbers. Week chart. Share card. Remove the 4 tiles and "Your best hours". The tab is named "Me" and the page says "Progress": pick one ("You").
- Why: #5.
- Files: `src/screens/me/index.tsx`, `level-ring.tsx`, `road.tsx`, `week-chart.tsx`, `src/i18n/en.ts`.
- Done when: 4 blocks, not 7; no two blocks share the same card layout.

### Part C — Make it look like Gobblo

**11. Look pass — L, lead (I show a before/after picture before the commit)**
- What: bites drawn as food on a plate. Pink only on the pet, the main button and the active tab. No rainbow icon squares outside Settings. Light mode gets a slightly warm paper tone instead of flat grey (your "premium neutral" call stays; this is a small tint, and you can say no). Sparkle icon only for sparks.
- Why: Question 3. Dark mode is already good; light mode is the weak one.
- Files: `src/theme/tokens.ts`, `src/screens/home/bite-row.tsx`, `src/screens/tools/index.tsx`, `src/components/icon.tsx`, `src/components/backdrop.tsx`.
- Done when: Anass picks the before or the after; contrast stays AA; Screenrove `check_my_ui` run on Home.

**12. Copy pass — S, lead writes, helper applies**
- What: fix #10. Move stray text from `me/index.tsx` and `reminders/index.tsx` into `en.ts`. Fix the "bowl sound" label.
- Files: `src/i18n/en.ts`, `guides.en.ts`, `faq.en.ts`, the two screens.
- Done when: the "no guilt / no medical words" tests pass; no English text is left inside screen files.

### Part D — Reasons to come back

**13. Bigger weekly surprise — M, lead draws, helper wires**
- What: weeks rotate hat → colour → room. 6 new hats and 4 new rooms, drawn in code. The Closet shows "next week" as a wrapped gift.
- Why: 13 of 20 testers: "one colour a week is too small". This is the #1 reason people left.
- Files: `src/pet/wardrobe.tsx`, `src/features/closet/items.ts`, `src/features/weekly/logic.ts` (+ test), `src/screens/home/weekly-card.tsx`.
- Done when: 10 weeks of drops exist with no repeat type two weeks in a row; a user away 4 weeks finds 4 gifts waiting.

**14. Widget one-tap start is free; Plus is one thing — M, lead + needs a real phone**
- What: the free widget starts 2 minutes in one tap. Plus becomes one purchase (full closet, rooms, lock-screen timer, routine packs).
- Why: Question 2.
- Files: `src/widgets/*`, `modules/focus-live`, `src/features/plus/catalog.ts`, `src/screens/plus/index.tsx`, `docs/09`, `docs/13`.
- Done when: tested on a real Android phone and a real iPhone.

### Part E — Clean the code (invisible, but it keeps the next changes cheap)

**15. Code cleanup — M, helper**
- What: remove unused libraries (Skia, sensors, image, device; keep store-review for item 17). One `Card` component instead of 24 copies. Delete dead code. Remove the 2 old worktrees. Rewrite `docs/02` and `docs/11` to match the real design. Replace "Nomling" in the docs.
- Why: see "Code slop".
- Note: on 2026-11-06 Anass said "keep Skia". It is still unused, so I ask again. Removing it makes Android builds lighter.
- Done when: `npx expo-doctor`, `tsc`, lint and the 136 tests pass; the app still starts on web.

### Part F — Launch gates (not slop, but they block the store)

**16. Real phones — L, Anass + lead.** Dev build on one iPhone and two Android phones. Check: date picker, widgets, notifications (battery saver on), sounds on vibrate, drag-to-feed, haptics, Liquid Glass. Fix what breaks.
**17. Rating prompt + core-loop test — M, helper.** `expo-store-review` after the 3rd feed and 2 days (the rule in CLAUDE.md, not built yet). One Maestro test: onboarding → dump → start → feed.
**18. Money — L, Anass + lead.** See Question 5.
**19. Store pages — M, Anass + lead.** Screenshots, text, privacy answers, age rating, privacy policy link.

---

## Question 4 — Top 5 before launch, in order

1. **Home + the feeding moment** (items 1–4). The first 30 seconds decide everything.
2. **Cut and merge** (items 5–10). Less app, better app.
3. **Real phones** (item 16). Nothing in the list above is proven until it runs on a phone. Start this in parallel, today if possible.
4. **A reason to come back** (items 13–14). Retention did not move in three panels.
5. **Store and money** (items 17–19).

The look pass (11–12) rides along with 1 and 2.

---

## Question 5 — When can we launch, and what blocks it

**Honest answer: mid-December 2026 on iPhone if we launch free first. Early January if payments must be live on day one.**

What blocks it today:
1. **No real phone test.** The date picker, the iPhone widget, notifications on Android and the sounds have never run on a device.
2. **Payments are not started.** RevenueCat is not installed. It also needs Apple's paid-apps agreement, bank and tax forms (Anass, by hand).
3. **Ads are not started.** AdMob is not installed. My advice: no ads at launch.
4. **Google Play closed test.** New personal accounts usually must run a closed test with 12 testers for 14 days before going public (check your Play Console). Start it now with today's build so the clock runs while we work.
5. **Store forms and accounts.** Apple Developer account, listing, screenshots, privacy answers, a hosted privacy policy.
6. **Name check.** The manual trademark check for "Gobblo" and the domain are still open.
7. **Rating prompt and the end-to-end test** are not built.

**My advice: launch free first.** Plus hidden on iPhone (it already is), no ads on Android. Real people for two weeks tell us more than a fourth simulated panel. Then add Plus in version 1.1. This takes payments off the critical path.

Rough calendar (my usage limit is tight, so this is realistic, not fast):
- Week of Nov 9: items 1–4. Anass starts the Google closed test and the Apple account.
- Week of Nov 16: items 5–10 and 12.
- Week of Nov 23: items 11, 13, 14, 15. Phone testing.
- Week of Nov 30: items 16–17, store pages, fixes.
- About Dec 8: send to Apple and Google. Reviews often take 1–3 days and one rejection is normal.

---

## What I will not do

- No fourth simulated panel before real users. The three panels agree; more of them is not more truth.
- No French or Spanish in v1.0 (7 asked). It is the best v1.1 feature: the copy is already in one file.
- No calendar import, no sync, no AI. Same reasons as before (DECISIONS.md).
- No new Flow art needed for this plan.

## Decisions I need from Anass

1. OK to merge Spin into a button and go from 6 tools to 4?
2. OK to remove the unused Skia library?
3. Launch free first, payments in 1.1?
4. Widget one-tap start free, and one single Plus?

If you just say "OK", I take **yes** on all four.
