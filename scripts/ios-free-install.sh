#!/bin/bash
# Gobblo on a friend's iPhone with a FREE Apple ID (no $99 account).
# Run on a Mac with Xcode (Apple Silicon or Intel that runs the current Xcode):
#   bash scripts/ios-free-install.sh
# Then follow the steps it prints. Free apps run for 7 days; plug in and press Run again after.
# The widget + Live Activity need the paid Apple Developer account, so they are left out here.
set -e
cd "$(dirname "$0")/.."

say() { printf "\n\033[1;35m▶ %s\033[0m\n" "$1"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1. $2"; exit 1; }; }

need xcodebuild "Install Xcode from the App Store, open it once, accept the license."
need node "Install Homebrew (brew.sh), then: brew install node"
need pod "Run: brew install cocoapods"
xcodebuild -version

export APP_FREE_SIGNING=1
export APP_IOS_BUNDLE_ID="${APP_IOS_BUNDLE_ID:-app.gobblo.free.$(whoami | tr -cd 'a-z0-9')}"
say "Bundle id: $APP_IOS_BUNDLE_ID (must be unique for a free Apple ID)"

say "Installing packages (2–5 min)"
npm ci

say "Creating the iOS project (3–10 min)"
npx expo prebuild --platform ios --clean

say "Opening Xcode"
open ios/*.xcworkspace

cat <<'STEPS'

──────────── In Xcode (one time) ────────────
1. Xcode › Settings › Accounts › +  › Apple ID › sign in (any free Apple ID).
2. Left side: click the blue project icon "Gobblo" › TARGETS: Gobblo › "Signing & Capabilities".
3. Tick "Automatically manage signing", Team: "<your name> (Personal Team)".
4. Plug the iPhone in with a cable, unlock it, tap "Trust This Computer".
5. Top bar: choose the iPhone as the run destination.
6. Product › Scheme › Edit Scheme… › Run › Build Configuration: Release  (works without this Mac).
7. Press ▶ (Run). First build takes 5–15 min.

──────────── On the iPhone (one time) ────────────
• If it says "Developer Mode required": Settings › Privacy & Security › Developer Mode › On › restart.
• If it says "Untrusted Developer": Settings › General › VPN & Device Management › your Apple ID › Trust.
Then open Gobblo. It works for 7 days; to renew, plug in and press ▶ again.
STEPS
