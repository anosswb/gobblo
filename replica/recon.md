# Recon map: Finch + Tiimo (iOS + Android)

Mode: **clean-room, public sources only.** No login, no account, no app binaries, no network logging, no screenshots saved. This is a map of features and UX patterns, not a clone. We never copy their names, art, copy or code into Nomling.
Scope: onboarding, daily loop, rewards, pet/customisation, focus timer, settings, paywall.
For: Nomling v1 (Expo, local-only, ADHD "starting" pet app).
Capture date: **2026-11-06** (unless a row says otherwise).

Confidence key: **high** = official listing/page · **med** = several third-party reviews agree · **guess** = inferred from one source or a screenshot file name.

## Sources

| # | app | source | URL | captured | notes |
|---|---|---|---|---|---|
| 1 | Finch | App Store listing (US) | https://apps.apple.com/us/app/finch-self-care-pet/id1528595748 | 2026-11-06 | features, IAP list, 4.9★ / 772K, 9+, v3.73.235 |
| 2 | Finch | Marketing site | https://finchcare.com/ | 2026-11-06 | pitch only, no feature list, links FAQ, Guardians, Plus gift |
| 3 | Finch | IAP tracker | https://apppricinglab.com/iap/apple/1528595748 | 2026-03-21 | 8 Plus prices + Guardian $7.99 |
| 4 | Finch | Help center (index, Plus, New User Guide) | https://help.finchcare.com/hc/en-us | 2026-11-06 | **HTTP 403 to automated reads**. Only article titles seen via search: "Energy vs Rainbow Stones", "Benefits of Finch Plus", "Wellhub FAQ", "Micropet Lab" |
| 5 | Finch | Screen teardown (video timestamps) | https://screensdesign.com/showcase/finch-self-care-pet | 2026-11-06 | onboarding order, soft paywall after quiz, 7-day trial, 43% discount |
| 6 | Finch | Public onboarding flow (5 of 34 screens) | https://design.lazyweb.com/canvas/flows/finch/onboarding | 2026-11-06 | welcome, egg, hatch, name + shuffle |
| 7 | Finch | Hands-on review | https://www.androidauthority.com/finch-habit-tracker-app-hands-on-3537434/ | 2026-11-06 | energy → ~6 h adventure, 3 shops, micropets, mood check-ins x3/day |
| 8 | Finch | Reviews (Bustle, WhistleOut, Headway) | https://www.bustle.com/wellness/finch-app-review-features-price · https://www.whistleout.com/CellPhones/Guides/finch-self-care-app-review · https://makeheadway.com/blog/finch-app-review/ | 2026-11-06 | free vs Plus, $9.99/mo, $69.99/yr, friend codes |
| 9 | Tiimo | App Store listing (US) | https://apps.apple.com/us/app/tiimo-visual-daily-planner/id1480220328 | 2026-11-06 | features, 10 IAPs, 4.6★ / ~21K, 9+, v3.70.1 (Oct 21) |
| 10 | Tiimo | Marketing site + product pages | https://www.tiimoapp.com/ · /product/streaks · /product/focus · /product/to-do-list · /product/ai-planning · /product/mood-tracking · /product/widgets-live-activities | 2026-11-06 | positioning, feature set, Pro promo |
| 11 | Tiimo | FAQ (pricing, trial, cancel, sync) | https://www.tiimoapp.com/faq | 2026-11-06 | no prices; 7-day trial yearly only; web = Pro only |
| 12 | Tiimo | IAP tracker | https://apppricinglab.com/iap/apple/1480220328 | 2026-05-17 | 10 Pro prices $7–$54 |
| 13 | Tiimo | Public flows (onboarding 14 screens, onboarding paywall, welcome-back paywall) | https://experiments.lazyweb.com/company/tiimo | 2026-11-06 (flow updated 2026-08) | only 5 screens public; screen 5 file name says "paywall" (guess) |
| 14 | both | Our own review study (599 US App Store reviews) | `docs/07-entrepreneur-findings.md`, `research/feedback.md` | 2026-11-04 | pain points ranked |

