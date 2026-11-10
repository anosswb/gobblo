# 17 — Money setup: where your IDs go

Written 2026-11-10. The money code is wired. Today it shows **Google's test ads**, so nothing can go wrong while we test. It has **not** run on a phone yet: it needs a new build (two new native libraries).

## What exists today

- **Android:** one optional video card on the Plus page: "Treat {pet}? Watch a video · +15 ✦". The person chooses. Max 3 a day. No banners, no pop-ups, nothing in onboarding, Focus, Feed or Brain dump.
- **iPhone:** one purchase, "Plus", through RevenueCat. Hidden until you test a real purchase.
- **Rating prompt:** after the 3rd fed bite and 2 days, once per version.

## 1. Add your AdMob IDs (Android)

1. Open admob.google.com › **Apps › Add app** › Android › "Not listed yet" › name it Gobblo.
2. Copy the **App ID** (looks like `ca-app-pub-123…~456…`).
3. In that app: **Ad units › Add ad unit › Rewarded** › name "Treat" › Create. Copy the **Ad unit ID** (looks like `ca-app-pub-123…/789…`).
4. Send me the two IDs in chat, or paste them yourself in `src/config/ad-ids.json`:
   - `android.appId` = the App ID
   - `android.rewardedId` = the Ad unit ID
5. Real ads show **only in the store build**. The dev app and the test APK always show test ads. This protects you: tapping your own real ads can close an AdMob account.

## 2. Control the ads (you, the owner)

File `src/config/ads.ts`:
- `enabled` — `false` hides every video offer.
- `rewardSparks` — sparks for one video (15).
- `maxPerDay` — videos per day (3).

The user also has a switch: **Settings › Privacy & data › Bonus video offers**.

## 3. Ads on iPhone ("Apple ads")

Today iPhone has **no ads** (project rule: iPhone earns with Plus). The place for the IDs exists (`ios.appId`, `ios.rewardedId` in the same file), but ads on iPhone are **off**, because turning them on changes three things:
1. The App Store privacy label goes from "almost nothing collected" to "data used for advertising".
2. iPhone shows the "Allow tracking?" pop-up.
3. On iPhone sparks buy nothing (Plus is bought with money), so "+5 ✦" has no use there yet.

If you still want them, tell me and choose the reward (for example: one video = try a Plus hat for a day). Then I remove one line in `package.json` (`expo.autolinking.ios.exclude`), set `ios: true` in `src/config/ads.ts`, and update the rule in CLAUDE.md with your OK.

## 4. iPhone purchase (after the Apple account, about 1 December)

1. App Store Connect › your app › **In-App Purchases › +** › **Non-Consumable** › product ID `plus` › price $4.99.
2. revenuecat.com › new project › add the App Store app › **Entitlements › + › `plus`** › attach the product › **Offerings › default** › add one package with that product.
3. RevenueCat › **API keys** › copy the **public iOS key** (starts with `appl_`). Give it to me: it goes in the build variable `EXPO_PUBLIC_RC_IOS_KEY`.
4. I make a test build. You buy Plus with a sandbox account, delete the app, reinstall, tap **Restore purchases**.
5. Only when both work: I set `EXPO_PUBLIC_PURCHASES_LIVE=1` and Plus appears on iPhone.

## 5. Store answers

- Google Play: "Contains ads" = **Yes**. "Advertising ID" = **Yes**.
- App Store: no ads. In-app purchase: yes (one).
