# 18 — Mascot bible: Gobblo the otter

Written 2026-11-10. Anass chose the **otter** (see docs/16, section 3b). This page is the brief for every picture, video and line of pet code. Short on purpose.

Status: **direction not picked yet.** Anass makes the 12 pictures in "Round 3" of `docs/10-image-prompts.md` and picks A, B or C.

## 1. Who it is (5 lines)

- A small otter that eats your to-do list. It is always a little hungry and always on your side.
- It fidgets: it rolls and juggles its lucky pebble while it waits.
- It gets excited fast, gets distracted fast, and naps hard. Like us.
- It never judges, never sulks at you, never cries because of you.
- It keeps your bites in its pocket until you are ready.

## 2. What makes it ours (the 4 marks)

1. **The lucky pebble is our spark ✦.** A smooth, four-point star pebble, warm yellow. It holds it, juggles it, taps food with it, sleeps hugging it. Sparks in the app are these pebbles.
2. **The pocket.** One small curved line on its left side. Bites go in, the pebble comes out.
3. **Big round cheeks** with 3 tiny whisker dots each. The cheeks puff when it chews.
4. **The float.** Its home pose is on its back, paws on its belly, like a real otter. No other to-do app has a pet that eats lying down.

## 3. Shape rules

- **Chibi:** the head is about 60% of the height. Short body, short paws, short thick tail like a rounded paddle.
- **3 shapes max:** head, body, tail. It must be drawable in code (SVG) and readable at 60 px.
- **Face:** small dot eyes set wide apart, a small rounded nose, tiny round ears, a cream muzzle.
- **Silhouette test:** filled in black you still see: round head, two tiny ears, paddle tail, star in the paws.
- **No realistic fur.** Smooth, soft, simple.

## 4. Colour

- Default body: warm caramel (about `#C98B5E`). Muzzle and belly: cream (about `#FBEEDD`). Nose: dark cocoa. Pebble: warm yellow.
- The user can still pick the pet's colour in the app; cream parts and the pebble stay the same.
- Icon: the caramel face with the pebble on the Ink deep blue `#003459` (orange on blue is easy to see).
- Final values are tuned on screen for all 5 themes.

## 5. How it eats a bite (the signature moment)

1. It rolls onto its back and floats.
2. The bite lands on its belly.
3. Tap, tap with the pebble.
4. Chomp. Cheeks puff.
5. **The happy dive (Anass's idea, 10 Nov).** The bottom line of the pet's card is the water line. The otter jumps up, dives under that line with a splash and is gone. Then it shoots back out with a second splash, holding a new pebble: that is the "+2 ✦".
   - Under water: about 1 second for a normal bite, the full 2 seconds for a big bite or a level-up (a longer wait feels like a bigger prize, and 2 seconds on every small bite would get slow).
   - While it is under, small bubbles rise at the water line, so the card never looks empty or broken.
   - The splash is drawn in code (drops + a ring), clipped by the card, with a soft "plop" sound and a light tap in the hand.
   - If you feed several bites fast, it stays under and comes out once, with all the pebbles.

Reduce Motion: no jump. A fade out, bubbles, a fade in with the puffed cheeks and the number.

## 6. Never

- Never sad, hurt or angry **at the user**. Hungry is "hopeful", not "starving".
- Never a shell on its belly, never blue-and-white, never a scallop: that is too close to a famous game creature. The pebble is a **star**, held in the paws or the pocket.
- Never a long realistic otter, never a speech-bubble logo shape, never another brand's colours or poses.
- No clothes by default (hats from the Closet still fit on the round head).

## 7. For the videos (after the direction is picked)

One model sheet in `assets/brand/`, so every AI video shows the same otter:
- Turnaround: front, 3/4, side, back, floating on its back.
- 12 faces: happy, hungry, chomping, full, proud, sleepy, curious, love, shocked, focused, cheeky, calm.
- 8 poses: waving, eating a bite on its belly, juggling the pebble, sitting at a desk, sleeping with the pebble, jumping, pointing, peeking from the edge of the screen.
- Always use the model sheet as the reference image in the video tool.

## 8. Rights

- `assets/brand/RIGHTS.md` will list every picture: tool, date, prompt, who made it. A buyer will ask for this.
- Checked on 10 Nov (one web search, thin on Android): no to-do or focus app with an otter mascot found. Before the icon is final, Anass or I search "otter" in the App Store and Google Play by hand.
