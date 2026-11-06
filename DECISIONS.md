# DECISIONS.md — what we changed vs the spec, and why

| date | decision | why |
|---|---|---|
| 2026-11-06 | **Visual direction A + C** (Anass picked): A "cozy diorama" (illustrated world, frosted glass UI) for Home, onboarding, celebrations; C "night studio" (deep navy, one lime accent, big calm numerals) for Focus and dark mode. B's chunky press only on main buttons | research/directions; most premium, least "vibe-coded" |
| 2026-11-06 | **Hatch by feeding** instead of tap-to-hatch (proposed, see research/SUMMARY.md #1) | Finch already does "pick egg → name → tap to hatch" (replica/recon.md). Apple 4.3 copycat risk; feeding teaches the core loop |
| 2026-11-06 | **Name the pet after it hatches**, not before | shorter onboarding, emotional moment |
| 2026-11-06 | **Name "Nomling" is UNSAFE**: an iOS app "Nomling: Fold Monster" (cute monster that eats snacks) launched 2026-10-22, a "Nomlings" desktop pet exists, nomling.com/.app and @nomling are taken (docs/brand-name-check.md). APP_NAME stays a constant; bundle ID is decided before the first store upload | trademark + store confusion risk |
| 2026-11-06 | Anass's feature list sorted in docs/12 (sync and team boards later; streaks, 3D, journal, "emotional help" done in a safer way) | hard rules + store rules |
| 2026-11-06 | Personal progress dashboard, no analytics SDK | privacy labels, no backend |
| 2026-11-06 | Optional biometric app lock in v1 | requested; local only |
| 2026-11-06 | Free basic pet widget planned for v1.1 on both stores (interactive widget + Live Activity stay Plus) | Finch's widget is free (recon MATCH 1) |
| 2026-11-06 | Ran /replica-recon on Finch and Tiimo although CLAUDE.md says not to | Anass asked for it explicitly; clean-room map only, nothing copied |
| 2026-11-06 | **Repeating bites are free** on both stores ("keep daily"); basic Routines move out of Plus, only packs/templates stay paid | run 2: 28 reviews hate paywalled basics (repeat tasks, subtasks) |
| 2026-11-06 | **"Plus is yours forever" promise** on the paywall and in docs/09: one-time buyers are never moved to a subscription; a later Club only adds things | run 2: Goblin Tools moved one-time buyers to a subscription, 22 reviews at 2.3★ |
| 2026-11-06 | **No free trial**, no AI in the core loop (sizes/steps are editable rules) | run 2: 60 reviews on wrong AI; trials tied to billing complaints |
| 2026-11-06 | **Android parity is a release gate**: reminders tested on 2 real Android phones (battery saver, Doze); a "loud" sound + vibration option inside the capped nudge levels | run 2: 36 Google Play reviews at 2.8★ say Android is second-class |
| 2026-11-06 | Routes live in `src/app/` (Expo SDK 58 template default) instead of `app/` from docs/04 | expo-project-structure skill; keeps routes-only folder |
| 2026-11-06 | **App name = Gobblo** (Anass picked). Bundle ID / package `app.gobblo`, scheme `gobblo`, MMKV id `gobblo`. Docs still say "Nomling" in places; the code reads the name only from `src/config/app-identity.json` | "Nomling" unsafe; Gobblo: no App Store app, 0 Trademarkia hits, gobblo.app + getgobblo.com + @gobblo (Instagram) free at check time. Manual USPTO/EUIPO/WIPO check still to do |
| 2026-11-06 | Skia stays (Anass: "don't remove anything"). Briefly removed, then restored | the free EAS Android worker ran out of memory twice compiling Skia + Reanimated + worklets + nitro C++ in parallel |
| 2026-11-06 | Android builds: arm64-only for dev builds; `plugins/with-gradle-memory.js` (2 Gradle workers, no parallel, 3 GB heap) | keep builds inside the free worker's memory |
