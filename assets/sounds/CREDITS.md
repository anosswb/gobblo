# Sound credits

All three recordings are **CC0 1.0** (public domain): commercial use is OK and no credit is required. We credit them anyway (Settings › About shows one line). Found through Openverse (api.openverse.org) on 2026-11-09; the files are Freesound's HQ previews.

| File | Source title | Creator | Licence | Link |
|---|---|---|---|---|
| `rain.m4a` | Rain Window Closed | dggrunzweig | CC0 1.0 | https://freesound.org/people/dggrunzweig/sounds/342901 |
| `brown.m4a` | Distant Waterfall - Silence, Ambiance, Air, Tone, Buzz, Noise | senorstudy | CC0 1.0 | https://freesound.org/people/senorstudy/sounds/437280 |
| `keys.m4a` | quiet typing on laptop computer | lmz36 | CC0 1.0 | https://freesound.org/people/lmz36/sounds/721033 |

## How they were made (ffmpeg + numpy)
- **Loops:** a 50 s cut (keys 33 s), with its last 3–4 s (keys 2 s) blended equal-power into the cut's head, so the end flows straight into the start: no click, no gap. AAC 96 kbps stereo, 0.4–0.6 MB each.
- **Brown noise** is the real distant waterfall, low-passed (900 Hz + 1.4 kHz) with +2 dB at 120 Hz: the deep, warm brown-noise colour, from a real recording instead of math.
- **Loudness:** rain and brown −20 LUFS, keys −26 LUFS through a limiter (typing clicks are spiky), true peak ≤ −1.5 dBFS.
- **Breathing cues** (`breathe-in.m4a` 4 s, `breathe-out-4.m4a`, `breathe-out.m4a` 6 s, `breathe-out-8.m4a`): original, made for Gobblo (CC0), no recording, so no hiss or room noise. A warm sine pad: the root (two voices detuned ±0.35 Hz, one per ear) plus a soft fifth (0.22) and a quiet octave (0.12), low-passed at 1.5 kHz. In = F3 → G3 rising, slow raised-cosine swell peaking near 80 %, soft release. Out = G3 → E3 falling, 0.35 s soft attack, then a long fade to silence over the whole phase. About −28 LUFS (8 dB under the ambient loops), noise floor below −85 dB, edges at zero (no clicks). Replaced the singing bowl on 2026-11-09 (Anass: "too noisy").
