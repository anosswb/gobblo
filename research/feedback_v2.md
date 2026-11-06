# Feedback run 2 (2026-11-06): Google Play, Goblin Tools, Hacker News

Made with the replica-entrepreneur `reviews.py` and `research/themes_adhd_v2.json` (run-1 themes + 13 new ones found by reading the new rows by hand). Raw rows: `research/reviews_v2.csv` (new rows only). Run 1 is unchanged in `research/feedback.md` / `research/reviews.csv`.

## Sample (new rows)
| source | rows | dates | how collected |
|---|---|---|---|
| google-play-finch (com.finch.finch) | 220 | 2024-11 → 2026-11-05 | read in the browser: 20 "most relevant" + 200 newest, US English |
| google-play-tiimo (com.tiimo.androidappreactnative) | 195 | 2026-05 → 2026-11-03 | same: 20 relevant + 175 newest |
| google-play-structured (io.unorderly.structured) | 180 | 2023-11 → 2026-10-17 | same: 20 relevant + 160 newest (low review volume on Play) |
| google-play-goblin (com.goblintools) | 140 | 2023-05 → 2026-10-13 | same: 20 relevant + 120 newest |
| app-store-goblin (id6449003064) | 200 | 2025-01 → 2026-11-01 | Apple customer-reviews RSS, 4 newest pages |
| hacker-news | 226 | 2021 → 2026 | HN Algolia API, comments that literally contain "goblin tools", "body doubling", "task paralysis" or Finch + ADHD |
| **total** | **1,161** | | 935 store reviews with stars + 226 unrated forum comments |

**Reddit: NOT collected.** r/ADHD, r/ADHDers and r/adhdwomen could not be reached by any allowed route: the browser tool blocks reddit.com, Reddit's public JSON API now redirects to login (needs an OAuth app tied to an account), and web search refuses the domain. Per the skill's rule ("if a source cannot be reached, say so and move on"), no Reddit quotes are used anywhere. Hacker News was added as the forum source instead; it skews to developers and many comments are founders promoting tools, so it is used only for the "unsolved" list, never for the hate ranking.

Ratings in the 935 new store rows (Play + Goblin App Store): 146×1★, 69×2★, 98×3★, 115×4★, 507×5★. 29 short duplicate texts ("love it") were removed by the tool.

Below: (A) new store rows only, (B) run 1 + run 2 store rows combined (1,504 reviews, the ranking docs/07 now uses), (C) Hacker News only (all themes thin: one source, no stars).

---

# (A) New store reviews only (Google Play ×4 + Goblin Tools App Store)

### (A) report

906 reviews from 5 sources (app-store-goblin, google-play-finch, google-play-goblin, google-play-structured, google-play-tiimo). 906 had star ratings.
29 duplicate reviews removed.

### What they hate

| rank | theme | score | reviews | share | avg stars | sources |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Bugs and crashes | 64.5 | 105 | 12% | 2.5 | 5 |
| 2 | Price and paywalls | 60.7 | 109 | 12% | 2.9 | 5 |
| 3 | Sync, calendar and widgets | 44.7 | 95 | 10% | 3.2 | 5 |
| 4 | Reminders and notifications | 27.3 | 57 | 6% | 3.0 | 5 |
| 5 | Notifications and spam | 27.2 | 56 | 6% | 3.0 | 5 |
| 6 | Sync and lost data | 25.2 | 50 | 6% | 2.8 | 5 |
| 7 | Billing, cancelling and refunds | 19.5 | 25 | 3% | 1.6 | 5 |
| 8 | Android feels second-class (missing features, broken sync/notifications) | 17.4 | 36 | 4% | 2.8 | 4 |
| 9 | AI that gets it wrong or costs more effort | 16.0 | 27 | 3% | 2.8 | 4 |
| 10 | Paid once, then asked to pay again (switch to subscription) | 14.1 | 18 | 2% | 2.0 | 4 |
| 11 | Basic features paywalled (recurring tasks, subtasks, reminders) | 11.9 | 20 | 2% | 2.6 | 4 |
| 12 | Lost everything (lists, pet, streak) after an update or logout | 11.7 | 14 | 2% | 1.6 | 5 |
| 13 | A redesign or update made it worse | 10.5 | 13 | 1% | 1.9 | 5 |
| 14 | Ads | 9.8 | 21 | 2% | 3.3 | 5 |
| 15 | Too complicated / overwhelming setup | 8.9 | 37 | 4% | 4.3 | 5 |
| 16 | Confusing or clunky to use | 7.4 | 17 | 2% | 3.5 | 4 |
| 17 | Login and account problems | 5.9 | 9 | 1% | 2.3 | 5 |
| 18 | Support that does not answer | 5.7 | 7 | 1% | 1.6 | 5 |
| 19 | Novelty wears off / forget to open it | 5.5 | 10 | 1% | 2.9 | 4 |
| 20 | Reminders too weak to work (wants louder / nagging) | 5.2 | 8 | 1% | 1.8 | 2 |
| 21 | Asks for a rating before you have used it (thin) | 5.2 | 6 | 1% | 1.7 | 1 |
| 22 | Slow, laggy, heavy | 4.9 | 12 | 1% | 3.5 | 5 |
| 23 | Guilt, streaks and shame | 4.5 | 9 | 1% | 3.4 | 4 |
| 24 | Just a website in an app shell | 4.0 | 8 | 1% | 3.4 | 4 |
| 25 | Timers and time blindness | 3.4 | 8 | 1% | 3.6 | 4 |
| 26 | Paywall only after a long setup / quiz | 3.1 | 4 | 0% | 2.0 | 2 |
| 27 | Too gamified / grind / ad partnerships in a paid app | 3.0 | 4 | 0% | 2.2 | 2 |
| 28 | Privacy and permissions | 1.1 | 4 | 0% | 4.5 | 3 |
| 29 | Easy to tick without doing it (no real start) (thin) | 1.0 | 2 | 0% | 3.5 | 1 |
| 30 | Feels childish / not for adults (thin) | 0.2 | 1 | 0% | 5.0 | 1 |

