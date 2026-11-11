# Sound credits

All focus recordings are **CC0 1.0** (public domain): commercial use is OK and no credit is required. We credit them anyway (Settings › About shows one line). Found through Openverse (api.openverse.org); the files are Freesound HQ previews. Rain, fire and autumn were picked on 2026-11-11 from `candidates2/` (local only, not in git; see its README for the full recipe). Brown noise dates from 2026-11-09.

| File | Source title | Creator | Licence | Link |
|---|---|---|---|---|
| `rain.m4a` | Stereo rain ambience | brianbaltar | CC0 1.0 | https://freesound.org/people/brianbaltar/sounds/528811 |
| `fire.m4a` | Aachen_Burning Fireplace Crackling Fire Sounds.wav | visionear | CC0 1.0 | https://freesound.org/people/visionear/sounds/501417 |
| `autumn.m4a` ("Autumn walk") | LateSummer MP3 quiet woods and Leaves and Wind SEPT 13 2022 | kvgarlic | CC0 1.0 | https://freesound.org/people/kvgarlic/sounds/650337 |
| `autumn.m4a` (second air layer) | pinewoods.aiff | klangfabrik | CC0 1.0 | https://freesound.org/people/klangfabrik/sounds/128627 |
| `brown.m4a` | Distant Waterfall - Silence, Ambiance, Air, Tone, Buzz, Noise | senorstudy | CC0 1.0 | https://freesound.org/people/senorstudy/sounds/437280 |

Soft keys (`keys.m4a`, "quiet typing on laptop computer" by lmz36) was removed on 2026-11-11: the owner found it too loud.

## How they were made (ffmpeg + numpy)
- **Rain, fire, autumn:** 56 s seamless loops (equal-power 4 s crossfade of the end into the head), spectrally matched toward the owner's reference clips, gentle transient cap and level rider, normalised to **-24 LUFS integrated**, true peak ≤ -2.2 dBTP, AAC 128 kbps stereo 44.1 kHz, about 0.9 MB each. No fades at the ends.
- **Brown noise** is the real distant waterfall, low-passed (900 Hz + 1.4 kHz) with +2 dB at 120 Hz. Re-levelled on 2026-11-11 from -20 to **-24 LUFS** with a plain -3.98 dB gain (no fades or edits, so the loop seam is unchanged), true peak -12.1 dBTP, AAC 96 kbps stereo, 50 s.
- **Breathing cues** (`breathe-in.m4a` 4 s, `breathe-out-4.m4a`, `breathe-out.m4a` 6 s, `breathe-out-8.m4a`): original, made for Gobblo (CC0), no recording, so no hiss or room noise. A warm sine pad: the root (two voices detuned ±0.35 Hz, one per ear) plus a soft fifth (0.22) and a quiet octave (0.12), low-passed at 1.5 kHz. In = F3 → G3 rising, slow raised-cosine swell peaking near 80 %, soft release. Out = G3 → E3 falling, 0.35 s soft attack, then a long fade to silence over the whole phase. About −28 LUFS (8 dB under the ambient loops), noise floor below −85 dB, edges at zero (no clicks). Replaced the singing bowl on 2026-11-09 (Anass: "too noisy").
