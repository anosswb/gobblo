# 05 — Store rules (App Store + Google Play)

Builds don't get rejected for the code. They get rejected for the stuff around it. Go through this list before every submission. Sources at the bottom (checked Nov 2026; re-check the official pages before submitting).

## Apple App Store
| rule | what we do |
|---|---|
| 4.2 Minimum functionality | Fully native screens, real features (timer, dump, spin, evolution). No WebView wrapper. |
| 4.3 Spam / copycat | Original name, art, copy. Don't name competitors anywhere (listing, keywords, release notes). |
| 3.1.1 In-App Purchase | Anything digital (Plus, cosmetics) is sold only through Apple IAP (RevenueCat uses StoreKit). No links or text pointing to buying elsewhere. "Restore Purchases" in the paywall and in Settings. |
| 3.1.2 Subscriptions (if we ever add one) | Clear price per period, what you get, auto-renew terms, Terms of Use (EULA) + Privacy links on the paywall and in the listing. Easy "manage subscription" link (opens the system page). |
| 5.1.1 Privacy | Privacy policy link in the app (Settings > About) and in App Store Connect. No accounts in v1, so no account-deletion requirement. If accounts are added later, in-app deletion is mandatory. |
| Privacy manifest | `PrivacyInfo.xcprivacy` must declare required-reason APIs (e.g. UserDefaults/MMKV file timestamps). Expo generates it from `ios.privacyManifests` in app config. Check the final build, including third-party SDKs (RevenueCat ships its own). |
| App Privacy labels | iOS has no ads: likely "Purchases" (via RevenueCat) and "Crash data" (if a crash reporter is on). Everything else: not collected. Must match reality. |
| 1.4.1 / 5.1.3 health | No medical claims. Don't say it diagnoses, treats or improves ADHD. "Made for ADHD brains" is OK. Settings shows "not a medical device". |
| Age rating | Answer the updated questionnaire honestly (new 13+/16+/18+ tiers exist since 2025–26). Expected: low rating, has in-app purchases. |
| Kids | v1 is NOT in the Kids Category and has no kid mode (avoids parental gates and extra rules). Revisit for the Family mode. |
| Notifications | Ask permission only after explaining the value (soft pre-prompt). The app works fully without it. |
| Rating prompt | Only `SKStoreReviewController` (expo-store-review). No custom "rate 5 stars" screens, no rewards for reviews. |
| Metadata | Screenshots show the real app. No "Android" anywhere (an indie dev on Reddit was rejected just for writing "Android" in release notes). No prices in screenshots. |
| Review notes | Explain: no login needed, how to reach the paywall (Closet > Plus), and that IAP products are attached to the version. |

## Google Play
| rule | what we do |
|---|---|
| New personal account testing | Closed test with **at least 12 testers opted in for the last 14 days in a row** before you can apply for production. Plan this early (see docs/08). |
| Target API level | Use the SDK 58 default (current Play requirement). Never lower it. |
| Data safety form | Must be filled even if no data is collected. Must match the privacy policy and the SDKs (crash reporter). |
| Health apps declaration | Fill it in. Say it's a productivity / habit app with no health data and no medical features. |
| Target audience & content | Choose 13+ age groups (no under-13 in v1, which keeps us out of the Families policy). Content rating questionnaire (IARC): honest answers. |
| Payments | Android has **no purchases** (merchant accounts not supported in Morocco, see docs/06). Money comes from AdMob ads. |
| Ads declaration | Play Console > App content > Ads: **"Yes, my app contains ads"** (the store shows a "Contains ads" label). |
| Ads policy | No ads that appear unexpectedly or block using the app, none placed next to buttons where they get tapped by accident, interstitials only at natural breaks (we skip them in v1), rewarded ads always opt-in with a clear reward. Never click your own ads; use Google's test ad units and register your test devices. |
| Advertising ID | AdMob adds the `com.google.android.gms.permission.AD_ID` permission; declare advertising ID use in the Play Console. |
| Consent (GDPR/UK) | Show Google's UMP consent form where required (EEA/UK) before loading ads. Add "Privacy options" in Settings so users can change consent. |
| Data safety with ads | Declare what the AdMob SDK collects/shares (device or other IDs, app interactions, diagnostics) and that it's for advertising/analytics. Follow Google's current AdMob Data safety guidance. |
| Permissions | Only POST_NOTIFICATIONS (Android 13+, runtime ask) + vibrate. Exact alarms aren't needed: an inexact local notification is fine. |
| Developer verification | Google is rolling out developer identity verification. Keep the ID and contact details in Play Console accurate and verified. |

## Privacy policy + terms
Host two simple pages (GitHub Pages / Notion public page / your site): `privacy` and `terms`. Templates are in `docs/templates/`. Fill in the real email and name. This is not legal advice. If real money starts coming in, have a lawyer look at them.

## Pre-submit checklist
- [ ] `npx expo-doctor` clean, `tsc` clean, tests green, `/replica-test` flows pass
- [ ] Light + dark screenshots of every screen reviewed
- [ ] Privacy + terms URLs live and linked in the app and the store
- [ ] Privacy manifest / labels / data safety all say the same thing
- [ ] No "Android" in iOS metadata, no competitor names, no medical claims
- [ ] IAP products created, "Ready to Submit", attached to the version (iOS)
- [ ] Restore Purchases tested with a sandbox account (iOS)
- [ ] Android: real ad unit IDs only in production, UMP consent works (test with debug geography EEA), "Contains ads" + advertising ID + Data safety declared, no ad on forbidden screens
- [ ] Notifications respect the nudge level and quiet hours
- [ ] Rating prompt can't appear in the first session
- [ ] `listing.py` (replica-launch) passes on `store/listing.json`

Sources: https://developer.apple.com/app-store/review/guidelines/ · https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk · https://developer.apple.com/news/upcoming-requirements/?id=07242025a · https://support.google.com/googleplay/android-developer/answer/14151465 · https://support.google.com/googleplay/android-developer/answer/10787469 · https://support.google.com/googleplay/android-developer/answer/14738291 · https://support.google.com/googleplay/android-developer/answer/9893335
