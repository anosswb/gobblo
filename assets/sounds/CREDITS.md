# Sound credits

All four sources are **CC0 1.0** (public domain): commercial use is OK and no credit is required. We credit them anyway (Settings › About shows one line). Found through Openverse (api.openverse.org) on 2026-11-09; the files are Freesound's HQ previews.

| File | Source title | Creator | Licence | Link |
|---|---|---|---|---|
| `rain.m4a` | Rain Window Closed | dggrunzweig | CC0 1.0 | https://freesound.org/people/dggrunzweig/sounds/342901 |
| `brown.m4a` | Distant Waterfall - Silence, Ambiance, Air, Tone, Buzz, Noise | senorstudy | CC0 1.0 | https://freesound.org/people/senorstudy/sounds/437280 |
| `keys.m4a` | quiet typing on laptop computer | lmz36 | CC0 1.0 | https://freesound.org/people/lmz36/sounds/721033 |
| `breathe-in.m4a`, `breathe-out.m4a` | singing bowl sing.wav | ryancacophony | CC0 1.0 | https://freesound.org/people/ryancacophony/sounds/202004 |

## How they were made (ffmpeg + numpy)
- **Loops:** a 50 s cut (keys 33 s), with its last 3–4 s (keys 2 s) blended equal-power into the cut's head, so the end flows straight into the start: no click, no gap. AAC 96 kbps stereo, 0.4–0.6 MB each.
- **Brown noise** is the real distant waterfall, low-passed (900 Hz + 1.4 kHz) with +2 dB at 120 Hz: the deep, warm brown-noise colour, from a real recording instead of math.
- **Loudness:** rain and brown −20 LUFS, keys −26 LUFS through a limiter (typing clicks are spiky), true peak ≤ −1.5 dBFS.
- **Breathing:** one bowl, so the two cues match in pitch (~318 Hz). In = its natural 4.4 s swell (2.2–6.6 s). Out = its 7.5 s natural release (23–30.5 s) with a 3 s fade. Same −5 dB gain on both, so the in-cue ends at about the level the out-cue starts.
