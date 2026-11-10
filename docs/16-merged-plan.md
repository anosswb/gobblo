# 16 — Merged plan: 20 days of design (11 → 30 Nov 2026)

Written 2026-11-10 by the lead session. **Plan only. Nothing is built until Anass says OK.**

This plan joins two views:
- **Review A** (`private/gobblo-review-2026-11-09.md`): freeze, simplify, turn money on, ship.
- **Plan B** (`docs/15-lead-plan.md`): redesign and unslop. Most of it is already built.

And it adds everything from Anass's feedback of 10 Nov (12 points, all below).

**The goal:** when the store accounts open (about 1 Dec, Anass decides), the app looks premium, has its own character, earns on both platforms, and tells us what real users do.

**The rule for these 20 days:** *freeze features, open design.* We only do the 12 points below. No new tools, no new tabs, no simulated panels.

---

## 1. What I checked in the code (short)

| Point | What is true today | Where |
|---|---|---|
| Home bites | Home shows **all** of today's bites. There is no "show more". | `src/screens/home/index.tsx` (`shown = list`) |
| Swipe | A bite row is a swipe row: full swipe left = remove. That is why a scroll can delete. | `src/screens/home/bite-row.tsx` |
| Long-press | Long-press (0.22 s) already means "drag to feed". The new focus mode must share this gesture. | `src/screens/home/feed-drag.tsx` |
| Dark bubbles | Three big soft glows are drawn behind every screen. In dark they are white at 5%. | `src/components/backdrop.tsx`, `glowA` in `src/theme/tokens.ts` |
| Petting | "Pet me" lives in Toolkit › Calm. After you lift your finger the pet just keeps the love face. It never asks for more. Before the first stroke it shows a "curious" face. The Home pet can't be petted. | `src/screens/tools/calm.tsx` |
| Timer bug | Home sends a top banner "You started. +1 ✦" 0.45 s after the timer opens. The banner sits on the close and sound buttons. | `src/screens/home/index.tsx:673`, `src/screens/spin/index.tsx:69` |
| Ads bug | See section 4. Most likely the consent step fails, and the app hides the real error. | `src/lib/ads.android.ts` |
| Smart icons | 27 rules, about 300 words (English, French, some Spanish). | `src/features/bites/bite-icon.ts` |
| Support email | The personal Gmail is in the app and in 3 legal pages. | `src/config/app.ts`, `legal/*.md` |
| CI | The last "iOS compile check" on GitHub **failed** (10 Nov). One push runs about 30 Linux minutes + up to 33 macOS minutes. | `.github/workflows/` |
| AdMob IDs | The real IDs are saved in the repo (`src/config/ad-ids.json`). They are not secret (they ship inside the app), but the rule is "keys in env vars", so they move. | `src/config/ad-ids.json` |

Not checked: nothing here was tried on a real phone by me. Sounds were not heard on a device.

---

## 2. Where A and B disagree, and my choice

| Topic | A says | B says | My choice | Why (1 line) |
|---|---|---|---|---|
| New work | Freeze everything | Redesign | **Freeze features, open design** | Design is what makes people install and stay; new features are what delayed us. |
| Analytics | Store dashboards are enough | (nothing) | **PostHog + Sentry, anonymous** | Stores can't show where people quit, and a buyer wants return numbers. |
| Android ads | Turn money on | No ads at launch | **Rewarded ads on at launch, also in the Closet** | Ads are the only Android income from Morocco; rewarded videos don't annoy. |
| Launch money | Money live at launch | Free first, pay in 1.1 | **Money code 100% ready on 30 Nov; switch on when accounts open** | No account is needed to get ready; the switch is one flag. |
| Light mode | Neutral | Warm paper tint | **5 colour themes, user picks** | Anass's call; a theme choice also feels premium and personal. |
| Toolkit | Cut to 2–3 tools | 4 tools | **Keep the 4 as they are** | Anass loves this page; it is already small. |
| Weekly hats/rooms | Broke the freeze | Build them | **Keep them, add no more; they become shop items** | They are built, and sparks need things to buy. |
| The pet | Needs a real design pass | "The pet is good" | **New mascot** | The pet is the brand and the video star; today it is a generic blob. |
| Simulated panels | Never again | No 4th panel | **None. 5 real people in days 16–20** | Both agree. Real people cost nothing with a test APK. |
| Store accounts | Buy this week | Start the Google test now | **Wait for Anass (about 1 Dec)** | His decision. We don't ask again. |
| Price | Test $7.99–9.99 | $4.99, one Plus | **Stay at $4.99 for now, decide with real users** | No real data yet; not a job for these 20 days. |

