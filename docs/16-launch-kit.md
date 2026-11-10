# 16 — Launch kit: everything that can be ready before the accounts

Written 2026-11-10. The Apple ($99) and Google ($25) accounts open around **1 December**. This file is what we do in the ~20 days before, so day 1 is only clicking.

Files that go with it:
- `store/listing.json` — the store text for both stores. Check it with `node scripts/check-listing.mjs`.
- `legal/privacy.md`, `legal/terms.md` — the privacy policy and terms pages.
- `.maestro/` — the automatic test of the main loop.

---

## A. Real people test the Android app NOW (free, no account)

Goal: **3 to 5 real people** use the app for a few days. This is worth more than any simulated panel.

### How to make the test app (Anass + Claude, about 20 minutes of waiting)
1. Tell Claude: **"build the preview APK"**. Claude runs the free Expo build (`eas build --profile preview --platform android`). It asks you to say yes once.
2. Wait about 15–20 minutes. Expo gives a **link and a QR code**.
3. Open the link on your own Android phone first. Tap **Install**. If the phone says "blocked", tap **Settings › Allow from this source**, then go back and tap **Install**.
4. Use it for 5 minutes. If it opens and you can feed the pet, it is good to share.

### How to share it
1. Copy the Expo link (it works for anyone, for 30 days on the free plan).
2. Send this message on WhatsApp to 3–5 people who have an **Android** phone (friends, classmates, family):

> Hi! I made an app: a small pet that eats your to-do list. Can you try it for 3 days and tell me the truth?
> 1. Open this link on your Android phone: [link]
> 2. Tap Install. If the phone asks, allow installing from the browser.
> 3. Use it like a normal app. No account needed.
> After 3 days I will ask you 5 quick questions. Thank you!

3. Pick people who will be honest. One person with ADHD or who says "I can't start things" is worth three who are just being nice.

### What to ask after 3 days (5 questions, by voice note is fine)
1. What is this app for, in your own words?
2. What did you do the first time you opened it? Where did you stop?
3. Did you open it again the next day? Why or why not?
4. What annoyed you?
5. Would you keep it on your phone? What is missing?

### Even better: watch one person (5 minutes)
Give your phone with a fresh install to one person. Say only: "This is an app for your to-do list. Try it." **Do not help.** Write down every place they stop, look lost, or tap the wrong thing. Send me the notes: they become the fix list.

Write the answers in `private/real-testers.md` (I will make the file when the first answer arrives).

---

## B. Find the 12 Google testers now

Google asks new personal accounts for a **closed test: at least 12 testers, opted in for 14 days in a row**, before the app can go public. (Check the exact rule in your Play Console on day 1; it has changed before.) The 14 days start only when the account exists, so the people must be ready **before** 1 December.

1. Make a list of **16 people** (4 extra, because some will forget). Each needs an Android phone and a **Gmail address**.
   - The 3–5 APK testers from part A go first.
   - Then classmates, family, friends, people who comment on your TikTok.
2. Ask each one now: *"On 1 December I will send you a Google Play link. Can you install my app and keep it for 2 weeks? I need your Gmail address."*
3. Put the names and Gmail addresses in a private note (not in this project folder).
4. On day 1: Play Console › **Testing › Closed testing › Create track** › add the 16 emails › send them the opt-in link. Each person must tap **Become a tester**, then install from Google Play.
5. Remind them once a week to open the app. They must stay opted in for all 14 days.
6. Do not pay for fake testers. Google removes apps for it.

With this, the public Android launch can be about **15–16 December**.

---

## C. Day 1 checklist (about 1 December), in order

| # | What | Where | Wait |
|---|---|---|---|
| 1 | Pay and open the Google Play account ($25) | play.google.com/console | ID check can take days |
| 2 | Start the closed test with the 16 emails | Play Console | 14 days |
| 3 | Pay and open the Apple Developer account ($99) | developer.apple.com/programs | up to a few days |
| 4 | In App Store Connect › **Business**: add bank and tax details. **Check that your Moroccan bank is accepted.** | App Store Connect | days |
| 5 | Make a new support email (not your personal Gmail), tell Claude the address | Gmail | 5 min |
| 6 | Create the AdMob account and the app in it; give Claude the 2 IDs | admob.google.com | 1 day |
| 7 | Create the RevenueCat account (free) and the Plus product in App Store Connect; give Claude the key | revenuecat.com | 1 hour |
| 8 | Claude builds the store versions and fills the store pages from `store/listing.json` | here | 1 day |

Claude gives the exact buttons for each step when you get there.

---

## D. Store answers (ready to paste)

**Category:** Productivity (second: Health & Fitness on the App Store).
**Age rating:** 4+ / Everyone. No violence, no user content, no chat.
**"Contains ads":** Google Play: **Yes** (optional rewarded videos). App Store: **No**.
**In-app purchases:** App Store: yes, one item (Gobblo Plus, one-time). Google Play: none.

**Apple privacy label (iPhone):**
- Data collected: **Purchases** (purchase history), used for App Functionality, **not linked to you**, not used for tracking. This comes from RevenueCat, which checks that Plus was bought.
- Nothing else. No tracking.

**Google Play data safety (Android):**
- Data collected and shared: **Device or other IDs** (advertising ID) and **App interactions / Diagnostics**, by the Google Mobile Ads SDK, for Advertising. Only when the person chooses to watch a video.
- Data is encrypted in transit. People can ask for deletion (the tasks never leave the phone; "Reset everything" deletes them).
- The app uses the **advertising ID**: answer **Yes** in "Advertising ID" in the Play Console.

**Health claims:** none. The listing says "made for ADHD brains" and "not a medical device". Never add "treats", "manages" or "clinically".

---

## E. Screenshots (6 per store)

Take them from the real app on a phone, after the look is final. Light mode for 5, dark for 1.

| # | Caption | Screen |
|---|---|---|
| 1 | Your to-do list is now food | Home: the pet and 3 bites |
| 2 | Can't start? Just 2 minutes | The start sheet with "Start 2 min" |
| 3 | It works next to you | Focus: the clock in the ring, the pet with headphones |
| 4 | Dump the chaos, get bites | Brain dump with 5 bites |
| 5 | It grows when you show up | The evolution screen with a new hat |
| 6 | No streaks. No guilt. | Home in dark mode with the "You're back" bubble |

Sizes: iPhone 6.9" (1320×2868) and 6.5"; Android phone 1080×1920 or taller. Claude frames them and adds the captions.

---

## F. Still open (Anass)

- The name check for "Gobblo" by hand (USPTO, EUIPO, WIPO) and the domain. See `docs/brand-name-check.md`.
- A quick look at **Focus Friend** (a bean pet focus timer, popular in 2025) so Gobblo does not look like a copy. Our difference: Gobblo eats your **to-do list**; you feed it by **starting**.
- The app icon still has the old purple glow. It should match the app (the pet on a plain background). Claude can redraw it.
