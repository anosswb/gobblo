# 07 — Entrepreneur findings (replica-entrepreneur method)

**Sample (run 2, 2026-11-06): 1,504 store reviews + 226 forum comments.**
- Run 1: 599 App Store (US) reviews, the 200 newest each for **Finch**, **Tiimo** and **Structured** (2026-05-28 → 2026-11-04), from Apple's public customer-reviews RSS feed.
- Run 2, new: **Google Play** (US, English), read in the browser: Finch 220, Tiimo 195, Structured 180, **Goblin Tools** 140 (20 "most relevant" + the newest per app). **Goblin Tools App Store** 200 (RSS, 2025-01 → 2026-11). **Hacker News** 226 comments that contain "goblin tools", "body doubling", "task paralysis" or Finch + ADHD (Algolia API).
- Ranked with the skill's `reviews.py` and `research/themes_adhd_v2.json` (run-1 themes + 13 new ones). Store ratings, both runs: 233×1★, 101×2★, 128×3★, 180×4★, 893×5★ (raw rows, before the tool drops 31 short duplicates).

**Limits.**
- **Reddit (r/ADHD, r/ADHDers, r/adhdwomen) is NOT in this run.** It could not be reached by any allowed route: the browser tool blocks reddit.com, Reddit's API now needs a logged-in OAuth app, and web search refuses the domain. No Reddit quotes appear here. To add it, Anass can read threads by hand and paste rows into the CSV, or register a Reddit API app (his account) and re-run.
- Hacker News is developers, and many comments are founders promoting their own tools. HN is used only for "unsolved" and the ADHD features list, never for the hate ranking. Every HN theme is thin (one source, no stars).
- Google Play "newest" for Finch is mostly short 5★ reviews from 10 days. Structured and Goblin Tools on Play go back to 2023–2024 (low volume).
- Theme counts come from regex matching, so some rows are false hits. The quotes below were checked by hand.
- Tags: **[AS]** App Store, **[GP]** Google Play, **[HN]** Hacker News. **NEW** = first found in run 2.

Full output: `research/feedback_v2.md` (run 2 alone, combined, HN alone). Raw rows: `research/reviews_v2.csv` (new) + `research/reviews.csv` (run 1).

## 1. What they hate (ranked by the tool, both runs combined)
| # | theme | reviews | avg ★ | where | example (verbatim, linked) |
|---|---|---|---|---|---|
| 1 | Price and paywalls | 175 | 3.1 | AS + GP, all 4 apps | "Overpriced and plain." [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14602910529) · "Nice looking app but the price = disability tax." [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=05a58f0c-5f70-42eb-a5b7-4b5ab1ee6644) |
| 2 | Bugs and crashes | 127 | 2.6 | 76 of the new 105 are **Goblin Tools** (54 AS, 22 GP) | "Crashes every second." [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-14015400656) |
| 3 | Sync, calendar, widgets | 145 | 3.2 | AS + GP, worst on Android | "it only reads from Google calendar" [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=4c184c41-e3b1-4fbf-8a35-90cc3d2e719f) |
| 4 | Notifications (too many on AS / **don't arrive on GP**) | 96 | 3.1 | AS + GP | "Too many notifications to rate the app." [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14115646181) · "I don't get any notifications for items I add" [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=74093a7e-5442-4393-abd3-947f408f3258) |
| 5 | Billing, cancelling, refunds | 45 | **1.5** | AS + GP | "Unable to cancel during the 7 day trial period." [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=d31fb04a-3982-42b3-a91e-c329ecaf7c8a) |
| 6 | **NEW** AI that gets it wrong or costs more effort | 60 | 2.9 | Tiimo, Structured, Goblin (AS + GP) | "The AI feature takes more time than it saves." [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a67c7e00-225a-450e-84d9-76620ff7bf9d) · "It put my tasks in Swedish?" [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13040942631) |
| 7 | Sync and lost data | 67 | 2.9 | AS + GP | "when I logged back in EVERYTHING WAS GONE" [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=c2df56db-771a-410e-98c1-0e12cb9de83a) |
| 8 | Confusing / overwhelming setup | 101 (41 + 60) | 3.1 / 3.9 | AS + GP | "Clunky and Inefficient." [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14147733356) |
| 9 | A redesign or update made it worse | 22 | 1.9 | AS + GP | "Developer keeps changing the program weekly" [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14575281782) |
| 10 | **NEW** Android is second-class (missing features, broken sync/notifications) | 36 | 2.8 | **GP only** (Tiimo 11, Structured 22) | "widgets and the AI assistant aren't available on android still." [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a2a43156-d3ac-4960-8c2e-ff8092a7c022) |
| 11 | **NEW** Basic features paywalled (repeat tasks, subtasks) | 28 | 2.8 | mostly **GP Structured** (14) | "what do you mean i need to pay to put weekly events???" [Structured GP](https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=0e23b565-7f42-4966-8f1d-4a2646714d88) |
| 12 | **NEW** Paid once, then asked to pay again (switch to subscription) | 22 | 2.3 | **Goblin Tools AS + GP** (Aug–Oct 2026) | "The developer has moved the app to subscription, booting users who paid before." [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-14519895950) |
| 13 | Ads (incl. sponsored themes in a paid app) | 30 | 3.2 | AS + GP | "the last place I want to see ads" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=13180ef3-7a32-4635-8db5-3c69573d89df) |
| 14 | **NEW** Lost everything (lists, pet, streak) | 15 | **1.8** | AS + GP | "I am grieving for my bird I had for 18 months." [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=8aa7c93d-473e-4e87-b849-cdafb87a7a78) |
| 15 | Rating prompt before you used the app (was thin in run 1) | 12 | 2.2 | AS Tiimo/Structured + **GP Tiimo** | "don't ask for a review 30s after installation" [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=2166c085-e30a-4c6c-8486-cecef1291365) |
| 16 | Paywall only after a long setup / quiz | 7 | 2.3 | AS Finch/Tiimo + **GP Tiimo/Goblin** | "Takes you through setup before telling you it's a paid app." [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=e2c4ae67-9529-466f-98de-d36f3565e023) |
| 17 | **NEW** Reminders too weak (want loud / nagging) | 8 | **1.8** | **GP only** (Tiimo, Structured), thin-ish | "I need nagging/constant reminders" [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a3bff1b1-dcd7-46dc-aff8-9b7eb4a0351b) |