**Bugs and crashes**
- "CRASH!" (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13699384497
- "Crashes." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13689420828
- "App Crashes." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13728902887

**Price and paywalls**
- "Subscription Model." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-14462715725
- "It's basically paywalled." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=43e70987-14df-499b-aa95-ed52d5361ea0
- "Canceling my subscription." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=6a2e0e74-66db-4f21-8990-5d3e24b4e924

**Sync, calendar and widgets**
- "Please refine the widget." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=08a796e7-b02e-4222-b28e-7ced6e1ed06d
- "Now the app has stopped syncing." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a67c7e00-225a-450e-84d9-76620ff7bf9d
- "Can't sync data between Android and iOS." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=7217971f-4d2c-4378-ad8c-2751bb6d56a6

**Reminders and notifications**
- "Notifications!" (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=6a2e0e74-66db-4f21-8990-5d3e24b4e924
- "Constantly correcting it, and telling it where to put reminders." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a67c7e00-225a-450e-84d9-76620ff7bf9d
- "lame every morning it sends you a notification saying rise and shine - for absolutely nothing." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=79aed3cf-363a-4f36-aa3f-b47670e1dbd8

**Notifications and spam**
- "Notifications!" (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=6a2e0e74-66db-4f21-8990-5d3e24b4e924
- "Constantly correcting it, and telling it where to put reminders." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a67c7e00-225a-450e-84d9-76620ff7bf9d
- "lame every morning it sends you a notification saying rise and shine - for absolutely nothing." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=79aed3cf-363a-4f36-aa3f-b47670e1dbd8

**Sync and lost data**
- "Now the app has stopped syncing." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a67c7e00-225a-450e-84d9-76620ff7bf9d
- "Can't sync data between Android and iOS." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=7217971f-4d2c-4378-ad8c-2751bb6d56a6
- "I didn't get my badge and I lost my money too." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=d4f45c89-3e3a-4c5d-9d2d-30521f3c6c2f

### What they ask for

| rank | theme | score | reviews | share | avg stars | sources |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Customisation and control | 26.1 | 64 | 7% | 3.4 | 5 |
| 2 | Platforms, offline and mobile | 22.2 | 48 | 5% | 3.1 | 4 |
| 3 | Integrations, import and export | 9.1 | 17 | 2% | 2.9 | 4 |
| 4 | Teams and sharing | 4.5 | 16 | 2% | 4.4 | 5 |
| 5 | Readability: font size, dyslexia, dark mode | 2.0 | 4 | 0% | 3.0 | 3 |

**Customisation and control**
- "Setting a task to be every 2 days ends up with random 3 day gaps." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=ff190a50-7db0-459f-9737-6bd80cfc4118
- "setting up one off instances but have to pay to set up recurring items" (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=93b7a7db-6813-4c8e-9a2a-f71c3c07e0fa
- "appearance should be able to customize according to user choice of color." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=60c75700-5c59-4f87-b81f-eee14938ff1f

**Platforms, offline and mobile**
- "Android version do not have AI assistant." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=7217971f-4d2c-4378-ad8c-2751bb6d56a6
- "couldn't get the promised refund when they stopped supporting android." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=07b77216-1b28-4c3f-8bbb-83d7a13f0b6c
- "Android app is missing key functions which are shown on the app description." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=607c45a8-af1a-4b1e-ad3b-811209e446c6

**Integrations, import and export**
- "Will NOT synch with tasks created in Google Calendar." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=78d8d5d2-86e3-4a28-b790-d3b5d787ad5a
- "Let down by the subscription service of things that used to be free, the Todoist import finally works so I guess there’s that." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-14462715725
- "Not being able to sync the two up, and not being able to integrate any other app suite makes this literally useless on android." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=021c80c4-a986-4dc7-a15d-847f5abf8c00

**Teams and sharing**
- "It seems that your team knows NOTHING about marketing." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=430c953b-3499-4a81-8be5-53556d484f33
- "Please also provide a way to collaborate lists." (app-store-goblin, 3*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13044719822
- "Option to collaborate with family so they can add tasks 2 routine would be awesome!" (google-play-goblin, 3*) https://play.google.com/store/apps/details?id=com.goblintools&reviewId=ab37a448-804a-4906-9aa8-4b720585e676

**Readability: font size, dyslexia, dark mode**
- "I CANNOT use this app at night :( it's actually been so helpful, but no dark mode makes it incredibly difficult to log things at night or use the app when I first get up." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=2400d159-76ea-4a96-b502-abfb2f628dc2
- "While a lot of the tools can be helpful the interface isn't dyslexic friendly which a lot of people with neurodivergence have." (google-play-goblin, 2*) https://play.google.com/store/apps/details?id=com.goblintools&reviewId=36cafc39-31ce-4ca1-8487-356fa4455463
- "If you could also give an option to increase the text and font size of the items in the widget, that will be very useful." (google-play-structured, 4*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=ddb88e76-bf47-4a13-9393-6a8450531b8c

### Asked for in their own words

- "I also can't add any new goals because it moves everything around." (google-play-finch, 3*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=fd5cda34-0ee6-447f-8e19-e464f61c8270
- "I wish it had more to keep you engaged." (google-play-finch, 4*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=64ecfb58-13f6-4416-a083-25c1f49754cc
- "Whether you need an app that rewards you for just getting out of bed, or each chore done, or breathing exercises for each time of day (stressed or not)..." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=ec4f4a3a-378a-4745-9a48-5677117d9b3b
- "I wish I could afford the Finch Plus." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=a3f3051b-4462-4a12-80ee-23d8a66a8bf0
- "I'm missing goals because of this and it's really frustrating and disheartening." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=2400d159-76ea-4a96-b502-abfb2f628dc2
- "I wish there was a bit more motivation for after your finch returns from their daily adventure, but the app is still great." (google-play-finch, 4*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=25626272-4522-4e1e-8316-071a465c8421
- "Since I no longer need the variable shift accommodation, I'm looking for a different app." (google-play-finch, 3*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=d3684d74-065d-4951-817b-37ff11a75bf5
- "Even if I can't find the motivation to do what I need to do, the bright colors and visuals make it all worthwhile." (google-play-finch, 3*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=c0b41f67-1882-4392-b9b5-4b8343715274
- "i use this as every day as i can, its kept me from missing vital things!" (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=bf6f7502-2a8a-4e11-98fe-06f632272090
- "There are a few things thay I feel are missing: - The capacity to "duplicate" a goal (mainly for easiness to create one within the same category ir that it is similar) - To be able to download an Excel with all the progr..." (google-play-finch, 4*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=cd1b39a9-e5f9-4e65-afcc-9812333c040c
- "You can't set weekly goals without picking a day, which means they're not weekly their daily." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=96c0c16f-abb9-4f02-b291-467b2c51e26b
- "it helps me keep routine, manage chores with my husband (whats been done/needs to be)." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=7b652fb2-f0df-490f-84e0-b9e5bfbb6f69
- "I wish it was not an AI self care by pet game." (google-play-finch, 3*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=b9c75ad3-e839-4720-bd54-f30f93f040a9
- "...that you could press near the top and like pick that day to look at or others to look back at, I feel like it would be good for myself for reflection and to see trends in my days, and this would probably be good for othe..." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=122704ad-a804-407a-811b-a6b180dde4b4
- "The things locked behind a subscription are nice to have, but when I can't afford it I don't feel like I'm missing out too much, so it's still worth trying even if you can't afford a subscription right now." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=1f44b43a-f6e1-4eb9-9e0e-865411aa2af1
- "if your lying to yourself about completing goals than there is something else you need to work on before SIMPLY adjusting habits which is what the app is for..." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=7fd4307a-96b9-413f-ab25-481c741e7cd0
- "I wish this didn't happen with the micro pets at least :(" (google-play-finch, 2*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=f718151d-1df8-4a88-ae0d-c2842da677cf
- "PLEASE ADD DARK MODE!" (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=d7d3da56-5927-4243-b98a-ea42e0a37f8e
- "I wish I could play games on this app too but it's great otherwise" (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=5cbabb19-22b8-4126-bf79-9f34ce8a2cb1
- "quirky, fun, productive for those that need a little push." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=6fb79d21-4ef2-440e-ba2f-289fc085d44e
- "this needs to change." (google-play-finch, 2*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=55a6e002-4a79-4916-8927-9fcd38ae13ee
- "It's a neat game-of-sorts, but there needs to be a way to change the Finch's opinions about the things she discovers." (google-play-finch, 3*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=41e46ca1-2453-4fbe-87b1-d076f344d675
- "When an app is good, you don't need a whole minute-long ad to explain why you should use it." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=430c953b-3499-4a81-8be5-53556d484f33
- "I wish we could do little quests in here, like little mini games, and spend more time in the first few days." (google-play-finch, 5*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=18b9c62a-b1e5-4698-9ca3-e0a05d20b6da
- "Now I can't even find months (only Monday to Sunday), I've tried making lists but I've failed, as I can't delete things on the list." (google-play-tiimo, 3*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=eda856c8-5ff3-43d9-8098-8e3011a1d6aa

### Read these by hand

Low ratings that matched no theme. Either noise, or a theme themes.json does not have yet. Often the most useful part.

- (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=96c0c16f-abb9-4f02-b291-467b2c51e26b: "You can't set weekly goals without picking a day, which means they're not weekly their daily. I'm a self-employed contractor and freelancer and most of my work doesn't require a specific day. I really enjoy just doing it"
- (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=a579b868-c371-4344-a6e8-97535641b1f4: "it's stupid and doesn't do anything if anything it's annoying why in the world would you use this awww you have a cute little bird now what? NOTHING!!!"
- (google-play-tiimo, 2*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=4a5b873c-0f3c-4107-9f44-77ec53e46079: "Not for me. Its amazing if this helps people, but theres no options as to how the tasks look in the app. auto suggesting subtasks works well - if i name the task well. but it then reorders the list of subtasks randomly a"
- (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=f43292f4-d2a4-4bc6-ad84-79ae6ca2adea: "I looked forward to trying this app, but before even finishing set-up it tried to suggest religious propaganda to me!"
- (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=f8a05f91-f85f-4923-a0d3-0928c4e47698: "asked for taking before I finished stopping it up, no free trial to try it out"
- (google-play-tiimo, 2*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=aee74521-2919-44a3-8c77-158ebc53a9e6: "I'm just getting start will update after a few days"
- (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=d193981e-a21a-4a2b-86b8-e924b39c7217: "no routines the way tiimo used to have. routineflow is the only option now I guess"
- (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=57412415-33fe-4b60-aa18-2f46f2a5e172: "disappointed.... where is the watch version?"
- (google-play-tiimo, 2*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=c442bf01-4e68-46ce-9870-7c7b2af867cf: "Not even a smartwatch app."
- (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=44a783e5-90a0-4afb-a437-c7e18a1b81f3: "it just didn't work for me or motivate so I donot want my money wasted."
- (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=7f40dbdf-20a3-449c-a7bb-785e40ac7831: "yeah"
- (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=71a27875-b9af-43c3-8958-cbde85eab0de: "No recall option! I homeschool; I was in the middle of a very lengthy conversation with ai to add all the elements of our average homeschool week schedule. I went to add more information after an AI response. I accidenta"
- (google-play-structured, 2*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=edd85451-7e3e-43d8-a848-4dcd0cf1a77d: "App looks really good, but I can't even check it is it useful for me without spending money. I can't even add an event "wake up" 8:30 Mon/Tue/Fri and 7:20 wed/thur. I can only add disposable events. I need to structure a"
- (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=757d0082-420c-41aa-b73e-cc9b869f09a4: "The most basic schedule app you can get for free from multiple providers 👎"
- (google-play-structured, 2*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=a8f556dc-ea04-4c21-84ee-eea6dee48ff1: "no way to automatically reorder incomplete tasks in the day as in flowsavvy"

---

# (B) Combined: run 1 (App Store Finch/Tiimo/Structured) + run 2 store rows

### (B) report

1504 reviews from 8 sources (app-store-finch, app-store-goblin, app-store-structured, app-store-tiimo, google-play-finch, google-play-goblin, google-play-structured, google-play-tiimo). 1504 had star ratings.
31 duplicate reviews removed.

### What they hate

| rank | theme | score | reviews | share | avg stars | sources |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Price and paywalls | 96.5 | 175 | 12% | 3.1 | 8 |
| 2 | Bugs and crashes | 78.3 | 127 | 8% | 2.6 | 8 |
| 3 | Sync, calendar and widgets | 72.9 | 145 | 10% | 3.2 | 7 |
| 4 | Reminders and notifications | 49.5 | 96 | 6% | 3.1 | 8 |
| 5 | Notifications and spam | 48.8 | 96 | 6% | 3.1 | 8 |
| 6 | Billing, cancelling and refunds | 37.9 | 45 | 3% | 1.5 | 8 |
| 7 | AI that gets it wrong or costs more effort | 36.2 | 60 | 4% | 2.9 | 6 |
| 8 | Sync and lost data | 34.8 | 67 | 4% | 2.9 | 7 |
| 9 | Confusing or clunky to use | 23.0 | 41 | 3% | 3.1 | 7 |
| 10 | Too complicated / overwhelming setup | 21.7 | 60 | 4% | 3.9 | 8 |
| 11 | A redesign or update made it worse | 17.7 | 22 | 2% | 1.9 | 8 |
| 12 | Android feels second-class (missing features, broken sync/notifications) | 17.4 | 36 | 2% | 2.8 | 4 |
| 13 | Basic features paywalled (recurring tasks, subtasks, reminders) | 16.5 | 28 | 2% | 2.8 | 5 |
| 14 | Paid once, then asked to pay again (switch to subscription) | 15.9 | 22 | 2% | 2.3 | 5 |
| 15 | Ads | 15.6 | 30 | 2% | 3.2 | 8 |
| 16 | Lost everything (lists, pet, streak) after an update or logout | 12.1 | 15 | 1% | 1.8 | 6 |
| 17 | Novelty wears off / forget to open it | 11.7 | 21 | 1% | 3.0 | 7 |
| 18 | Login and account problems | 9.7 | 15 | 1% | 2.5 | 8 |
| 19 | Guilt, streaks and shame | 9.5 | 25 | 2% | 4.1 | 7 |
| 20 | Support that does not answer | 9.5 | 11 | 1% | 1.4 | 7 |
| 21 | Asks for a rating before you have used it | 9.0 | 12 | 1% | 2.2 | 3 |
| 22 | Slow, laggy, heavy | 7.9 | 16 | 1% | 3.2 | 7 |
| 23 | Timers and time blindness | 5.2 | 15 | 1% | 4.1 | 6 |
| 24 | Reminders too weak to work (wants louder / nagging) | 5.2 | 8 | 0% | 1.8 | 2 |
| 25 | Paywall only after a long setup / quiz | 5.1 | 7 | 0% | 2.3 | 4 |
| 26 | Just a website in an app shell | 4.4 | 9 | 1% | 3.4 | 5 |
| 27 | Too gamified / grind / ad partnerships in a paid app | 4.2 | 6 | 0% | 2.5 | 4 |
| 28 | Privacy and permissions | 1.9 | 6 | 0% | 4.3 | 4 |
| 29 | Feels childish / not for adults | 1.6 | 4 | 0% | 4.0 | 3 |
| 30 | Easy to tick without doing it (no real start) (thin) | 1.0 | 2 | 0% | 3.5 | 1 |

**Price and paywalls**
- "Paywall." (app-store-structured, 1*) https://apps.apple.com/us/app/id1499198946?see-all=reviews#review-14415144854
- "Paywall!!!." (app-store-structured, 1*) https://apps.apple.com/us/app/id1499198946?see-all=reviews#review-14470662620
- "Subscription Model." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-14462715725

**Bugs and crashes**
- "CRASH!" (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13699384497
- "Crashes." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13689420828
- "App Crashes." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-13728902887

**Sync, calendar and widgets**
- "Please refine the widget." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=08a796e7-b02e-4222-b28e-7ced6e1ed06d
- "Now the app has stopped syncing." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=a67c7e00-225a-450e-84d9-76620ff7bf9d
- "Can't sync data between Android and iOS." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=7217971f-4d2c-4378-ad8c-2751bb6d56a6

**Reminders and notifications**
- "Notifications!" (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=6a2e0e74-66db-4f21-8990-5d3e24b4e924
- "Too many notifications to rate the app." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14115646181
- "So slow to just make a simple reminder note." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14163348133

**Notifications and spam**
- "Notifications!" (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=6a2e0e74-66db-4f21-8990-5d3e24b4e924
- "Too many notifications to rate the app." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14115646181
- "So slow to just make a simple reminder note." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14163348133

**Billing, cancelling and refunds**
- "I want a full refund." (app-store-goblin, 1*) https://apps.apple.com/us/app/id6449003064?see-all=reviews#review-14455213434
- "Canceling my subscription." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=6a2e0e74-66db-4f21-8990-5d3e24b4e924
- "Canceled but charged anyway." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14303753054

### What they ask for

| rank | theme | score | reviews | share | avg stars | sources |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Customisation and control | 38.1 | 91 | 6% | 3.5 | 8 |
| 2 | Platforms, offline and mobile | 29.8 | 61 | 4% | 3.1 | 7 |
| 3 | Integrations, import and export | 22.1 | 40 | 3% | 3.1 | 6 |
| 4 | Teams and sharing | 7.7 | 24 | 2% | 4.2 | 8 |
| 5 | Readability: font size, dyslexia, dark mode | 2.6 | 5 | 0% | 3.0 | 4 |
| 6 | Body doubling / someone with you (thin) | 0.4 | 2 | 0% | 5.0 | 1 |

**Customisation and control**
- "Setting a task to be every 2 days ends up with random 3 day gaps." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=ff190a50-7db0-459f-9737-6bd80cfc4118
- "Nowhere anywhere in this app, that I can find, is an option to cancel." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14399413087
- "setting up one off instances but have to pay to set up recurring items" (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=93b7a7db-6813-4c8e-9a2a-f71c3c07e0fa

**Platforms, offline and mobile**
- "Android version do not have AI assistant." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=7217971f-4d2c-4378-ad8c-2751bb6d56a6
- "couldn't get the promised refund when they stopped supporting android." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=07b77216-1b28-4c3f-8bbb-83d7a13f0b6c
- "Android app is missing key functions which are shown on the app description." (google-play-tiimo, 1*) https://play.google.com/store/apps/details?id=com.tiimo.androidappreactnative&reviewId=607c45a8-af1a-4b1e-ad3b-811209e446c6

**Integrations, import and export**
- "Will NOT synch with tasks created in Google Calendar." (google-play-structured, 1*) https://play.google.com/store/apps/details?id=io.unorderly.structured&reviewId=78d8d5d2-86e3-4a28-b790-d3b5d787ad5a
- "Hey at least they got AI integration before usable design." (app-store-structured, 1*) https://apps.apple.com/us/app/id1499198946?see-all=reviews#review-14531327204
- "Sucks does not integrate with outlook calendar nor import Todoist." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14350985044

**Teams and sharing**
- "Stop sharing info." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14446244786
- "It seems that your team knows NOTHING about marketing." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=430c953b-3499-4a81-8be5-53556d484f33
- "Just wanted to share my experience before I go.😂" (app-store-finch, 2*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14730559010

**Readability: font size, dyslexia, dark mode**
- "I CANNOT use this app at night :( it's actually been so helpful, but no dark mode makes it incredibly difficult to log things at night or use the app when I first get up." (google-play-finch, 1*) https://play.google.com/store/apps/details?id=com.finch.finch&reviewId=2400d159-76ea-4a96-b502-abfb2f628dc2
- "While a lot of the tools can be helpful the interface isn't dyslexic friendly which a lot of people with neurodivergence have." (google-play-goblin, 2*) https://play.google.com/store/apps/details?id=com.goblintools&reviewId=36cafc39-31ce-4ca1-8487-356fa4455463
- "Love the easy to set dyslexic font choice." (app-store-tiimo, 3*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14714757577

**Body doubling / someone with you**
- "Good Motivation & Accountability." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14744737389
- "Absolutely love it, and the accountability of getting things done." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14749484998

### Asked for in their own words

- "And I’ve read some reviews, but some people in the reviews need to get over that there are PRIDE supporting stuff, if it bothers them that much then they should just delete it." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14746716378
- "The only frustration I have that I wish they would change is when you set goals you are forced to pick specific days." (app-store-finch, 4*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14746061851
- "I understand it’s a reminder to check the app, but there needs to be a way to limit the notifications (not turn off completely)." (app-store-finch, 3*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14745753774
- "My self-care pet returned from an adventure to tell me that she “dislikes SpongeBob.” I’m a huge SpongeBob fan so this was obviously extremely upsetting to me, and there’s no way to change this???" (app-store-finch, 1*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14744309021
- "It’s just a fun and cute way to keep track of things I need to do and get little rewards for doing them!" (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14740148980
- "It would be so nice to be able to share goals more completely with a spouse or partner and see what each other needs to get done and encourage them along their self care and productivity journey." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14738408388
- "Optional period tracker would be nice." (app-store-finch, 4*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14734313758
- "Finch is so amazing for kids and adult u need to get thisapp" (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14731990544
- "...ritter or whatever, set up your profile, enter your name and information, take a whole quiz and THEN tell you need to pay for a subscription to access the app and its contents...." (app-store-finch, 2*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14730559010
- "You need to get it." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14727206055
- "...int and I really wanted that pet so if I was wondering if you could give me one of the pets that I wanted, it would be great thank you..." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14726156867
- "Finch is amazing and I loved to use it every single day for my guitar lesson and my chores for my laundry pretty much everything I do it’s really fun and I wish you guys could do it too." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14725147129
- "I wish there was a wider variety of animals." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14724974422
- "As a girl who needs a set routine this has helped me so much with that and more." (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14723316721
- "I need more rooms to decorate 🫶🫶🫶" (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14718860249
- "You don’t even need a subscription or anything it’s amazing without one" (app-store-finch, 5*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14711430919
- "This app is so helpful and has so many goal and activity options, one thing I do wish it had was a way to use the helplines in the app instead of on the browser or calling, just like an in app chat would be nice." (app-store-finch, 4*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14711357668
- "So if you could just get rid of the questions that you can’t answer easy that would be great." (app-store-finch, 4*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14710972036
- "When I add things to my day in the morning, afternoon, or evening blocks, I wish it was easier to drag to reorder the things I need to get done in order of priority or somewhat chronological order without assigning set t..." (app-store-tiimo, 4*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14721868044
- "My job requires me to have hundreds of tabs open, so I lose track of the app’s tab and of what I need to do." (app-store-tiimo, 2*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14718495688
- "Would be helpful to have all the features as-is, but presented as a clean, consistent, text only interface that isn’t bulky." (app-store-tiimo, 3*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14714757577
- "The reminders and visual timers help me see time passing, so I don’t get lost and forget where I need to show up." (app-store-tiimo, 5*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14709707296
- "It allows me to remember and do all the things that I need to do." (app-store-tiimo, 5*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14689069135
- "I don’t need to have the larger ones taking up a lot of room on my screen, and I loved that I could have the smaller one and still see what’s next on my list." (app-store-tiimo, 4*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14666214819
- "Charged during the free trial and no way to get a refund." (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14636003781

### Read these by hand

Low ratings that matched no theme. Either noise, or a theme themes.json does not have yet. Often the most useful part.

- (app-store-finch, 1*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14744309021: "Hating on the Bob???. I though this was a great app and it was really helping me. I was really enjoying the app until tonight. My self-care pet returned from an adventure to tell me that she “dislikes SpongeBob.” I’m a h"
- (app-store-finch, 1*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14736714493: "After Nov 1st update. Can’t access Finch. After the 11-1-2026 update"
- (app-store-finch, 1*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14729185098: "I don’t get it.. This is an app where you set goals for yourself.  Upon completion of said goals, you are rewarded with a ‘ding’ sound. I guess this could be satisfying if it weren’t for the constant high pressure sales "
- (app-store-finch, 2*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14726746571: "Not inclusive. I noticed this app includes gay pride and disability awareness including many pride specific flags but does not have a nationality specific flags? Otherwise a cute app!"
- (app-store-finch, 1*) https://apps.apple.com/us/app/id1528595748?see-all=reviews#review-14709809354: "Doesn’t Work. Sends you in a loop even after you have created an account. Doesn’t work."
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14723819209: "This app. This app sucks ahh🛴🛴🛴😭😭😭👯👨‍❤️‍💋‍👨🧦🦕🦖🚓🚙🚗🚕🚌🚑🏎️🚎🚒🚐🛻🚚🚜🚛🚔🚍🛺🚘🏍️🛵🚖🚡🚠🚟🚘🚍🚃🚋🚞🚝🚂🚈🚅🚄🚆🚇🚊🛩️🛬🛫✈️🛰️🚀🛸🚁🛥️🛳️⛴️🚢"
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14686981570: "Fail. Instructions/directions comprehension 0"
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14658746349: "Zero stars. for continuing to ask me how I like an app, in the first hour of using it."
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14602053824: "Extra work. I don’t understand the point of this app. I guess if you enjoy thinking about your day and writing everything down daily then it would be good. If you’re like me and are someone who needs to take thinking abo"
- (app-store-tiimo, 2*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14575281782: "Developer changes the program every week or two and makes all of my entries unusable. I have asked f. Developer keeps changing the program weekly"
- (app-store-tiimo, 2*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14388250042: "Doesn’t allow twice weekly tasks. I do laundry twice a week and it won’t let let me make laundry something I can do twice a week under one chore; I thought maybe I could put Wednesday laundry and Saturday laundry as two "
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14294449046: "Money grabber. Why make the app free if you can do much. Can’t event change the color or the layout🤦🏾‍♂️"
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14226035515: "Terrible app. Doesn’t really offer anything more than a planner, to pay 12 dollars is crazy"
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14196878337: "Write a review. Each time I use the app I get asked to write a review, sometimes repeating requests. I like the app except for the overaggressive rating tactics"
- (app-store-tiimo, 1*) https://apps.apple.com/us/app/id1480220328?see-all=reviews#review-14163511803: "it wont merg my lists. done"

---

# (C) Hacker News only (thin by definition: one source, unrated)

### (C) report

226 reviews from 1 sources (hacker-news). 0 had star ratings.

### What they hate

| rank | theme | score | reviews | share | avg stars | sources |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Timers and time blindness (thin) | 4.8 | 14 | 6% | - | 1 |
| 2 | Bugs and crashes (thin) | 4.2 | 11 | 5% | - | 1 |
| 3 | Reminders and notifications (thin) | 3.3 | 10 | 4% | - | 1 |
| 4 | Price and paywalls (thin) | 3.0 | 9 | 4% | - | 1 |
| 5 | Notifications and spam (thin) | 2.7 | 9 | 4% | - | 1 |
| 6 | Novelty wears off / forget to open it (thin) | 2.4 | 7 | 3% | - | 1 |
| 7 | Slow, laggy, heavy (thin) | 2.1 | 5 | 2% | - | 1 |
| 8 | Guilt, streaks and shame (thin) | 1.8 | 6 | 3% | - | 1 |
| 9 | Sync, calendar and widgets (thin) | 1.8 | 6 | 3% | - | 1 |
| 10 | Too complicated / overwhelming setup (thin) | 1.8 | 5 | 2% | - | 1 |
| 11 | Confusing or clunky to use (thin) | 1.5 | 3 | 1% | - | 1 |
| 12 | AI that gets it wrong or costs more effort (thin) | 1.2 | 3 | 1% | - | 1 |
| 13 | Ads (thin) | 0.9 | 3 | 1% | - | 1 |
| 14 | Billing, cancelling and refunds (thin) | 0.9 | 3 | 1% | - | 1 |
| 15 | Privacy and permissions (thin) | 0.9 | 2 | 1% | - | 1 |
| 16 | Support that does not answer (thin) | 0.6 | 1 | 0% | - | 1 |
| 17 | Login and account problems (thin) | 0.3 | 1 | 0% | - | 1 |
| 18 | Android feels second-class (missing features, broken sync/notifications) (thin) | 0.3 | 1 | 0% | - | 1 |
| 19 | Sync and lost data (thin) | 0.3 | 1 | 0% | - | 1 |
| 20 | A redesign or update made it worse (thin) | 0.3 | 1 | 0% | - | 1 |
| 21 | Reminders too weak to work (wants louder / nagging) (thin) | 0.3 | 1 | 0% | - | 1 |

**Timers and time blindness**
- "We usually run a shared pomodoro timer." (hacker-news, -) https://news.ycombinator.com/item?id=43519048
- "I always set a three-minute timer whenever I take a bio break." (hacker-news, -) https://news.ycombinator.com/item?id=40498848
- "The Pomodoro technique is for sure a great way to focus on certain tasks!" (hacker-news, -) https://news.ycombinator.com/item?id=33630097

**Bugs and crashes**
- "Unfortunately that doesn't work for everyone, especially our members." (hacker-news, -) https://news.ycombinator.com/item?id=42012402
- "If Pomodoro doesn't work for someone, it just won't work, no matter the app they use." (hacker-news, -) https://news.ycombinator.com/item?id=40498848
- "A blog post stuffed with stolen art and often heard but absolutely not working advice?" (hacker-news, -) https://news.ycombinator.com/item?id=38276463

**Reminders and notifications**
- "I've been the polite but chronic reminder/nagger." (hacker-news, -) https://news.ycombinator.com/item?id=33618307
- "I've tried a variety of journals, to-do lists, calendar reminders, etc." (hacker-news, -) https://news.ycombinator.com/item?id=32881557
- "Being able to see the interesting book you want to read or a notification pop up on your phone is not helpful." (hacker-news, -) https://news.ycombinator.com/item?id=34463387

**Price and paywalls**
- "There is no cost." (hacker-news, -) https://news.ycombinator.com/item?id=46649381
- "it is a potent medication with side effects and tradeoffs, although trying doesn't cost anything." (hacker-news, -) https://news.ycombinator.com/item?id=31306839
- "You're better off seeing a qualified, registered, regulated practitioner, especially at these prices." (hacker-news, -) https://news.ycombinator.com/item?id=42014934

**Notifications and spam**
- "I've been the polite but chronic reminder/nagger." (hacker-news, -) https://news.ycombinator.com/item?id=33618307
- "I've tried a variety of journals, to-do lists, calendar reminders, etc." (hacker-news, -) https://news.ycombinator.com/item?id=32881557
- "Being able to see the interesting book you want to read or a notification pop up on your phone is not helpful." (hacker-news, -) https://news.ycombinator.com/item?id=34463387

**Novelty wears off / forget to open it**
- ">they’re motivated by urgency, novelty, competition, and interest." (hacker-news, -) https://news.ycombinator.com/item?id=40364137
- "I have ADD and constantly forget about birthdays, meetings, and plans." (hacker-news, -) https://news.ycombinator.com/item?id=40498848
- "We definitely do the same when it comes to pair programming the boring or difficult parts." (hacker-news, -) https://news.ycombinator.com/item?id=32881557

### What they ask for

| rank | theme | score | reviews | share | avg stars | sources |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Body doubling / someone with you (thin) | 62.7 | 187 | 83% | - | 1 |
| 2 | Teams and sharing (thin) | 6.9 | 22 | 10% | - | 1 |
| 3 | Integrations, import and export (thin) | 2.4 | 8 | 4% | - | 1 |
| 4 | Customisation and control (thin) | 2.1 | 6 | 3% | - | 1 |
| 5 | Readability: font size, dyslexia, dark mode (thin) | 0.3 | 1 | 0% | - | 1 |
| 6 | Platforms, offline and mobile (thin) | 0.3 | 1 | 0% | - | 1 |

**Body doubling / someone with you**
- "Body doubling is a thing!" (hacker-news, -) https://news.ycombinator.com/item?id=46126178
- "Have you tried body doubling?" (hacker-news, -) https://news.ycombinator.com/item?id=35981474
- "Body doubling is exactly this!" (hacker-news, -) https://news.ycombinator.com/item?id=33630155

**Teams and sharing**
- "Happy to share more over if helpful!" (hacker-news, -) https://news.ycombinator.com/item?id=33478900
- "Screen sharing is much safer on WorkMode." (hacker-news, -) https://news.ycombinator.com/item?id=41377792
- "Hey, you can share your screen in Focusmate." (hacker-news, -) https://news.ycombinator.com/item?id=43599871

**Integrations, import and export**
- "I made something like this that integrates with TickTick" (hacker-news, -) https://news.ycombinator.com/item?id=43464931
- "Other tools (e.g Slack, Teams) make me feel kind of "alone" when working." (hacker-news, -) https://news.ycombinator.com/item?id=43279377
- "> Every morning, I start my day by planning it out in a custom template that displays my Google Calendar events and Todoist task list." (hacker-news, -) https://news.ycombinator.com/item?id=38276463

**Customisation and control**
- "There is the selection mechanism and the universe of templates." (hacker-news, -) https://news.ycombinator.com/item?id=43463296
- "The difference between body doubling and "working in an office setting" is mutual agreement to avoid distracting each other." (hacker-news, -) https://news.ycombinator.com/item?id=43519072
- "> Every morning, I start my day by planning it out in a custom template that displays my Google Calendar events and Todoist task list." (hacker-news, -) https://news.ycombinator.com/item?id=38276463

**Readability: font size, dyslexia, dark mode**
- "We're unable to read any text on your screen, even at 32px font size," (hacker-news, -) https://news.ycombinator.com/item?id=37829005

**Platforms, offline and mobile**
- "Mobile apps of the tools are offered at a low price (on Android and iOS), which will help cover the running and maintenance costs so the website can stay completely free." (hacker-news, -) https://news.ycombinator.com/item?id=36991418

### Asked for in their own words

- "Needs to be something where you can't just stop as you wish." (hacker-news, -) https://news.ycombinator.com/item?id=46674921
- "Built it for myself (have ADHD, dev struggles are real) and it's been working well, but would love feedback from other builders." (hacker-news, -) https://news.ycombinator.com/item?id=45600653
- "I don’t get sidetracked going lost in documentation loops, suffer decision paralysis, or forget what I’m currently doing or what I need to do next." (hacker-news, -) https://news.ycombinator.com/item?id=44771442
- "For some complex organisational system, you need to compile that system into "ADHD byte code" and for that, you need to bootstrap a compiler." (hacker-news, -) https://news.ycombinator.com/item?id=44211221
- "Of course I would love to be able to be consistently able to work, but that is not a reality for me." (hacker-news, -) https://news.ycombinator.com/item?id=44059631
- "It would be nice to start the day with a lavish breakfast, before everyone settles into their work day." (hacker-news, -) https://news.ycombinator.com/item?id=43519048
- "There's no way everyone can be fully accommodating of everyone else's needs." (hacker-news, -) https://news.ycombinator.com/item?id=43309233
- "If you need to practice body doubling it’s suggested you don’t go into a career doing knowledge work because you will likely have to spend a lot more time working alone." (hacker-news, -) https://news.ycombinator.com/item?id=43304098
- "> What I mean is: What innovative functionality is missing to such a degree, that if it was introduces, would make people abandon Discord?" (hacker-news, -) https://news.ycombinator.com/item?id=43279377
- "Some clients need to follow a morning ritual before starting their work (think meditation, a quick house cleanup, etc.)." (hacker-news, -) https://news.ycombinator.com/item?id=42406391
- "By "inattentive procrastinators", I mean people who are easily distracted and forget that they need to work on their tasks." (hacker-news, -) https://news.ycombinator.com/item?id=42398580
- "When you're at the "figuring out what to even do here" stage, you need a different approach." (hacker-news, -) https://news.ycombinator.com/item?id=42382878
- "Since we're a small team (and mostly neurodivergent), we need to make sure we're super focused in our messaging and efforts" (hacker-news, -) https://news.ycombinator.com/item?id=42012469
- "The method that works for you depends on why and how you delay tasks (and you need to consider both separately)." (hacker-news, -) https://news.ycombinator.com/item?id=41886751
- "On WorkMode, you just need to connect with us the first time, and we'll take that responsibility from you." (hacker-news, -) https://news.ycombinator.com/item?id=41377792
- "I'm paying for it even when I'm not using it just because this needs to exist." (hacker-news, -) https://news.ycombinator.com/item?id=41038229
- "It's surprisingly effective, and it shortens the time I need to spend the next day resuming work." (hacker-news, -) https://news.ycombinator.com/item?id=40498848
- "Not everybody needs an abundance of executive function." (hacker-news, -) https://news.ycombinator.com/item?id=38769343
- "...relationship with "motivation" in a way that can be summed up succinctly by author Brad Stulberg: "You don't need to feel good to get going...." (hacker-news, -) https://news.ycombinator.com/item?id=37784759
- "You need tools to address those problems, not just remind you what you need to do." (hacker-news, -) https://news.ycombinator.com/item?id=36782541
- "I can always go somewhere else if I need to take a break." (hacker-news, -) https://news.ycombinator.com/item?id=35118490
- "You don't need to read a book or train for it; you don't get better at it." (hacker-news, -) https://news.ycombinator.com/item?id=34869001
- "Remember, we need to solve the emotional problem, not the organizational one." (hacker-news, -) https://news.ycombinator.com/item?id=34463387
- "For remote work to be a permanent choice, I think we need to be a bit more honest about the benefits of being in-office." (hacker-news, -) https://news.ycombinator.com/item?id=33495689
- "I've found that having someone else around when I need to to that thing, or a "body double" ( https://doubleapp.xyz/blog/body-doubling-proxy ), is a super useful tactic to "unblock" myself and overcome motivational hurdl..." (hacker-news, -) https://news.ycombinator.com/item?id=33472107
