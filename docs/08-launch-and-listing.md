# 08 — Build, test, launch, listing

## Accounts Anass needs (in this order)
1. **Expo account** (free): expo.dev, needed for EAS Build.
2. **Apple Developer Program** ($99/year, individual): developer.apple.com/programs. Approval can take a few days.
3. **Google Play Console** ($25 once, personal): play.google.com/console. Identity verification can take days.
4. **RevenueCat** (free tier): after Apple is approved.
5. A support email (e.g. a new Gmail `nomling.app@…`), used in the stores and the privacy policy.

## Build pipeline (no local Xcode needed)
- `eas build --profile development --platform ios|android` → install the dev client (iPhone: register the device with `eas device:create`; Android: install the APK).
- `npx expo start --dev-client` for daily work.
- `eas build --profile preview` → TestFlight (iOS) / Play internal testing (Android).
- `eas build --profile production` + `eas submit` → stores.
- OTA fixes for JS-only changes: `eas update` (only for bug fixes, not new features that change what reviewers saw).

## Google's 12-testers rule (start early!)
You need **12+ testers opted in to a closed test for 14 days in a row** before you can even apply for production. Start the closed test as soon as the app is stable (Phase 5) so the 14 days run while you polish iOS.
Where to find 12 real Android users: friends, family, classmates at the Université Chouaib Doukkali, coworkers, your TikTok followers ("test my app early"). They must stay opted in for all 14 days, so ask them to open it a few times. Don't buy fake testers.

## Store listing draft (`store/listing.json`, lint with replica-launch `listing.py`)
**App Store**
- Name (≤30): `Nomling: ADHD Task Pet`
- Subtitle (≤30): `Feed it by starting tasks`
- Keywords (≤100, comma-separated, no spaces, no words already in the name): `focus,timer,todo,planner,habit,routine,procrastination,brain,dump,visual,body,double,motivation,cute`
- Promotional text (≤170): `Can't start? Start for 2 minutes. Your pet works next to you, eats your tasks and evolves. Free core, no guilt, nudges you control.`
- Description: hook line → the loop in 4 bullets → what's free → Plus (one-time) → "not a medical device" line → privacy line ("your tasks stay on your phone").
**Google Play**
- Title (≤30): `Nomling: ADHD Task Pet`
- Short description (≤80): `A cute pet that eats your to-do list. Start for 2 min. No guilt.`
- Declare "Contains ads". In the description, say ads are optional rewarded videos (a selling point: "no ads in your face").
Claude Code: count every field with `listing.py` and fix any limit or keyword waste it reports.

## Screenshots (6, both stores, light and one dark)
1. "your to-do list is now food" (Home with drag in action)
2. "can't start? just do 2 minutes" (start sheet, 2-min highlighted)
3. "it works next to you" (focus screen, body double)
4. "dump the chaos, get bites" (brain dump → bites)
5. "it evolves when you show up" (evolution screen)
6. "no streak shame. ever." (comeback bubble + stats)
Real UI only, framed with big lowercase captions. Make them with the ASO Shots skill (`npx skills add ceorkm/aso-shots`) or by hand.

## TikTok / Reels launch (start before launch)
- Post 1 video per day for 2–3 weeks before launch, then keep going. Formats: "POV: my ADHD to-do list is food now", "the 2-minute trick", "hatching my ADHD pet", "my app called me a midnight hyperfocus goblin", "rating apps that guilt-trip you vs mine".
- Link in bio: the waitlist page or TestFlight / Play test link at first, then the store links.
- Use Higgsfield / Nano Banana for b-roll and covers. Record the real app for the demo parts (it must match the store).
- Ask for comments ("what should it eat next?") to pick new features. The comments become the roadmap.

## After launch (first 30 days)
Watch: day-1 / day-7 retention, % of users who feed at least 1 bite on day 1, Plus conversion (iOS), rewarded ads watched per daily user and AdMob eCPM (Android), crash-free sessions, review themes. Reply to every review. Ship a small update every 1–2 weeks (new hat or pet = novelty = a reason to post on TikTok).
