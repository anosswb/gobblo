# 20 — Builds on GitHub (simple guide)

Why this page exists: when the repo becomes private, GitHub gives a free account about **2,000 minutes a month**. Mac minutes count **10 times**. So we only build when we ask for it.

## What runs by itself on every push

| Workflow | What it does | Time | Cost |
|---|---|---|---|
| **Checks** (`checks.yml`) | types, lint, tests | about 3 to 5 min | small, Linux |
| **Legal pages** (`legal-pages.yml`) | updates the privacy and terms pages, only when `legal/` changes | under 1 min | tiny |

A newer push cancels the older Checks run.

## What runs only when you ask

| Workflow | When | Time |
|---|---|---|
| **Android preview build** (the test APK you install) | button, or a tag `apk-...` | about 20 min |
| **Android dev build** (dev client) | button only | about 12 min |
| **iOS compile check** | button only | about 33 min on Mac = about 330 minutes of your quota. Use it rarely. |

## How to get a new test APK

Option 1, with the button:
1. Open the repo on GitHub, tab **Actions**.
2. Click **Android preview build** on the left.
3. Click **Run workflow**, then the green **Run workflow** button.
4. Wait about 20 minutes. Open the finished run.
5. At the bottom, in **Artifacts**, download **gobblo-preview-apk**. Unzip it, install the APK on your phone. It stays for 14 days.

Option 2, what the lead does (same result):
`git tag apk-2026-11-12 && git push --tags`
Use a new tag name each time.

## Before the repo becomes private (two things)

1. **Legal pages.** GitHub Pages stops working for a free-plan private repo, so the privacy and terms links would break. First move `legal/` to a small public repo `gobblo-legal` (or to gobblo.app), then change `privacy` and `terms` in `src/config/app.ts`. Keep `legal-pages.yml` until the move is done, then remove it from this repo.
2. **Secrets.** Add the three secrets (names and steps in `docs/19-analytics.md`, "GitHub secrets"): `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`. Without them the build works, but analytics and crash reports are off.

Not done yet: these two moves are only documented here.