---

## 3. The 12 points: what we will do

### 1. Colour themes (5 palettes, each light + dark)

- A new setting: **Settings › Look › Theme**. A row of 5 round swatches with a live preview. It replaces the old "accent colour".
- Light / Dark / System stays as a second choice. So: 5 themes × 2 modes = 10 looks.
- All 5 are free. Extra palettes later (Anass may send more) become things to buy with sparks or Plus.

| # | Name (working) | From | Light | Dark |
|---|---|---|---|---|
| 1 | **Ink** (default) | P1 | white `#ffffff`, text ink `#00171f`, main button deep blue `#003459` | near-black with a blue tint, light-blue button |
| 2 | **Blush** | P2 | background `#f7edf0`, cards `#f4cbc6` tint, button `#f4afab` with dark text | deep plum-brown, blush button |
| 3 | **Cotton** | P3 | white, pink `#ffcad4` + light blue `#b0d0d3` as the two soft colours | deep teal-grey, pink button |
| 4 | **Sage** (my idea) | new | soft off-white, sage green, forest-green button | deep green-black, sage button |
| 5 | **Graphite** (my idea) | today's look | pure white, black button, one small accent | pure black, white button |

- Why Ink is the default: it is the most neutral for men and women and fixes "white and yellow".
- Pastels (P2, P3) can't carry white text. So pastel buttons use dark text. The button **shape and feel stay the same** (point 4).
- Every colour still comes from theme tokens. A test checks text contrast (AA) for all 10 looks.
- The pet keeps its own colour, chosen by the user.
- Exact dark values are tuned on screen, then Anass picks from side-by-side pictures.

**Done when:** all 10 looks pass the contrast test; Home, Focus, Closet, Toolkit, Settings are screenshotted in all 10; Anass says yes to each palette.

### 2. Pure dark mode

- Remove the glowing bubbles in dark (and in light: a clean flat background with a very soft top-to-bottom tone).
- Depth comes from card edges and soft shadows, not from light blobs.
- Dark background per theme is near-black with a tiny tint of the theme, never grey-blue fog.

**Done when:** no glow is drawn in dark on any screen; before/after pictures approved by Anass.

### 3. New mascot + app icon (the brand)

The character must work in 3 places: tiny (app icon, 60 px), in the app (drawn in code, animated), and in AI videos (same character every time).

**How we design it (5 steps):**
1. **Character bible** (lead writes, day 1–2): who Gobblo is in 5 lines (hungry, loyal, a bit dramatic, never judges), and the design rules:
   - **It is a cute animal** (Anass, 10 Nov): not a blob, not a cat or a dog (those split people), with a real link to ADHD, loved by everyone. Options and the pick are in "3b" below. No art is made before Anass chooses.
   - **One signature feature** that is ours (for the otter: its lucky pebble, shaped like our spark ✦, and its pocket).
   - **Silhouette test:** filled in black, you must still know it is Gobblo.
   - **3 simple shapes max**, so I can draw it in code and animate it.
   - **2 body colours + 1 mouth colour.** It must look right on all 5 themes.
   - No copy check list: not an owl, not a bean (Focus Friend), not a bird (Finch), not a round pink puff, not a slime drop, not a crewmate shape. I also compare with Screenrove's logo search.
