# Reference screens (Screenrove, saved 2026-11-06)

36 screens from Screenrove (`search_screens`, `get_flow`, `find_related_screens`). Images: `<id>.jpg` in this folder. Page for each: `https://screenrove.com/<product>/...` (see the id).
**Important:** Screenrove captures are **desktop web (1440×900)**, not phone screens. We use them for patterns, flow order, states and copy structure, not for mobile layout. Mobile layout comes from our prototype + mobile-app-ui-design rules.
Never copy their art, text or logos.

## Onboarding (Duolingo flow, captured 2026-09-24)
| id | what we take |
|---|---|
| duolingo-home | one hero illustration + one primary CTA + a quiet "I already have…" secondary. Our hook = jelly pet + "hatch my nomling" |
| duolingo-course | big tappable tiles; we skip this step (one product) |
| duolingo-source | mascot + speech bubble top-left asking the question; CONTINUE disabled until a pick |
| duolingo-motivation | **the bubble reacts to each answer** → our quiz: pet replies to each struggle chip |
| duolingo-level | single-column rows with a growing icon; pet reply per pick |
| duolingo-daily-goal | goal rows with a concrete outcome ("50 words in your first week") → our "2 min a day = …" line. Notification ask comes right after, as a soft card |
| duolingo-placement | two big choice cards with icons |
| duolingo-first-exercise | **value before account**: first lesson with no sign-up → our first bite before anything else |
| duolingo-profile-prompt | "create profile / later" only AFTER the first win (we have no accounts, so we use this slot for the notification ask) |
| duolingo-signup-age | not needed (no accounts) |

## Home / daily loop
| id | what we take |
|---|---|
| duolingo-product-learn | one clear path + status pills (streak, gems) in the header |
| duolingo-product-lesson-start | popover from the node with a single START → our bite tap → start sheet |
| habitify-product-habit-detail | stats card layout for Me |
| habitify-first-habit | first item appears with a success state |
| twos-today-empty | "a fresh new day" empty Today with a calm prompt |
| ticktick-pomodoro-running | big ring + mm:ss + one Pause; plain. We beat it with the pet, "ends at" time and a donut being eaten |
| ticktick-pomodoro-paused | paused state copy |
| clockify-tracker-empty | "let's start" empty timer state |

## Empty states
| id | what we take |
|---|---|
| habitify-journal-empty | illustration + one line + one CTA |
| ticktick-habit-empty / ticktick-list-empty | small illustration, short copy, add button in reach |
| wanderlog-home-empty | warm illustrated empty home |

## Celebrations / peaks
| id | what we take |
|---|---|
| duolingo-product-lesson-complete | single centred illustration, big title, **2 stat cards** (XP + accuracy), one CONTINUE → our feed result: "+3 ✦" and "12 min focused" cards |
| duolingo-product-correct / incorrect | full-width footer banner that recolours the button. We never show "incorrect": drift is "it's ok" |
| duolingo-product-streak | big number celebration. **We do NOT copy streaks** (shame). We use "comeback days" that never reset |
| bolt-survey-done, napkin-onboarding-done, evernote-setup-done | reward headline states the payout first ("+1 ✦, that was the hard part") |

## Paywalls (for docs/09)
| id | what we take / avoid |
|---|---|
| duolingo-marketing-super | benefit-led hero, mascot carries the upsell |
| anydo-product-premium | 6 icon benefits + plan list + testimonial. **Avoid:** "most popular 50 % off" pressure, trial with auto-renew (our users hate billing surprises) |
| ticktick-product-upgrade | feature comparison rows |
| twos-product-upsell | soft upsell inside the app, closable |
| hevy-product-trainer | locked feature preview with a clear "what you get" |
| raindrop-product-pro | simple one-plan card |

## Settings
| id | what we take |
|---|---|
| todoist-product-settings | theme picker as visual swatches |
| ticktick-product-settings-appearance | System / Light / Dark segmented choice |

## Screenrove checks done in research
- `get_flow duolingo` (10 steps), `get_design duolingo product` (palette, type, "juicy" 4 px lip buttons, 16 px radius).
- `compare_screens duolingo-motivation` vs our quiz.
- `check_my_ui` on our 7-step onboarding → closest: Duolingo source/daily-goal, Preply topics chips, Linear profile. Ours is shorter (7 vs 10 screens) and has no account step.
- `find_related_screens duolingo-product-lesson-complete` → Todoist all-set, Evernote, Napkin, Bolt reward.