Gaps: Finch help center is blocked for automated reading; Google Play pages did not load (Finch truncated, Tiimo package unclear). Before a big bet, Anass can open these in his own browser and confirm: (a) Finch Plus benefit list, (b) Tiimo current US prices on the paywall.

---

## A. Finch: Self-Care Pet

**Core loop (their words, short):** "take care of your pet by taking care of yourself" (finchcare.com). You complete self-care goals → energy fills → bird goes on an adventure (returns hours later) → growth, stories, currency → spend on cosmetics.

### Screens (FS = Finch screen)

| ID | screen | how to reach | purpose | key components | states seen | conf. |
|---|---|---|---|---|---|---|
| FS01 | Welcome | first launch | start or log in | hero pet, "hatch" CTA, "log in" link | default | high (6) |
| FS02 | Choose egg | onboarding | pick egg colour | colour swatches, "hatch me" CTA | default | high (6) |
| FS03 | Hatch | onboarding | peak moment | tap-to-hatch egg, skip | animating | high (6) |
| FS04 | Name pet | onboarding | personalise | text field, shuffle button, next | empty, filled | high (6) |
| FS05 | Pronouns / personality trait | onboarding | personalise | chip choice, pet reaction | selected | med (5, 8) |
| FS06 | Value statement / chat intro | onboarding | explain loop, define self-care | chat bubbles | default | med (5, 6) |
| FS07 | Personalisation quiz | onboarding | collect goals/struggles | large tappable cards, multi-step | in-progress | med (5) |
| FS08 | Starter plan | onboarding | generated starter goals | checklist (water, stretch, breathe) | populated | med (search summary of 6) |
| FS09 | Onboarding paywall | end of onboarding | trial upsell | plan cards, % discount badge, trial timeline, close | default | med (5) |
| FS10 | Home | tab | daily goals + pet status | pet scene, energy bar, goal list, sort, adventure progress, confetti | empty?, populated, all-done | high (5, 7) |
| FS11 | Goal editor | + on home | create/edit goal | name, repeat days, reminder time, times per day, "Area" | default | high (7) |
| FS12 | Mood check-in | prompts morning/afternoon/evening | log mood | mood scale, tags | default, low-mood → FS13 | high (1, 7) |
| FS13 | First Aid | low mood or menu | calm tools | list: breathing, affirmations, journaling | default | high (7) |
| FS14 | Reflection / journal | tab or after check-in | guided prompts | prompt card, text field, tags | empty, filled | high (1, 7) |
| FS15 | Breathing | First Aid / tools | guided breathing | animated shape, timer | running | high (1) |
| FS16 | Quizzes (anxiety, depression…) | tools | self-assessment | question cards, score | done | high (1) |
| FS17 | Adventure / discovery | when energy full | delayed reward story | pet in forest, discovery card | away (~6 h), returned | high (5, 7) |
| FS18 | Daily quests | home | secondary goals | quest cards | in-progress | med (5) |
| FS19 | Shops (clothes / furniture / colours) | home/store | spend currency | shopkeeper NPCs, item grid, price | owned, locked | high (7) |
| FS20 | Closet / customise | menu | dress pet | pet preview, item grid | default | med (8) |
| FS21 | Pet's house | home | decorate room | furniture, wallpaper | default | high (7) |
| FS22 | Micropets | after adventures / hatching | collect companions | companion list, lab | locked, owned | med (7, search) |
| FS23 | Friends ("Tree Town") | menu | share progress, send gifts | friend code, list of friend pets, send encouragement | empty, populated | med (8, search) |
| FS24 | Insights | menu | mood/goal analytics | charts, trends | populated | high (1) |
| FS25 | Soundscapes / timer | tools | focus/sleep sound | sound list, timer | locked (Plus), playing | med (5, 8) |
| FS26 | Settings | menu | prefs, account | reminders, account, Plus | default | guess |
| FS27 | Plus screen (in-app) | settings / locked item | subscribe | plans, trial | default | med (5, 8) |
| FS28 | Home-screen widget | OS | pet visible as passive nudge | pet + status | default | med (8) |

