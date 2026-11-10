# 06 — Money plan

## Decision (from Anass)
- **Android (Google Play): ads only**, with Google AdMob. Google Play doesn't support merchant accounts in Morocco (official table: Morocco ✔ developer, ✘ merchant: https://support.google.com/googleplay/android-developer/answer/9306917), so there are no in-app purchases on Android.
- **iOS (App Store): one-time "Plus" purchase**, with no ads (keeps iOS clean and avoids the ATT tracking prompt). Before building the paywall, check in App Store Connect > Business that Morocco is in the bank country list. If it isn't, iOS can use the same ad setup as Android.
- Code: `src/config/monetization.ts`
```ts
export const MONETIZATION = Platform.select({ ios: 'iap', android: 'ads' }) as 'iap' | 'ads';
```

## Getting paid from AdMob in Morocco
- Payouts are monthly, around the 21st, once your balance passes the payment threshold. The first $10 of earnings triggers address/PIN checks (https://support.google.com/admob/answer/3001017).
- Morocco is listed for **EFT (bank transfer) in Moroccan dirham**, test deposit required (https://support.google.com/adsense/answer/1714398). You need a local bank account in your own name.
- Known issue: some Moroccan AdSense payments were delayed in Dec 2025. Bank Al-Maghrib said nothing blocks them, and if one is late you should file a complaint with the transaction's SWIFT code (https://en.bladi.net/google-adsense-delayed-what-bank-maghrib-recommends-doing,118798.html). Keep your payment receipts.

## Ad design for Android (money without killing the app)
The core feeling (start → feed → confetti) is the product. Ads must never touch it.

**1. Rewarded ads (main income, users choose them)**
- "watch a short ad → +5 ✦" (max 3 per day)
- "try this hat for 24 h" (cosmetic rental)
- "double the sparks for this bite" (offered on the feed result card, AFTER the celebration ends)
- Always optional, always clearly labeled "watch ad", and the reward is given only in the `EARNED_REWARD` callback.

**2. One small banner** (optional, test it): only on the Closet and Me screens, at the bottom above the tab bar, with clear spacing from buttons (no accidental clicks).

**3. Interstitials: avoid in v1.** If ever tested: max 1 per 3 sessions, only when leaving the Spin result, never after the 2-minute start, never in onboarding.

**Never:** ads in onboarding, Focus, the feed animation, the evolution screen, or the brain dump. No ads that pop up while someone is starting a task (that's the user we're protecting).

## iOS Plus (one-time)
"Gobblo Plus" lifetime non-consumable (test $5.99–$7.99): extra pet species and colors, premium hats and backgrounds, extra focus sounds, later widgets and the Live Activity timer. Use RevenueCat (`react-native-purchases` + `react-native-purchases-ui`). Join the App Store Small Business Program (15% commission). No subscription in v1, because reviewers of competitors complain most about paywalls and billing (docs/07).
On Android, the same cosmetics are earned with sparks + rewarded ads, so both stores feel fair.

## Costs to start
Apple Developer $99/year · Google Play $25 once · Expo free tier · RevenueCat free tier for small apps (check current pricing) · AdMob free.

_Not financial or legal advice._