2. **3 directions** (lead, day 2): 3 written briefs + ready prompts for Google Flow. Each with the same 4 pictures: front, 3/4 view, mouth open, tiny icon.
3. **Anass makes the pictures in Flow** (day 2–4) and picks 1. One round of fixes.
4. **Model sheet for videos** (day 5–8), so every AI video shows the same character:
   - Turnaround: front, 3/4, side, back.
   - 12 faces: happy, hungry, chomping, full, proud, sleepy, curious, love, shocked, focused, cheeky, calm.
   - 8 poses: waving, eating a task, sitting at a desk, sleeping, jumping, pointing, holding a phone, peeking from the edge.
   - Rules page: colours, sizes, what it never does (never sad at the user, never angry).
5. **Rebuild in the app** (day 9–13): the new shape in the code rig (`src/pet/pet.tsx`), all moods, hats still fit. Then the **app icon**: the face with the open mouth on the Ink blue, made for iOS and Android (adaptive + themed), plus splash and widgets.

**Done when:** Anass picks the direction; the model sheet is in `assets/brand/`; the app shows the new pet in every mood; the icon is in the build; a note in `assets/brand/RIGHTS.md` says how each picture was made (a buyer will ask).

### 3b. Which animal (Anass chooses; added 10 Nov)

| Animal | Link to ADHD | Why everyone likes it | Look, in 1 line | How it eats a bite |
|---|---|---|---|---|
| **Otter** (my pick) | Real otters juggle pebbles (a fidget), play all day, then nap hard, and keep one favourite rock in a skin pocket | Almost nobody dislikes otters; they hold hands when they sleep | Round cream face, big cheeks, tiny ears, and a star-shaped lucky pebble | Floats on its back, puts the bite on its belly, taps it with the pebble, chomp |
| **Red panda** | Short bursts of energy, long naps, gets surprised and throws its arms up | "Like a panda", but rarer and softer | Rust-orange, white face mask, big striped tail it hugs | Holds the bite in two paws and nibbles fast, tail wagging |
| **Raccoon** | Curious about everything, collects shiny things, most awake at night | Gen Z already loves it ("trash panda" memes) | Soft grey, dark eye mask, busy little hands | Washes the bite with its hands first, then gobbles |
| **Squirrel** | Hides snacks and forgets where; gets distracted fast | Cute, known everywhere | Huge fluffy tail, cheeks that puff up | Stuffs bites in its cheeks; cheeks grow as you feed |
| **Quokka** | Curious, walks up to everything, always "on" | Called the happiest animal; the smile is built in | Small, round, brown, with a permanent smile | Holds the bite like a leaf and munches, smiling |

Risks, honestly: red panda is close to a web browser logo and a film character; raccoon can read as a thief or a pest; "squirrel!" is an ADHD joke that some people find mocking; few people know what a quokka is.

**Why the otter:** the pebble is a true fidget story, the pocket is where it keeps your bites, and our spark ✦ becomes its pebble, so the money, the icon and the character are one idea. Before any art, I check the stores for other otter mascots in to-do and focus apps.

### 4. Keep what Anass loves

Not touched: the **button shapes and press feel**, the **Toolkit tab layout**, the **new icons** (little colour). The theme work only changes colour tokens. I show before/after pictures of these three so nothing is lost by accident.

### 5. Home: 3 bites, then "Show more"

- Home shows the first **3** bites (2 on a very small phone). Under them one soft row: **"Show 4 more"**. Tap = the rest slide in. Tap again = "Show less".
- A new bite always appears on top, so you see it land.
- "Do first" bites and bites with a time today stay in the first 3.
- One-thing mode is unchanged (1 bite).

**Done when:** with 8 bites, 3 are visible with the pet on a 375×812 screen; a test covers the order rules.

### 6. Long-press focus mode (no more accident deletes)