### Flows

```
FF01 First run to first value (onboarding)
  FS01 -> FS02 -> FS03 -> FS04 -> FS05 -> FS06 -> FS07 (quiz, many cards) -> FS08 -> FS09 (paywall) -> FS10
  steps: 18 to 36 reported (5); value (first goal done) comes AFTER the quiz and the paywall.
  asks before value: egg colour, name, pronouns/trait, self-care definition, struggles quiz, starter goals; account offered (log in).
  edge: skip hatch, close paywall, notification permission (timing unknown).

FF02 Daily loop
  FS12 morning check-in -> FS10 tick goals (energy up, confetti, currency) -> energy full -> FS17 pet leaves (~6 h) -> return with discovery -> FS12 evening reflection
  happy path to "reward": 1 tap per goal, but the big reward is delayed hours.
  edge: low mood -> FS13 First Aid.

FF03 Rewards + customisation
  goals -> currency -> FS19 shop -> buy -> FS20 / FS21 dress pet / decorate room
  adventures -> FS22 micropets (seasonal, random eggs)

FF04 Social
  FS23 share friend code -> add friend -> send encouragement / gifts. No DMs.

FF05 Paywall
  FS09 (onboarding, after quiz, trial + discount + timeline) and FS27 (locked items: extra exercises, soundscapes, longer timers, shop items, journal prompts).
```

### Components (Finch)
Pet scene with idle + tap reaction · energy bar · goal row with check + confetti · chip / card multi-select · egg picker swatches · name field + shuffle · chat-style bubbles · mood scale · shop item grid with price · closet preview · discovery/story card · friend code card · trial timeline · discount badge · home-screen widget.

### Paid features and pricing (Finch Plus, subscription)
| item | price | source | captured |
|---|---|---|---|
| Finch Plus, US App Store, 8 price points | $5.99, $9.99, $34.99, $39.99, $41.99, $49.99, $59.99, $69.99 | (1), (3) | 2026-11-06 / 2026-03-21 |
| Common reading of those prices | $9.99/month, $69.99/year, discounted yearly tiers lower | (8) Headway, Gerald via search | 2026-11-06 |
| Trial | 7 days on yearly, offered in onboarding with ~43% discount badge | (5), (8) | 2026-11-06 |
| Guardian Program (pay it forward so others get Plus) | $7.99 | (1), (3) | 2026-11-06 |
| Plus via employer wellness (Wellhub) | free to user | help-center title via search | 2026-11-06 |

What Plus adds (med confidence, third-party): 100+ extra exercises, extra journal prompts, extra shop items/outfits, **extra soundscapes and longer focus timers**, app icons. Free keeps the pet, goals, check-ins, breathing, journaling, adventures, friends.

---

## B. Tiimo: visual planner

**Core loop:** capture to-dos (text, voice, AI) → drag them onto a colour-coded visual timeline → run each with a visual countdown timer → check off → streaks/trophies.

### Screens (TS = Tiimo screen)

