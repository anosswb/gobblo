# START HERE — Gobblo app kit

This kit is everything Claude Code needs to build your app for **iPhone + Android** with Expo.
Name: **Gobblo** (chosen 2026-11-06, see DECISIONS.md).

---

## Step 1 — Set up your Mac (once)
Open **Terminal** and paste these one by one:

```bash
# 1. Node (if `node -v` shows nothing or a version below 20, install it from nodejs.org first)
node -v

# 2. Expo / EAS tools
npm install -g eas-cli
eas login            # create a free account at expo.dev first

# 3. Make the project folder and put this kit inside it
mkdir -p ~/Projects/gobblo && cd ~/Projects/gobblo
#   -> copy ALL files from this kit into ~/Projects/gobblo (CLAUDE.md must be at the top level)

# 4. Expo plugin for Claude Code (official Expo Skills + Expo MCP server)
claude plugin install expo@claude-plugins-official
#    then inside Claude Code type /mcp and sign in to your Expo account

# 5. Screenrove MCP (real app screens + motion for Claude)
claude mcp add --transport http --scope user screenrove https://screenrove.com/mcp

# 6. Skills
npx skills add Jakubantalik/transitions.dev
npx skills add ceorkm/mobile-app-ui-design
```

Then start Claude Code inside the folder:
```bash
cd ~/Projects/gobblo && claude
```
And inside Claude Code, install the replica skills (the Entrepreneur and friends):
```
/plugin marketplace add Jakeschincariol/replica-skill
/plugin install replica-skill@replica-skill
```

## Step 2 — Make the images
Open `docs/10-image-prompts.md`, paste the prompt block into Flow Automator, and save the images in `assets/flow/` with their IDs as names. You can do this while Claude Code does its research phase.

## Step 3 — Paste MASTER_PROMPT.md into Claude Code
Open `MASTER_PROMPT.md`, copy everything inside the box, and paste it into Claude Code. It plans and builds phase by phase, and stops after each phase so you can test on your phone.

If you ever want to push it phase by phase yourself, use these:

**Phase 1 — Foundation**
```
Read CLAUDE.md and every file in docs/. Open reference/prototype.html to understand the feel. Then create the Expo SDK 58 app in this folder (TypeScript, expo-router, New Architecture), install the libraries from docs/04 with npx expo install, set up the theme system (light/dark/system) from docs/02, fonts, Phosphor icons, the tab bar with the raised dump button, MMKV storage with migrations, and eas.json with development/preview/production profiles. Make a development build for my phone and tell me exactly how to install it. Stop and give me a short summary.
```

**Phase 2 — The pet**
```
Build the mascot from docs/02 and docs/03 with react-native-svg + Reanimated: idle breathing, body morph, blinking, eyes that follow my finger, squish on tap, hungry/eating/happy/sleepy moods, 4 colors, 4 evolution stages, all accessories. Make a /dev/pet screen where I can test every mood and hat. Use Screenrove get_motion_guidelines and suggest_polish. Check light and dark.
```

**Phase 3 — Onboarding + Home + Brain dump**
```
Build onboarding (hook, quiz, egg + name, soft notification ask, the 3-tap hatch with flash and confetti), Home (time-of-day sky, bites list with reorder/swipe, drag-to-feed onto the pet) and the Brain dump screen with the parser + unit tests. Look at Duolingo's onboarding with Screenrove get_flow first. Follow docs/01 exactly. Run check_my_ui on each screen in light and dark.
```

**Phase 4 — Focus + Feed + Spin + Evolution**
```
Build the start sheet (2/15/25 + chop), the Focus body-double screen (wall-clock timer, donut ring, brown noise, keep awake, end notification, 2-min "keep going" card, drift, leave confirm), the full Feed sequence with haptics and sounds, the Evolution screen, and the Spin wheel with haptic ticks. Rebuild the matching transitions.dev recipes in Reanimated as described in docs/03.
```

**Phase 5 — Closet, Me, Settings, Nudges, Polish**
```
Build Closet, Me (stats, brain card share image), Settings (theme, sound, haptics, nudge level, backup export/import, reset, about with privacy/terms links and "not a medical device"), the nudge scheduler with caps and quiet hours, and the rating-prompt rule. Then do a full polish pass: reduce motion, small screens, Android back button, accessibility labels, 60fps check. Run /replica-test on all flows and fix every S1/S2 bug.
```

**Phase 6 — Money (iPhone only) + store prep**
```
Follow docs/06: iOS = RevenueCat with a non-consumable "plus_lifetime" and a paywall that follows docs/05 (price, what you get, restore, terms, privacy), never in onboarding. Android = AdMob rewarded ads with UMP consent, daily caps and test IDs in dev, only on the allowed screens. Write store/listing.json from docs/08 and lint it with replica-launch listing.py. Make the privacy + terms pages from docs/templates as a tiny static site I can host free on GitHub Pages. Generate the app icon (light, dark, tinted, Android adaptive + monochrome) and splash. Walk me step by step through App Store Connect and Play Console setup, then build preview versions for TestFlight and the Google Play closed test.
```

**Phase 7 — Launch**
```
Go through the pre-submit checklist in docs/05 item by item and show me the result. Then help me submit to the App Store, and once Google's 12 testers × 14 days is done, to Google Play production.
```

## Things only YOU can do (Claude Code will tell you when)
- Pay and sign up: Apple Developer ($99/yr), Google Play ($25), Expo (free), RevenueCat (free), AdMob (free, with your Moroccan bank account for payouts).
- Sign Apple's Paid Apps Agreement + add bank/tax info (check that Morocco is in the bank list, see docs/06).
- Find 12 real Android testers and keep them for 14 days (start at Phase 5).
- Record the TikToks 🙂

## Money, in short
iPhone: free app + a one-time "Plus" purchase. Android: free with AdMob ads (mostly optional "watch to earn" videos), paid by bank transfer in dirhams.
