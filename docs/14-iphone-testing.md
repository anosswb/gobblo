# 14 — Test Gobblo on a friend's iPhone

Two ways. Way A is free and works today. Way B needs the paid Apple account ($99/year) and no Mac.

## Way A: free, today (friend's Mac + cable, about 1 hour)

You need: your friend's MacBook Air M4, a cable for the iPhone, any free Apple ID.
The app works for 7 days, then you plug in again and press Run. Widgets and the lock-screen timer
are left out (Apple only allows them with the paid account).

**On the Mac:**
1. Update macOS: Apple menu › System Settings › General › Software Update. Install everything.
   (The newest Xcode needs a recent macOS. macOS 26.4 may be too old.)
2. Open the App Store, search **Xcode**, press Get (it's free and large, so this can take a while). Open it once and accept.
3. Install Homebrew: open Terminal, paste the line from brew.sh, press Enter, then follow what it says.
4. In Terminal:
   ```bash
   brew install node cocoapods
   ```
5. Download the app code:
   ```bash
   cd ~/Desktop && git clone https://github.com/anosswb/gobblo.git && cd gobblo
   ```
6. Run the helper (it builds the iPhone project and opens Xcode):
   ```bash
   bash scripts/ios-free-install.sh
   ```
7. Follow the steps it prints: sign in with the Apple ID in Xcode, pick "Personal Team", plug in the
   iPhone, choose it at the top, set Run to **Release**, press ▶.

**On the iPhone:**
- "Developer Mode required" → Settings › Privacy & Security › Developer Mode › On › restart.
- "Untrusted Developer" → Settings › General › VPN & Device Management › your Apple ID › Trust.

## Way B: TestFlight (after paying Apple, no Mac needed)

1. Pay the Apple Developer Program ($99/year) at developer.apple.com/programs and wait for approval.
2. Tell Claude. Claude runs the iPhone build in the cloud (EAS) and sends it to App Store Connect.
   You log in once with your Apple ID in the terminal when it asks (with the 6-digit code).
3. In App Store Connect › your app › TestFlight › External testing: make a group, add the build,
   turn on **Public link**. Apple checks the first build (usually within a day).
4. Your friend installs **TestFlight** from the App Store and opens the link. Done.
   Each new build reaches them automatically. Widgets and the lock-screen timer work here.
   Builds last 90 days.
