# 07 — Entrepreneur findings (replica-entrepreneur method)

**Sample:** 599 App Store (US) reviews, the 200 newest each for **Finch**, **Tiimo** and **Structured**, dated 2026-05-28 → 2026-11-04, pulled from Apple's public customer-reviews RSS feed (the source the skill allows). Ranked with the skill's `reviews.py` plus ADHD-specific themes (`research/themes_adhd.json`). Ratings: 386×5★, 65×4★, 30×3★, 32×2★, 87×1★.
**Limit:** a single store type, US only. Themes are "3 sources" because there are 3 apps, but it's all App Store. Before big bets, add Google Play, Reddit (r/ADHD) and TikTok comments. Full output: `research/feedback.md`, raw rows: `research/reviews.csv`.

## 1. What they hate (ranked by the tool)
| # | theme | reviews | avg ★ | example (verbatim, linked) |
|---|---|---|---|---|
| 1 | Price and paywalls | 66 | 3.3 | "Overpriced and plain." [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14602910529) |
| 2 | Sync, calendar, widgets | 50 | 3.2 | "Calendar sync is PER DEVICE, not per account." [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14343710812) |
| 3 | Notifications (too many / paywalled) | 39–40 | 3.1 | "Too many notifications to rate the app." [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14115646181) · "Changing notification sounds are also paywalled" [Structured](https://apps.apple.com/us/app/id1499198946?see-all=reviews#review-14415144854) |
| 4 | Billing, cancelling, refunds | 20 | **1.4** | "Canceled but charged anyway." [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14303753054) |
| 5 | Confusing / clunky | 24 | 2.8 | "Clunky and Inefficient." [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14147733356) |
| 6 | Overwhelming / too much setup | 23 | 3.2 | (see the "extra work" review below) |
| 7 | Bugs and crashes | 22 | 2.9 | "After the 11-1-2026 update" (can't access) [Finch](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14736714493) |
| 8 | A redesign or update made it worse | 9 | 2.0 | "Developer keeps changing the program weekly" [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14575281782) |

Read by hand (low ratings with no theme), and they matter:
- **Review prompts too early** (3 separate 1★ reviews): "Zero stars. for continuing to ask me how I like an app, in the first hour of using it." [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14658746349)
- **Paywall after the onboarding quiz:** "…take a whole quiz and THEN tell you need to pay for a subscription…" [Finch](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14730559010)
- **Logging is extra work:** "Extra work. I don't understand the point of this app." [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14602053824)
- **High-pressure sales:** "…if it weren't for the constant high pressure sales…" [Finch](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14729185098)
- **Unreliable AI:** "The AI sucks… That whole feature is unusable" [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14633204288)

## 2. What is missing (in their words)
- Limit nudges instead of all-or-nothing: "there needs to be a way to limit the notifications (not turn off completely)." [Finch](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14745753774)
- No forced days: "you are forced to pick specific days." [Finch](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14746061851)
- Easy reorder without times: "I wish it was easier to drag to reorder… without assigning set t…" [Tiimo](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14721868044)
- More pets/variety: "I wish there was a wider variety of animals." [Finch](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14724974422)
- Visual time works (keep it): "The reminders and visual timers help me see time passing…" [Tiimo, 5★](https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14709707296)
- Sharing with a partner (thin, 1 review): "share goals more completely with a spouse or partner" [Finch](https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14738408388)

## 3. What is unsolved (our positioning)
None of the three is built around **getting started** (task paralysis). Finch rewards self-care check-ins, while Tiimo and Structured are planners where you schedule your day. Planning is the "extra work" ADHD users complain about. Nomling skips planning: dump, pick, start 2 minutes, feed.

## Fix plan (built into the spec)
| fix | size | where |
|---|---|---|
| Free core forever; paywall never in onboarding; one-time Plus, no subscription in v1 | S | docs/06, paywall |
| Nudge level (off / gentle / normal / chaos) + quiet hours, never paywalled | S | features/nudges |
| Rating prompt only after 3 fed bites + 2 days, once per version | S | expo-store-review |
| 10-second capture: brain dump + auto-sizing, no dates/times required | M | dump |
| Drag-to-reorder bites without times | S | home list |
| Local-first, schema migrations, export/import backup ("updates broke it") | M | lib/storage |
| More pets / colors / hats over time (novelty) | M | closet, Plus |
| Calendar sync: NOT in v1 (big, buggy for competitors). Maybe read-only "today's events" later | L | backlog |

## The angle (recommended)
> For ADHD brains who are tired of planners that nag, paywall the basics and make logging feel like homework, **Nomling** is a pet you feed by just *starting*: free core, pay-once extras, nudges you control.
> Evidence: price/paywall 66 reviews, notifications 39–40, billing 20 (1.4★ avg), overwhelm/confusing 47 combined, across 3 apps.

Rules we follow from the skill: never copy their names or quotes into our marketing, and never post fake reviews.
