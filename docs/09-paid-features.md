# 09 — Paid features

> **2026-11-10:** One single Plus (no more Start Kit / Make It Yours / bundle). Plus = full closet + lock-screen focus timer + routine packs. Android: 150 sparks. iOS: one-time purchase, display default $4.99 (real price from the store). The widget one-tap 2-minute start is free for everyone: starting a task is the core loop. Old pack ids in `unlocked` still count as Plus.

Principle (from the review research in docs/07): the core loop stays free forever, and paid features are things people WANT to show off or that make the app feel more alive. No paywalled basics like notification sounds. That exact thing got a 1★ review for Structured.

## iOS: Gobblo Plus (one-time, launch $6.99, then $9.99)
| feature | why people pay | build size |
|---|---|---|
| **Pet species pack**: 4 extra species (axolotl blob, sleepy cat-bean, tiny dino, ghost), each with its own idle and eating animation | collection instinct; Finch reviewers ask for "more animals" | L |
| **The pet's room**: decorate a room (bed, lamp, posters, plants, rug) with items earned by eating bites | Finch reviewer: "I need more rooms to decorate"; long-term goal | L |
| **Home-screen + lock-screen widgets**: the pet shows your next bite, and you tap to start 2 minutes | ADHD "out of sight, out of mind", so the app lives on the home screen | M |
| **Live Activity / Dynamic Island timer**: the pet works in the Dynamic Island during focus | very visible, great on TikTok | M |
| **Focus soundscapes**: rain, café, library, lo-fi loop, mixable with brown noise | body-doubling + focus crowd | S |
| **Alternate app icons**: 6 icons (night pet, crown pet, dino…) | cheap to make, people love it | S |
| **Weekly "brain wrapped"**: a shareable story card (best day, top hour, bites eaten, brain type) | vanity mirror, free marketing on Instagram/TikTok | M |
| **Routine packs**: ready-made bite packs and templates (morning, after school, Sunday reset). Basic "keep daily" repeating bites are FREE on both stores (DECISIONS.md) | requested "set routines"; paywalled basics get 1★ | M |
| **iCloud sync between iPhone and iPad** | Tiimo's top complaint was sync (50 reviews) | M |

**Pet packs** (non-consumable, $1.99–$2.99): seasonal species or hat drops (Ramadan lanterns, Halloween, winter). These give a reason to post on TikTok every month.

**Later (needs a server, so a subscription makes sense): "Gobblo Club" $2.99/month or $19.99/year.** Body-double rooms where friends' pets work together live, plus monthly exclusive pets. Only build it after Plus is selling.

## Android: ads (AdMob), same items
- Rewarded "watch an ad" options (always optional, max 3 per day):
  - +5 ✦
  - try a Plus species or hat for 24 h
  - double the sparks of one bite (shown after the celebration ends)
  - unlock one room item
- Widgets, sounds and routines are free on Android (Google can't take payments from a Moroccan account, so we don't hide them behind a wall). Plus species can be earned with sparks + rewarded ads.
- One small banner on Closet and Me only. No interstitials in v1.

## Promise
**Plus is yours forever.** One-time buyers are never moved to a subscription. If a Club comes later, it only adds new things (DECISIONS.md, run-2 reviews). No free trial.

## Paywall rules (both stores)
Never in onboarding. Never blocking dump → start → feed. Shows the price, "one-time, no subscription", restore purchases, terms and privacy links. Can be opened from the Closet, a locked item, or Settings. Design it from the Screenrove paywall references and the RevenueCat report (deck.gallery). Test the price at $6.99 vs $9.99 later with RevenueCat experiments.