| ID | screen | how to reach | purpose | key components | states seen | conf. |
|---|---|---|---|---|---|---|
| TS01–TS13 | Onboarding (14 screens incl. paywall) | first launch | setup + account | unknown (9 of 14 gated on source) | — | guess (13) |
| TS14 | Sign up / log in | onboarding | account (email+password, Google, Apple) | auth buttons | default | high (11, 9 notes) |
| TS15 | Onboarding paywall (2 screens) | end of onboarding | trial upsell | plan cards, trial | default | med (13) |
| TS16 | Welcome-back paywall | returning user | win-back upsell | plan cards | default | med (13) |
| TS17 | Today timeline | tab | visual day plan | colour-coded blocks, icons, now-line, drag & drop | empty, populated | high (9, 10) |
| TS18 | To-do inbox ("mental inbox") | tab | capture | list, priority H/M/L, drag reorder, separate lists, template lists | empty, populated | high (10) |
| TS19 | AI co-planner | to-do / chat | breakdown + schedule | text/voice input, step list, time estimates, reshuffle day | thinking, result, limited (free) | high (10) |
| TS20 | Task editor | tap task | edit | title, icon, colour, duration, checklist steps, reminder | default | med (10) |
| TS21 | Focus timer | start task | visual countdown | progress ring, mm:ss, checklist | running, paused, done | high (10) |
| TS22 | Mood check-in | anytime (iOS only) | log mood | slider very unpleasant → very pleasant, face art | default | high (10) |
| TS23 | Insights / stats | tab | patterns | mood next to schedule, Apple Health | populated | high (9, 10) |
| TS24 | Streaks + trophies (iOS only) | stats | motivation | streak count, trophies, "soft prompts" | active | high (10) |
| TS25 | Calendar import | settings | sync | Google, iCloud, Outlook, Apple Reminders | connected, error | high (9, 11) |
| TS26 | Profiles (family, up to 5) | settings | multi-user | profile switcher | default | high (9) |
| TS27 | Courses / community hub | tab | learning content | course cards | default | high (9) |
| TS28 | Settings / account & subscription | settings | prefs, restore, manage plan | toggles, restore | default | high (11) |
| TS29 | Widgets, Live Activity, Dynamic Island | OS | tasks + timer outside app | next task, countdown | running | high (10) |
| TS30 | Apple Watch app | watch | check off, focus | list, timer | default | high (9, 10) |
| TS31 | Web planner (Pro only) | browser | desktop planning | timeline + to-do side by side | default | high (11) |

### Flows

```
TF01 First run to first value
  TS01..TS13 (14 screens) -> TS14 account -> TS15 paywall (trial) -> TS17
  asks before value: account (needed to sync across devices), setup answers (gated, unknown), paywall decision.

TF02 Daily loop
  TS18 capture (or TS19 AI) -> drag to TS17 timeline (set time + duration) -> TS21 focus timer -> check off -> TS24 streak
  happy path: capture 1 + schedule 1-2 + start 1 + done 1 = ~4-5 taps; planning is mandatory before the timer.

TF03 Rewards
  sessions + check-offs -> streaks + trophies (iOS only). No pet, no character.

TF04 Paywall
  TS15 onboarding, TS16 welcome-back, locks on AI (limits), web, calendar sync, extra profiles, custom widgets.
  trial only on yearly; monthly charged at once; "deleting the app does not cancel" (FAQ).
```

### Components (Tiimo)
Timeline block (icon + colour + duration) · now-line · drag handle · priority chip · list switcher · AI chat input with mic · step checklist · progress-ring timer · mood slider · streak badge / trophy · calendar connect rows · profile switcher · plan cards · widgets / Live Activity.

### Paid features and pricing (Tiimo Pro, subscription)
| item | price | source | captured |
|---|---|---|---|
| Tiimo Pro, US App Store, 10 price points | $7, $11.99, $12 (x2), $14, $36, $42, $48, $54 (x2) | (9), (12) | 2026-11-06 / 2026-05-17 |
| Third-party reading | ~$5.99–$12/month, ~$36–$54/year (sources disagree) | (12), aggregator search | 2026-11-06 |
| Trial | 7 days, **yearly only**; monthly charged immediately | (9), (11) | 2026-11-06 |
| Pro unlocks | unlimited AI planning, calendar sync, web planner, cross-platform, more profiles, custom widgets, advanced scheduling | (10), (11) | 2026-11-06 |
| Free keeps | basic planner, to-do lists, focus timer, limited AI chats, 1 profile, mobile only | (9), (10) | 2026-11-06 |