- **Swipe on the list is removed.** Scrolling can never delete.
- **Long-press a bite** (about 0.35 s): a soft tap in the hand, the bite lifts and glows in the theme colour, everything else blurs and dims.
- Under the lifted bite, a small menu: **Start · Do first · Later · Remove** (Remove is last and red).
- In this mode you can also swipe the lifted bite left to remove it. Remove always shows **Undo**.
- **Drag-to-feed stays:** if you keep holding and move toward the pet, the bite follows your finger, as today. One gesture, two results: hold still = menu, hold and drag = feed.
- Tap outside = close. Android back button = close.
- Reduce Motion: no lift, just a fade and the menu. Android phones where blur is slow: dim only.

**Done when:** a fast scroll over 20 bites never opens anything (tested on Anass's phone); drag-to-feed still works; screen reader users get the same 4 actions.

### 7. Petting

What happens today: in Toolkit › Calm › Pet me, the pet looks "curious" until you stroke, then keeps the love face forever. Lifting the finger does nothing. That is why it can feel flat or wrong.

New behaviour, always loving:
1. **While you pet:** eyes close, soft purr in the hand, hearts (as today).
2. **You lift your finger:** a happy little shiver and a sigh, one line: "Mmm. Thank you."
3. **After 2–3 seconds:** it opens one eye, leans toward where your finger was, and asks: "Again?" Hopeful face, never sad, never hurt, no guilt.
4. If you don't pet again, after 6 seconds it settles into a calm, sleepy smile. No more asking.
- The same petting also works on the **Home pet** (stroke it, it purrs). A tap still opens the speech bubble.

**Done when:** Anass tries it on his phone and says it feels loving; no sad or hurt face exists in this flow; Reduce Motion version works.

### 8. Sounds

**Breathing**
- A real, soft human breath: in through the nose, out through the mouth. Calm, close, clean.
- Source: **CC0** recordings from Freesound, found through Openverse (same way as before). I prepare **3 candidates**; Anass picks by ear.
- Each breath is cut and shaped to fit 4 s in and 4 / 6 / 8 s out. The soft tone we have now stays very quietly under it, so the breath never sounds dry.
- Setting on the Breathe page: **Breath · Tone · Off**.
- We do not copy any other app's audio.

**Ambient**
- "Soft keys" is redone from a softer recording: slower typing, high sounds cut, peaks pressed down, about 6 dB quieter.
- All ambient sounds are set to the same calm level, and the default volume goes down.
- The set (6): **soft rain** (keep), **soft keys** (redo), **brown noise** (keep), and 3 new: **ocean waves**, **fireplace**, **cat-like purr** (it fits the pet). 3 free, 3 as spark items (point 11).
- All CC0, every file listed in `assets/sounds/CREDITS.md` with its link.

**The three tools Anass found** (licences checked on the web on 10 Nov; I did not open each LICENSE file):

| Tool | Licence | Use for the app's sounds? | Use for marketing videos? |
|---|---|---|---|
| **Hyperframes** (HeyGen) | Code: Apache 2.0 (free, commercial OK). Its sound effects come from Openverse and some need credit (CC BY). The terms of HeyGen's music catalog are not clear. | **No.** Only CC0 goes inside the app. | **Yes** for making the videos. For music, use TikTok's own commercial music or CC0. |
| **Remotion** (+ its agent skills) | Free for one person or a company of up to 3 people. Bigger companies pay. | Not a sound source. | **Yes** (Anass is one person). If the app is sold, the buyer needs their own licence. |
| **OpenMontage** | AGPL v3 (strong copyleft). | No. | **Yes as a tool** to make videos. Never put its code inside the app. |

My pick for videos: **Hyperframes** first (free with no limits), Remotion as plan B.

**Done when:** Anass hears all sounds on his phone and says OK; every file has a CC0 line in the credits; the loudness test file lists each level.

### 9. Smarter bite icons

- From 27 rules to about **45**. New groups: school subjects, creative (draw, music, video, photo), social (friend, family, birthday, gift), home fixes, plants, sleep, self-care, prayer/meditation, admin papers, gaming, kids, trash, charging/phone care.
- New icons where needed, in the same calm icon style (point 4).
- **Traits:** besides the icon, the words also guess size (exists) and a soft tint group (body, home, work, people, mind) used only as a tiny dot, not a rainbow.
- Better matching: verbs first ("call mum about rent" = phone, not money), common typos, Arabic-in-Latin words Anass's users write (Darija basics), more French and Spanish.
- A test file with **150 real examples** → the icon each must give.

**Done when:** the 150-example test passes; Anass types 20 of his own bites and at least 17 get a good icon.

### 10. Ads bug: "No video right now"

What I know from the code:
- Test ad IDs **are** used correctly in test builds. That is not the bug.
- Every problem (no library, no consent, no internet, slow load, load error) shows the same text: "No video right now." So the app hides the real reason.

Most likely causes, in order:
1. **Consent step fails.** The build now uses your real AdMob **app** ID. Before any ad, the app asks Google's consent service. If no consent message is published in AdMob for this app, Google answers with an error, and our code stops there. **Fix on your side: step 3 in section 6. Fix in code: don't stop when Google says consent is not required or can't be read outside Europe.**
2. **Old APK.** If the APK on the phone was built before the ads commit (10 Nov), the ads library is not inside it.
3. **Slow or no load in 15 s** (weak network, emulator without Google Play).

What we will do:
- Show the **real reason** as a small code under the message, in test builds only.
- Load the video when the page opens, not on the tap, so "Watch" is instant.
- One retry before saying no.
- Then test on Anass's phone with a fresh APK.

**Done when:** on Anass's phone a test video plays and gives sparks, 3 times in a row.

### 11. Fable A's open points

**a. Android earns too little → a small spark shop + the video in the Closet**
- The video offer also appears in the **Closet**, on a locked item: "20 ✦ short. Watch a video · +15 ✦". This is where people want sparks.
- The offer **stays after** everything is unlocked. Sparks now buy: missed weekly hats and rooms, the 3 extra sounds, future colour themes, food looks.
- Still max 3 videos a day, still only when the person taps. Never in onboarding, Focus, Feed, Evolution or Brain dump.
- iPhone: same shop, sparks come from focus only, no ads. Plus unlocks everything at once.

**b. Make the repo private**
- Do it on **day 16**, after two things are ready, or the app links break and the free minutes run out:
  1. **Legal pages move.** GitHub Pages does not work on a private repo with a free account. The privacy and terms pages go to a tiny separate public repo (`gobblo-legal`), and later to gobblo.app.
  2. **Builds go on a diet.** A private repo gets about 2,000 free minutes a month, and a macOS minute counts as 10. Today one push can use about 360. New rule: Android preview build only when I ask for it (button), the iOS check only by hand before a release, tests on every push (2 minutes).
- Also: remove old plans with private details from history if needed (I check first and tell you).

**c. New icon + new support email** → points 3 and section 6.

**d. Timer bug** → "You started. +1 ✦" becomes a line **inside** the timer screen, under the ring. No banner over the buttons.

**Also found:** the iOS compile check on GitHub fails since 10 Nov. Fix on day 1.

### 12. Analytics (PostHog) and crashes (Sentry)

**What we track (anonymous):** a random install ID, never a name or email.
- App opened, session length, first screen seen, country (from the network, then the IP is thrown away).
- Screens opened (name only). Feature used: add bite, start timer (length), feed, brain dump, each tool, closet buy, theme picked, video watched, Plus page seen / bought.
- Onboarding step reached (shows where people quit).
- PostHog then gives: users per day, day 1 / 7 / 30 return, most-used features, quit points.

**What we never send:** the text of a bite, reminder text, pet name, anything typed. Auto-capture and screen recording are **off**. A test fails the build if an event carries free text.

**User control:** Settings › Privacy & data › **"Share anonymous usage"** (on by default, one tap off). One honest line on the last onboarding screen says it.
- Note for Europe: some lawyers want a "yes" before analytics. If you want the safest way, we make it **off by default in the EU**. My advice: start with on + clear switch, PostHog hosted in the EU.

**Sentry:** crashes and errors only, no personal data, no typed text.

**Pages and forms to change (lead writes the text, Anass pastes the store forms in December):**
- `legal/privacy.md`: new section "Anonymous usage and crash data" (what, why, who: PostHog EU and Sentry, how to turn off).
- FAQ: "Does my data stay on my phone?" → "Your bites and everything you type stay on your phone. Gobblo sends anonymous counts and crash reports. You can turn it off."
- Settings › About: the same line.
- Google Play **Data safety**: App activity (app interactions) + App info and performance (crash logs, diagnostics) + Device or other IDs. Collected, not shared for ads by us, not linked to identity, user can opt out. (AdMob's own answers stay as in docs/17.)
- App Store **privacy label**: Usage Data (product interaction) + Diagnostics (crash data), "not linked to you", "not used for tracking". No tracking pop-up needed.
- **CLAUDE.md rule** "All data stays on the device" needs one new sentence. Only Anass can OK that change. Proposed text: "User content stays on the device. Anonymous usage counts (PostHog) and crash reports (Sentry) are sent, with a switch to turn them off."

**Done when:** events show in PostHog from Anass's phone; a forced test crash shows in Sentry; the "no free text" test passes; the switch really stops sending.

---

## 4. Things Anass needs to get

**No money needed now, except the domain (optional, your timing).** No Apple or Google developer account here.
Keys never go in the repo. You paste them in **GitHub › repo › Settings › Secrets and variables › Actions › New repository secret**, or send them to me in chat and I tell you where they go. Button names can change a little on these sites.

### 4.1 Support email (free, 5 minutes) — day 1
1. Go to accounts.google.com › **Create account** › **For work or my business**.
2. Name: Gobblo. Address idea: `hello.gobblo@gmail.com` (pick any free one).
3. Turn on 2-step verification: **Security › 2-Step Verification**.
4. Tell me the address. I put it in the app and the legal pages.
5. Use this email for all the accounts below. Then, if you sell the app, you hand over one mailbox.
Later, with the domain: `hello@gobblo.app` can forward to it for free.

### 4.2 PostHog (free) — by day 10
1. Go to posthog.com › **Get started - free**.
2. Choose **EU Cloud**. Sign up with the support email.
3. Organisation name: Gobblo. When it asks what to set up, pick **Product analytics** only. Skip the install steps.
4. Open **Settings › Project › General**. Copy the **Project API key** (starts with `phc_`).
5. In the same settings, turn on **Discard client IP data**.
6. Give me the key. It goes in the secret `EXPO_PUBLIC_POSTHOG_KEY`.
Free plan: 1 million events a month. Enough for a long time.

### 4.3 Sentry (free) — by day 10
1. Go to sentry.io › **Get started** › sign up with the support email. Choose the **EU** data region if asked.
2. **Create project** › platform **React Native** › name `gobblo` › **Create project**.
3. Copy the **DSN** (a long link starting with `https://`). It goes in `EXPO_PUBLIC_SENTRY_DSN`.
4. **Settings › Developer settings › Organization tokens › Create new token.** Copy it. It goes in `SENTRY_AUTH_TOKEN`. This one is secret: never paste it in a file.
Free plan: 5,000 errors a month.

### 4.4 AdMob (you already have the account and the app) — by day 3
1. admob.google.com › **Privacy & messaging** › **European regulations** › **Create message**.
2. Select the app **Gobblo** › keep the default text › **Publish**. (This is the likely fix for "No video".)
3. **Settings › Test devices › Add test device** › name "Anass phone" › Android › paste your phone's advertising ID (phone: **Settings › Google › Ads**). This lets you tap real ads safely later.
4. **Apps › Gobblo › Ad units › Add ad unit › Rewarded** › name "Closet treat" › **Create**. Copy the ad unit ID and send it to me.
5. I move all AdMob IDs out of the repo into build variables.

### 4.5 Pictures of the new mascot (Google Flow, as before) — days 2 to 8
1. I give you 3 prompt sets in `docs/10-image-prompts.md` (day 2).
2. You make 4 pictures per direction in Flow and save them in `assets/flow/otter/`.
3. You pick one. I ask for one round of fixes, then the model sheet (turnaround, 12 faces, 8 poses).

### 4.6 Your ears and your phone — days 6, 10, 15, 18
- I send a test APK link. You install it and try a short list (5 minutes each time).
- Days 16–20: give the APK to **5 real people**. Watch them 5 minutes without helping. Write where they stop.

### 4.7 Social names (free) — any day
Take `@gobblo` (or `@gobblo.app`, `@getgobblo`) on TikTok, Instagram and YouTube with the support email.

### 4.8 More palettes (optional) — by day 2
If you want other colours than the 5 in point 1, send the hex codes by day 2.

### 4.9 gobblo.app (optional, costs about $15 a year, only when you decide)
1. Any registrar (Cloudflare, Namecheap, Porkbun) › search `gobblo.app` › buy 1 year, auto-renew on, with the support email.
2. Tell me. I move the legal pages there and set up `hello@gobblo.app`.
Not needed for the 20 days. The legal pages work without it.

### 4.10 Make the repo private — day 16, after I say "ready"
1. github.com/anosswb/gobblo › **Settings** › scroll to **Danger Zone**.
2. **Change repository visibility** › **Change to private** › confirm.

---

## 5. The order of work

> **Update 10 Nov (Anass):** no calendar. We work straight through, as fast as the usage limit allows. The "Days" and "Dates" columns below only show the **order**. Jobs that touch different files run at the same time.

**Who does what**
- **Lead (Fable, medium effort):** designs, writes the exact spec for each job, reviews screenshots, talks to Anass. No long coding.
- **Opus helper (medium):** the hard builds: theme engine, long-press gesture, new pet rig, analytics wiring.
- **Sonnet helper (medium):** tests, word lists, contrast checks, copy, docs, CI files, Maestro flow, screenshots.
- **Anass:** accounts, Flow pictures, ears, phone, yes/no.

**Every job ends the same way:** types, lint and tests pass · seen in light and dark at 375 pt · one commit · no push without Anass.

| Days | Dates | Job | Who | Done when |
|---|---|---|---|---|
| 1 | 11 Nov | Fix iOS check on GitHub. Timer banner bug (11d). Ads: show the real error + preload (10). | Sonnet; lead reviews | CI green; banner gone; error code visible in test build |
| 1–2 | 11–12 | Mascot bible + 3 directions + Flow prompts (3). Palette values for 10 looks (1). | Lead | Prompts in docs/10; palette picture sent to Anass |
| 2–4 | 12–14 | Theme engine: 5 themes × light/dark, picker in Settings, contrast test. Pure dark, no glows (1, 2). | Opus builds; Sonnet tests + screenshots | 10 looks pass AA; Anass OKs the pictures |
| 3 | 13 | Ads test on Anass's phone after the AdMob message (10). | Anass + lead | Test video plays 3 times |
| 4–5 | 14–15 | Home: 3 bites + "Show more" (5). | Sonnet | Test for order rules; picture at 375 pt |
| 5 | 15 | **Check-in 1:** APK to Anass: themes, dark, Home, timer, ads. | Lead | Anass's list of fixes |
| 6–8 | 16–18 | Long-press focus mode, swipe removed, drag-to-feed kept (6). | Opus builds; lead tunes the feel | Fast scroll never deletes on the phone |
| 6–8 | 16–18 | Sounds: 3 breath candidates, soft keys redo, 3 new ambients, levels (8). | Sonnet finds + processes; lead listens; Anass picks | Credits file complete; Anass OK by ear |
| 8–9 | 18–19 | Petting on Calm and Home (7). | Opus | Anass: "feels loving" |
| 9–10 | 19–20 | Smart icons: 45 rules, 150-example test (9). | Sonnet; lead writes the categories | 150 tests pass; 17 of 20 of Anass's bites right |
| 10 | 20 | **Check-in 2:** APK: long-press, petting, sounds, icons. | Lead | Anass's list of fixes |
| 9–13 | 19–23 | New mascot in the app: rig, moods, hats fit (3). | Lead designs shapes; Opus builds | Every mood drawn; hats sit right |
| 12–13 | 22–23 | App icon, splash, widgets with the new face (3, 11c). | Sonnet from lead's drawing | Icon in the build on Anass's phone |
| 11–13 | 21–23 | PostHog + Sentry, switch, "no free text" test (12). | Opus wires; Sonnet tests | Events and a test crash arrive |
| 13–14 | 23–24 | Privacy page, FAQ, About, store-form answers written (12). New support email everywhere (11c). | Sonnet writes; lead checks | No personal Gmail left in app or legal pages |
| 14–15 | 24–25 | Spark shop + video in the Closet, video stays after unlock (11a). | Opus; lead sets prices | A video in the Closet gives sparks; shop has ≥ 12 items |
| 15 | 25 | **Check-in 3:** APK: new pet, icon, shop, analytics. | Lead | Anass's list of fixes |
| 16 | 26 | Legal pages move; CI diet; **repo goes private** (11b). | Sonnet; Anass clicks | Links in the app still open; a push uses < 5 minutes |
| 16–17 | 26–27 | Maestro test for the core loop. Docs 02 and 11 rewritten to the real design | Sonnet | Flow passes on the Android build |
| 16–19 | 26–29 | 5 real people try the APK. Fix what stops them. | Anass + lead | 5 notes written; top 3 problems fixed |
| 18–19 | 28–29 | Video kit: mascot model sheet + 5 short scripts + a Hyperframes starter (3, 8). | Lead writes; Sonnet sets up | One 10-second test video rendered |
| 20 | 30 | **Design freeze.** Full check (`/release-check`), final APK, list for December (accounts, store forms, money switch). | Lead + Sonnet | All checks green; hand-over note in PROGRESS.md |

If we run late, these wait first (in this order): video kit, docs rewrite, extra ambient sounds. These never wait: themes, mascot, long-press, ads fix, analytics.

---

## 6. What this plan does not do

- No Apple or Google developer accounts, no store upload, no real purchases. That starts when Anass says.
- No new tools, tabs or settings beyond the 12 points.
- No simulated panels.
- No audio, art, text or code copied from another app or brand.
- No French or Spanish app text yet (still the best 1.1 feature).

## 7. Decisions I need from Anass

1. **OK to start?** If you say "OK", I take yes on all below.
2. Themes: the 5 in point 1 (Ink default, + Blush, Cotton, Sage, Graphite), all free?
3. Mascot: **otter, chosen by Anass (10 Nov).** Bible in `docs/18-mascot-bible.md`, Flow prompts in `docs/10` round 3. Open: which style (A toy, B flat, C clay). The rest of the plan is approved.
4. Long-press: hold still = menu, hold and drag = feed, list swipe removed?
5. Analytics: on by default with a clear off switch, PostHog in the EU? And OK to change the CLAUDE.md sentence about data?
6. Spark shop on both platforms, video offer in the Closet on Android?
7. Repo private on day 16?

## Sources (web, 10 Nov 2026)
- Hyperframes: https://github.com/heygen-com/hyperframes · https://developers.heygen.com/hyperframes-heygen
- OpenMontage: https://github.com/calesthio/OpenMontage
- Remotion licence: https://remotion.dev/license · https://www.remotion.dev/docs/license/faq
- GitHub Actions minutes: https://docs.github.com/en/billing/concepts/product-billing/github-actions
