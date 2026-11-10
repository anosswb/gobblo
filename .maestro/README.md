# Maestro tests

One flow for now: `core-loop.yaml` (onboarding → Home → 2-minute focus → feed).

Install Maestro once (needs Java, already on this Mac):

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Run it with an Android emulator or phone connected and the app installed (the preview or dev build):

```bash
maestro test .maestro/core-loop.yaml
```

Run it before every store build (`/release-check`). Not run yet on a device: the first run may need small text fixes.