---

## C. What their onboarding asks before value

| | Finch | Tiimo | Nomling v1 (spec) |
|---|---|---|---|
| Screens before home | 18–36 reported | 14 | 5 (≤ 60 s) |
| Account | offered ("log in") | yes, to sync | **never** |
| Quiz | long, card-based | yes (content gated) | 1 skippable chip screen |
| Paywall | yes, soft, after quiz, trial + discount | yes, 2 screens + win-back | **never in onboarding** |
| First real value | after paywall, first goal tick | after account + paywall, first scheduled task | hatch, then first bite fed in < 2 min |

---

## D. Inferred data model (theirs, for comparison only)

```
Finch
Pet        name, colour, pronouns, trait, age stage, energy (daily), likes/dislikes      conf: high (FS02-05, 7)
Goal       title, area, repeat days, reminder time, times per day, done today          conf: high (FS11)
MoodLog    time slot (am/pm/eve), score, tags                                            conf: high (FS12)
Reflection prompt, text, tags (people, topics)                                           conf: high (7)
Adventure  started_at, returns_at (~6 h), discovery                                      conf: med
Currency   rainbow stones (cosmetics) vs energy (adventures)                             conf: high (help title)
Item/Micropet owned, equipped, season                                                    conf: med
Friend     friend code, encouragement sent                                               conf: med
Account    server-side (log in, sync)                                                     conf: med

Tiimo
Account 1-n Profile (≤5) 1-n Task(title, icon, colour, start, duration, priority, steps[], reminder, list)
MoodLog(slider value, time) · Streak(count, trophies) · CalendarConnection(provider)      conf: high/med
```

---

## E. Out of scope (cannot or should not be taken)

- Their art, pet species, character names, NPC shopkeepers, place names, copy and sounds. Never.
- Finch's mental-health content (anxiety/depression quizzes, First Aid). Health-adjacent claims, not our product, and clashes with our "no medical claims" rule.
- Tiimo's neuro-inclusive courses and community hub (licensed/expert content, needs backend).
- Anything server-side: accounts, friends, sync, AI chat, web app, calendar sync, family profiles. Our v1 has no backend.

---

## Nomling vs them

Rules applied: no accounts/backend in v1, no paywall in onboarding, never block dump → start → feed, no medical claims, notifications local and capped.

### BEAT (we do it better)
| feature | them | how Nomling beats it |
|---|---|---|
| **Onboarding before value** | Finch 18–36 steps + quiz + paywall; Tiimo 14 screens + account + paywall | 5 steps, ≤ 60 s, no account, no paywall; hatch is the peak, first bite fed in under 2 min. Count it: aim ≤ 8 taps from launch to first feed. |
| **Reward timing** | Finch: energy fills, then pet leaves ~6 h; reward is delayed | Instant: +1 ✦ on *start*, chomp + confetti on finish. Starting is rewarded, not just finishing. |
| **Pricing / paywall trust** | Subscriptions, 8–10 hidden price points, trial only on yearly, onboarding + win-back paywalls, billing 1★ reviews | One-time Plus ($6.99 → $9.99), "one-time, no subscription" on the paywall, restore + terms visible, never in onboarding, no win-back paywall. Android: optional rewarded ads only. |
| **Capture → action** | Tiimo: capture then schedule a time before the timer; AI is limited on free and needs a server | Brain dump parses locally, free, offline; no times needed; drag bite into the pet's mouth = start. 2 taps from list to timer. |
| **Focus timer** | Tiimo: neutral progress ring. Finch: longer timers and soundscapes are Plus | Pet body-doubles at its desk, donut ring, "ends at 9:41" for time blindness, 2/15/25 min + brown noise all free, "i drifted off" with no penalty. |
| **Streak pressure** | Tiimo streaks + trophies (iOS only) | No streak to lose: "comeback days" only go up, pet naps, one gentle comeback note. |
| **Notifications** | Per-goal reminders (Finch), "too many" complaints (Tiimo) | One nudge-level control (off/gentle/normal/chaos), quiet hours 22–08, never paywalled. |
| **Privacy / data loss** | Accounts + cloud; sync is a top complaint; updates broke access | Local-first MMKV, versioned migrations, JSON export/import. Nothing to sync, nothing to lose. |
| **Choice paralysis** | Tiimo AI ranks priorities (server) | Spin wheel with 5-min snack resets, fully local. |
| **Ratings prompt** | Early prompts got 1★ reviews | Only after 3rd fed task + 2 days, once per version. |

