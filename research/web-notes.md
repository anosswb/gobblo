# Web notes (research phase, 2026-11-06)

## screenrove.com
Pages read: home, /page-types, /motion, /motion/sonner-toast-stack, /agents.
- 191 products, ~6,950 screens, 191 design guides.
- Page types we need: Onboarding (412), Empty states (443), Paywalls (433), Settings (395), Dashboards (304), Detail views (278).
- Duolingo is covered. Finch: not confirmed on the site (check with `search_screens` / `list_products`). Close apps listed: Habitify, Todoist, TickTick, Any.do, Superlist, Twos, Hevy.
- Motion: 165 interactions. All the ones we want exist: toast stack (Sonner), drawer + background scale (Vaul), sliding number, like burst, reorder list, tabs, segmented control, live activity, hold to confirm, swipe deck, odometer.
- Toast stack numbers (from source): enter 400 ms ease, Y 100%→0 + fade · stack lift 14 px, scale −0.05 per toast, max 3 visible · auto-hide 4 s, paused on press · swipe dismiss at 45 px or 0.11 px/ms, exit 200 ms ease-out · reduce motion = 150 ms fade.
- MCP: free, no key, 24 tools (search_screens, get_screen_image, get_flow, get_design, compare_screens, find_related_screens, search_motion, get_motion, get_motion_guidelines, suggest_polish, check_my_ui, build_recipe, build_handoff, compare_pricing…).

## transitions.dev
Pages read: home, /library, /skill, two detail pages. The code panels load with JS, so the numbers are not in the static pages. **The installed skill has them** (`~/.claude/skills/transitions-dev/*.md`, 35 recipes + `_root.css`), and they match `reference/design-refs/transitions-dev-tokens.css`:
- duration: stagger 40 · micro 80 · quick 150 · fast 250 · medium 350 · slow 400 · very-slow 500 ms
- ease: smooth-out (0.22,1,0.36,1) · bounce (0.34,1.36,0.64,1) · bounce-strong (0.34,3.85,0.64,1)
- Rules: animate only transform / opacity / blur; never `all`; reduce motion removes movement, blur and scale but keeps the end state; tooltip = delayed in, instant out.
- Recipes useful for us: number pop-in, notification badge, text swap, modal, panel reveal, page side-by-side, icon swap, success check, error shake, skeleton reveal, tabs sliding, toast, like button (particles), spinning counter, toggle, banner stacking, donut chart (timer ring!).
- Pro-only (we can't use them): confetti burst, drag & drop with physics, spinner-to-check. We build our own confetti in Skia.

## deck.gallery
Blocked for automated reading (HTTP 403). So the RevenueCat report was read directly on revenuecat.com (web preview of the 2026 and 2025 editions, not the full PDFs). Brand-guideline decks: opened the site in Chrome. The home page lists decks (SPACE10 Brand Guidelines 2022, Widelab Brand Guidelines, Howden Brand Guidelines 2023, RevenueCat State of Subscription Apps 2025), but opening a deck asks you to "Join deck.gallery" (an account). I don't create accounts, so docs/brand.md will be written from our own art direction (docs/11) plus a standard brand-guide structure: voice, logo/icon rules, colour, type, mascot rules, illustration rules, motion, do/don't.

## RevenueCat — State of Subscription Apps 2026 (+2025)
Caveat: the report covers **subscription** apps. Lifetime-only apps are outside its sample. "[S]" = from a summary of the page, lower confidence.
- Download → paid by day 35: median 2.0 % overall [S]; **Health & Fitness 2.9 %**, top quartile > 6.2 % [S]. Developers based in Western Europe 2.0 %, Latin America 1.5 %.
- **Hard paywall 10.7 % vs freemium 2.1 %** (D35, 2026). But refunds are higher with hard paywalls (5.8 % vs 3.4 %, 2025 [S]), and year-1 retention is about the same. → We stay freemium (hard rule + our users hate paywalls). We just make Plus desirable.
- **Timing: ~50 % of conversions happen on day 0** (one section of the page says one-third). 19 % come at week 6 or later [S]. → Our paywall can't be in onboarding. We show a soft "meet the Plus friends" card **after the first feed** (day 0, after value) and in Closet. Never blocking.
- Lifetime: ~1 in 4 apps offer subscription + lifetime (23 %). No lifetime price data. → A one-time Plus is unusual enough to be a selling point ("no subscription").
- Prices: Health & Fitness monthly median $9.99, yearly $20–45 [S]. → $6.99 launch / $9.99 later for lifetime is under one month of a competitor's plan. Strong value framing.
- Region: "MEA" (Middle East + Africa) is the only region with negative MRR growth (−9.7 %), and 63.5 % of its conversions happen on day 0 [S]. → For Moroccan/MENA users, Android ads are the right model.
- Refunds: Health & Fitness 4.7 % (2025 [S]). A one-time purchase with a clear "what you get" lowers refund risk.
