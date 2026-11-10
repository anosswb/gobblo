# 12 — Anass's feature list (2026-11-06), sorted

Rule used: every feature must keep the core loop short (dump → start → feed), respect the hard rules (no backend/accounts in v1, no medical claims, no streak shame) and the store rules (docs/05).
**v1** = we build it now · **v1.1** = right after launch · **later** = needs a server or a separate project · **changed** = we do it a safer way.

| # | request | decision | how we do it |
|---|---|---|---|
| 1 | dark mode | **v1** | Designed separately (direction C "night studio"), System / Light / Dark in Settings |
| 2 | real-time sync across devices | **later** (iOS v1.1 partly) | Real-time cross-device sync needs a server + accounts (breaks v1 rule). v1.1: iCloud sync iPhone ↔ iPad (Apple's servers, no account for us), Plus feature (docs/09). Android ↔ iPhone = only with a backend ("Club", later) |
| 3 | offline data support | **v1** | 100 % offline already: everything lives on the phone (MMKV), backup export/import |
| 4 | analytics dashboard | **v1 (changed)** | A *personal* progress dashboard on Me (your data, on your phone). No third-party analytics SDK (privacy labels stay clean) |
| 5 | focus timers | **v1** | 2 / 15 / 25 min + custom, "ends at", body-double pet, 2-min warning haptic |
| 6 | task gamification | **v1** | Sparks, feeding, evolution, hats, spin wheel, brain type |
| 7 | social sharing | **v1** | Brain card image + weekly recap card → share sheet (TikTok/Instagram). Watermark = free marketing |
| 8 | habit streaks | **v1 (changed)** | Classic streaks cause shame (docs/07). We do **"keep daily" bites** + a **weekly bites meter** that never "breaks" + comeback days that only go up |
| 9 | collaborative team boards | **later** | Needs a server, accounts, moderation. Planned as "body double room" (friends' pets work together) in Gobblo Club |
| 10 | good 3D elements | **v1 (changed)** | Glossy 2.5D pet in Skia (lighting, soft shadow, squish), parallax scenes with phone tilt. Real 3D models (three.js) are too heavy for mid-range Android at 60 fps |
| 11 | interactive charts | **v1** | Me: week bar chart (bites, minutes), "your best hours" heat strip, tap a bar for details. Built with Skia (victory-native) |
| 12 | daily mindfulness prompts | **v1.1, opt-in (changed)** | One tiny pet note on Home ("3 slow breaths, then 2 minutes?"). Off by default, never blocks starting. No therapy words |
| 13 | gratitude journal | **v1.1, opt-in (changed)** | After feeding: optional "one good thing?" line → a "good things jar" on Me. Not a full journal (that lengthens the loop) |
| 14 | personalized themes | **v1** | 4 pet colours + 3 app accents free; more themes: iOS Plus / Android sparks + rewarded ad |
| 15 | notification sounds | **v1, free** | 4 pet sounds for nudges. Free forever (Structured got 1★ for paywalling this) |
| 16 | ASMR for deep focus | **v1** | Brown noise + 2 ASMR loops free (rain, soft keyboard). More (café, pages, lo-fi) = Plus soundscapes, mixable |
| 17 | 10 more preferences | **v1** | see list below |
| 18 | ADHD support features | **v1** | see list below (research agent is adding Reddit evidence to docs/07) |
| 19 | emotional help + daily quotes | **v1 (changed)** | Encouraging pet lines + one daily "pet wisdom" card (our own words). We do **not** offer "emotional help" (health claim, Apple 1.4.1). Settings › About has "not a medical device" |
| 20 | store design guidelines | **v1** | iOS HIG + Material: native sheets, back gesture, Android back button, 44 pt targets, Dynamic Type, safe areas |
| 21 | biometric lock | **v1** | Optional Face ID / fingerprint lock (expo-local-authentication), off by default, works offline |

## The 10 extra preferences (Settings)
1. default timer (2 / 5 / 15 / 25) · 2. quiet hours start/end · 3. haptic strength (off / soft / strong) · 4. sound volume + "mix with my music" · 5. pet talk (chatty / quiet / silent) · 6. auto-sleep when idle (on/off) · 7. week starts Mon/Sun · 8. 12 h / 24 h clock · 9. confetti amount (lots / a little / none) · 10. one-thing mode (show only the next bite)

## ADHD support features (to streamline tasks)
- **one-thing mode**: Home shows only the next bite, the rest is hidden (overwhelm)
- **2-minute warning** haptic before the timer ends (transitions are hard)
- **"leaving soon" bite**: "I have to leave at 3:00" → the pet nudges you 20 min before (time blindness, "waiting mode")
- **chop it smaller** for big bites (already in spec)
- **spin when stuck** (choice paralysis, already in spec)
- **drifted? no penalty** button (already in spec)
- **body double** pet at a desk (already in spec)
- **brain dump** with no dates or times (already in spec)