### MATCH (parity we need)
| feature | them | what we need |
|---|---|---|
| **Home-screen widget** | Finch pet widget (free passive nudge); Tiimo task/timer widgets (custom = Pro) | Today widgets are iOS Plus in docs/09. Recommend a **free basic pet widget** (pet + belly state) on both stores, and keep the interactive "start 2 min" widget in Plus. Out of sight = out of mind for ADHD. Needs a DECISIONS.md entry. |
| **Recurring / routine tasks** | Finch goals repeat with days and times-per-day; Tiimo routines | v1 has none: daily things must be re-typed. Add a light "keep on the plate daily" toggle on a bite (no forced days, no times), or pull Routines from Plus into a free basic version. |
| **Customisation depth** | Finch: 3 shops (clothes, furniture, colours), house, micropets, seasonal items | Our closet has hats + 4 colours. Plan a steady drop (seasonal packs, backgrounds) and the Plus room/species so long-term users have goals. |
| Pet growth + surprise | Finch: age stages, likes/dislikes, discoveries | Evolution stages exist; add small random "the pet found…" moments after feeding (v1.1 mutations). |
| Live Activity / Dynamic Island | Tiimo has it | v1.1, Plus on iOS (already planned). |
| Pet tap reaction / idle life | Finch: tap to whistle/pet | Spec has squish + random line; ensure parity. |
| Restore + manage plan in settings | both | Already a paywall rule; add Settings › restore purchases. |

### SKIP (not for v1)
| feature | why |
|---|---|
| Accounts, login, cloud sync | Hard rule: no backend in v1. iCloud sync later in Plus. |
| Friends / Tree Town / encouragement | Needs a server and moderation; "Nomling Club" later. |
| AI co-planner chat, voice planning | Server + cost; AI reliability is a 1★ theme. Local parser instead. |
| Calendar import/sync, Reminders sync | Big and buggy for them (top complaint). Maybe read-only later. |
| Visual timeline / scheduling by time | Planning is the "extra work" we position against. |
| Mood check-ins, journaling, insights | Lengthens the loop; health-adjacent. Maybe a 1-tap "how was that?" after feeding later. |
| Anxiety/depression quizzes, First Aid, breathing | Health-adjacent; conflicts with no-medical-claims rule and our focus. |
| Family profiles (≤5) | v1.2 Family mode is a separate project (Kids/Families policy). |
| Web planner, Apple Watch | Scope; mobile-first. |
| Courses, community hub | Licensed/expert content + backend. |
| Guardian / sponsorship program | Needs a server to gift; revisit if Plus sells. Nice idea for brand. |

---

## Size (for Nomling's equivalent slice)
Their combined surface: Finch ~28 screens / 5 flows, Tiimo ~31 screens / 4 flows. Nomling v1 is ~9 screens / 5 flows / 5 entities (spec). The MATCH gaps add: 1 widget extension (M, native target), recurring-bite flag (S), cosmetic content pipeline (M, mostly art). Hard parts: widget + Live Activity native targets, drag-to-feed gesture feel, local parser quality. Size: **M**.