Read by hand (low ratings, small counts, but they matter):
- **Review prompts too early** (run 1, still true): "continuing to ask me how I like an app, in the first hour" [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14658746349)
- **Logging is extra work** (run 1): "Extra work. I don't understand the point of this app." [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14602053824)
- **NEW, web wrapper** (Goblin iOS, crash-heavy): "Clearly just the website pushed into an app shell." [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13474870474)
- **NEW, hidden real price**: "you've hidden the real cost behind an easily digestable $1 entry fee" [Goblin GP](https://play.google.com/store/apps/details?id=com.goblintools&reviewId=cbf6bb30-c746-4a3f-a5af-311c74fe6729)
- **NEW, too gamified** (6 reviews, thin): "less health, more.. grind." [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=0be96cda-dcd4-4b88-bb01-ac6a45fec837)
- **NEW, ticking is not doing** (2, thin): you can "simply just click and say "Yeah, I did this."" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=6a898e2f-dbf2-485b-a1b6-a6a46cb68c26)
- **NEW, free trials are a trap for ADHD**: "As someone with ADHD I do not do free trials" [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=47e4882a-2019-49b1-9109-696c99a0e1d2)

## 2. What is missing (in their words)
- **NEW, a pet you actually feed** (Finch GP, 4★, the #3 "most relevant" review): "needing to feed your Birb would probably help more with motivation" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=64ecfb58-13f6-4416-a083-25c1f49754cc) · "I should be able to check and always interact with it." [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=6a898e2f-dbf2-485b-a1b6-a6a46cb68c26)
- **NEW, reminders that reach you** (GP): "not have an option for actual loud notifications as well as visual" [Tiimo GP](https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=86b3da89-40f1-4406-a879-4858251325ca)
- Limit nudges instead of all-or-nothing (run 1): "there needs to be a way to limit the notifications (not turn off completely)." [Finch AS](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14745753774)
- **NEW, free repeat tasks**: "something as basic as marking something daily,weekly etc... is locked behind a paywall" [Structured GP](https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=09077ca1-d5ee-4231-90b8-fff51103d7f5)
- No forced days: "you are forced to pick specific days." [Finch AS](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14746061851). Same complaint on GP: "You can't set weekly goals without picking a day" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=96c0c16f-abb9-4f02-b291-467b2c51e26b)
- Easy reorder: "I wish it was easier to drag to reorder…" [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14721868044) · "good luck being able to drag and drop to reorder" [Goblin GP](https://play.google.com/store/apps/details?id=com.goblintools&reviewId=e2df449f-5c04-4608-956e-03d915e0ced5)
- **NEW, readability**: "no dark mode makes it incredibly difficult to log things at night" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=2400d159-76ea-4a96-b502-abfb2f628dc2) · "the interface isn't dyslexic friendly" [Goblin GP](https://play.google.com/store/apps/details?id=com.goblintools&reviewId=36cafc39-31ce-4ca1-8487-356fa4455463)
- **NEW, Android parity**: see hate #10.
- More pets/variety (run 1): "I wish there was a wider variety of animals." [Finch AS](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14724974422)
- Sharing with a partner (still thin): "share goals more completely with a spouse or partner" [Finch AS](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14738408388)

## 3. What is unsolved (our positioning)
1. **Starting is still unsolved.** Finch rewards check-ins, Tiimo and Structured are planners, and Goblin Tools breaks a task into steps but stops there. Even its fans ask to be pushed to come back: "I need a reminder to USE these tools" [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-12374714317). A forum note on why systems fail: "the task paralysis has always shifted to encompass the techniques themselves" [HN](https://news.ycombinator.com/item?id=37655061). Gobblo: dump, auto-break, start 2 minutes, feed. Nothing to plan.
2. **NEW, Android users are second-class in ADHD planners** (36 GP reviews, 2.8★). An app that is equal on Android, with reminders that really fire, is a real gap. Morocco is mostly Android, so this matters for us too.
3. **NEW, honest pricing for people who forget.** Trial traps, hidden subscriptions and "paid once, pay again" score 1.5–2.3★ (67 reviews combined). One-time Plus with no trial, plus a written promise, is positioning.
4. **NEW, body doubling without video or scheduling** (HN, thin). People say it works but say the setup is friction: "I find the video aspect to be awkward" [HN](https://news.ycombinator.com/item?id=49035087) · "phoning a friend for five minutes is free and does the job" [HN](https://news.ycombinator.com/item?id=42014934). The pet working next to you during focus is a light, solo body double.

## 4. ADHD support features people ask for
Things ADHD users say help them get tasks done, in their words. Reddit was not reachable (see Limits), so this comes from store reviews and HN.

| feature | what it does for them | quote (verbatim, linked) | Gobblo |
|---|---|---|---|
| Break a task into tiny steps | removes "where do I start" | "breaking it into bite sized pieces" [Goblin GP](https://play.google.com/store/apps/details?id=com.goblintools&reviewId=418c2bcf-56f0-4a29-8fd0-51c7b41b4c19) · "one of my biggest struggles is not knowing where to start" [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-12521357491) | bites + "make it smaller" (free) |
| Help with task initiation | the start itself | "Helps me so much with task avoidance and task initiation." [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-12283948940) | 2-minute start is the core |
| Instant reward | dopamine right after doing | "a little instant reward and celebration helps motivate me" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=1f44b43a-f6e1-4eb9-9e0e-865411aa2af1) | feed animation + sparks |
| No shame for missed days | keeps them coming back | "it never shames you for missing a goal" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=1f44b43a-f6e1-4eb9-9e0e-865411aa2af1) · "no guilt or negative reinforcement" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=6a51470c-d830-425f-96c0-de6050d1830e) | pet never dies or gets sad at you |
| Low-maintenance pet | cute without becoming another chore | "Unlike a Tamagotchi, your bird doesn't require tons of hard work to look after." [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=ad73091e-dc65-49c8-8839-cf4bf6b15959) | hunger is cosmetic, never a penalty |
| Visual time | fights time blindness | "The reminders and visual timers help me see time passing…" [Tiimo AS](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14709707296) · "i have pretty bad time blindness" [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-14409031348) | focus ring timer |
| Home-screen widget as a reminder | out of sight = out of mind | "it helps remind me to get on the app" [Finch GP](https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=122704ad-a804-407a-811b-a6b180dde4b4) | widget (see docs/09 note) |
| Reminders strong enough to notice | when the phone is not in hand | "I need to be reminded to do my chores!" [Goblin GP](https://play.google.com/store/apps/details?id=com.goblintools&reviewId=540559d8-722d-42bf-b395-084492f07338) | nudge levels incl. a loud one |
| Few tools, not a toolbox | avoids overwhelm | "hits the sweet spot between offering plenty and not overwhelming." [Goblin AS](https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13742291815) | one loop, few screens |
| Body doubling (thin, HN) | someone "there" while working | "phoning a friend for five minutes is free and does the job" [HN](https://news.ycombinator.com/item?id=42014934) | pet works beside you; live rooms later |

## Fix plan (built into the spec)
| fix | size | where | evidence |
|---|---|---|---|
| Free core forever; paywall never in onboarding; one-time Plus, no subscription and **no free trial** in v1 | S | docs/06, paywall | price 175, billing 45 (1.5★), setup-then-paywall 7 |
| **NEW** Written "Plus is yours forever" promise. Never move one-time buyers to a subscription; a future Club only adds things | S | paywall copy, DECISIONS.md | paid-then-sub 22 (2.3★), Goblin Tools 2026 |
| Nudge level (off / gentle / normal / chaos) + quiet hours, never paywalled. **NEW:** "chaos" gets a loud sound + vibration channel, still capped | S | features/nudges | notifications 96; weak reminders 8 (1.8★, GP) |
| **NEW** Android parity: same features on both stores at launch. Test that reminders really fire on Android (exact alarms, Doze, battery saver, notification channels) on 2 real phones | M | release checklist, Maestro | Android second-class 36 (2.8★, GP only) |
| **NEW** Repeating bites (daily / some days / "this week, any day") free on both platforms | S | dump, bite model | basic-paywalled 28; forced days (AS + GP) |
| Rating prompt only after 3 fed bites + 2 days, once per version | S | expo-store-review | 12 reviews, 3 sources |
| 10-second capture: brain dump + auto-sizing, no dates/times required | M | dump | overwhelm 60, "extra work" |
| **NEW** Sizes and steps are rules the user can edit, not an opaque AI. No AI in the v1 core loop | S | dump, bites | AI theme 60 (2.9★) |
| Drag-to-reorder bites without times | S | home list | AS + GP |
| Local-first, schema migrations, export/import backup **free**. **NEW:** the pet and its history can never be lost by an update | M | lib/storage | lost data 67, lost everything 15 (1.8★) |
| Native screens only, no WebView | — | hard rule (already) | Goblin web-wrapper + crash reviews |
| More pets / colors / hats over time (novelty) | M | closet, Plus | run 1 |
| Calendar sync: NOT in v1. Maybe read-only "today's events" later | L | backlog | sync 145, mostly bugs in competitors |

## The angle (recommended)
> For ADHD brains who are tired of planners that nag, paywall the basics and make logging feel like homework, **Gobblo** is a pet you feed by just *starting*: free core, pay-once extras that stay yours, nudges you control, same app on Android and iPhone.
> Evidence: price/paywall 175 reviews, billing 45 (1.5★), paid-then-subscription 22, basic features paywalled 28, Android second-class 36, overwhelm/confusing 101, across 8 app × store sources. Direct ask from a Finch user: "needing to feed your Birb would probably help more with motivation".

## What changed vs run 1
- **More data:** 599 → 1,504 store reviews, 3 → 8 app × store sources, plus 226 HN comments. Reddit is still missing (blocked).
- **Bugs rose to #2.** This is mostly Goblin Tools on iOS (crashes, a web wrapper). It confirms our "native only, test before release" rule. It does not mean users rank bugs over price.
- **5 new themes, mostly from Google Play:** Android second-class (36), basic features paywalled (28), paid once then subscription (22, Goblin Tools), lost everything incl. a pet (15, 1.8★), reminders too weak (8, GP only).
- **AI is now a ranked complaint** (60 reviews, 2.9★, Tiimo + Structured + Goblin): wrong language, wrong time estimates, more effort than it saves.
- **Notifications split by store:** App Store users want fewer, Play users say reminders don't arrive or are too quiet. Same fix (user-chosen nudge level), plus Android delivery testing and a loud option.
- **No longer thin:** rating prompt too early (3 → 12, 3 sources) and paywall after setup (now 7, 4 sources).
- **Direct validation of the core idea:** a Finch Play user asks for a pet you feed with tasks.

Rules we follow from the skill: never copy their names or quotes into our marketing, and never post fake reviews.
