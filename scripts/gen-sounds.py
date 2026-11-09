#!/usr/bin/env python3
"""Generate Gobblo's original sounds (CC0, made by this script, no samples).

Run:  python3 -I scripts/gen-sounds.py assets/sounds
Writes short notification/UI sounds as .wav. The focus loops and breathing cues are now real
CC0 recordings (assets/sounds/CREDITS.md); the old math loops are only written with --old-loops.
"""
import math
import os
import random
import struct
import subprocess
import sys
import wave

SR = 22050
random.seed(7)


def write_wav(path, samples, sr=SR):
    peak = max(1e-9, max(abs(s) for s in samples))
    gain = 0.89 / peak
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s * gain)) * 32767)) for s in samples))


def env(i, n, attack=0.01, release=0.6):
    t = i / n
    a = min(1.0, t / attack) if attack else 1.0
    r = min(1.0, (1 - t) / release) if release else 1.0
    return a * r


def tone(freq, dur, slide=1.0, kind="sine", vol=1.0, sr=SR):
    n = int(dur * sr)
    out, ph = [], 0.0
    for i in range(n):
        f = freq * (slide ** (i / n))
        ph += 2 * math.pi * f / sr
        v = math.sin(ph) if kind == "sine" else (1.0 if math.sin(ph) > 0 else -1.0) * 0.4
        if kind == "tri":
            v = 2 / math.pi * math.asin(math.sin(ph))
        out.append(v * vol * env(i, n, 0.02, 0.85))
    return out


def mix(*tracks, offsets=None):
    offsets = offsets or [0] * len(tracks)
    n = max(len(t) + o for t, o in zip(tracks, offsets))
    out = [0.0] * n
    for t, o in zip(tracks, offsets):
        for i, v in enumerate(t):
            out[i + o] += v
    return out


def seamless(samples, fade):
    """Crossfade the tail into the head so the loop has no click."""
    n = len(samples) - fade
    out = samples[:n]
    for i in range(fade):
        k = i / fade
        out[i] = out[i] * k + samples[n + i] * (1 - k)
    return out


def brown(seconds=10):
    n, last, out = int(seconds * SR), 0.0, []
    for _ in range(n + SR):
        last = (last + 0.02 * random.uniform(-1, 1)) / 1.02
        out.append(last)
    return seamless(out, SR)


def rain(seconds=10):
    n = int(seconds * SR) + SR
    out, lp = [], 0.0
    for _ in range(n):  # soft hiss
        lp += 0.12 * (random.uniform(-1, 1) - lp)
        out.append(lp * 0.5)
    for _ in range(int(seconds * 55)):  # droplets
        start = random.randrange(0, n - 800)
        f = random.uniform(1800, 4200)
        for i in range(600):
            out[start + i] += math.sin(2 * math.pi * f * i / SR) * math.exp(-i / 90) * random.uniform(0.08, 0.22)
    return seamless(out, SR)


def keys(seconds=10):
    n = int(seconds * SR) + SR
    out = [random.uniform(-1, 1) * 0.004 for _ in range(n)]
    t = 0
    while t < n - 2000:
        t += int(random.choice([0.09, 0.11, 0.14, 0.18, 0.22, 0.6]) * SR)
        f = random.uniform(1200, 2600)
        click = random.uniform(0.25, 0.45)
        for i in range(min(900, n - t)):
            noise = random.uniform(-1, 1) * math.exp(-i / 40)
            body = math.sin(2 * math.pi * f * i / SR) * math.exp(-i / 160) * 0.3
            out[t + i] += (noise + body) * click
    return seamless(out, SR)


def main(dest):
    os.makedirs(dest, exist_ok=True)
    sounds = {
        "boop": tone(300, 0.22, 1.6, vol=0.9),
        "pop": tone(480, 0.16, 2.0, vol=0.9),
        "chime": mix(tone(880, 0.5, kind="tri", vol=0.5), tone(1320, 0.6, kind="tri", vol=0.4), offsets=[0, int(0.09 * SR)]),
        "loud": mix(*[tone(f, 0.28, kind="tri", vol=0.9) for f in (660, 880, 1320, 1760)], offsets=[int(i * 0.11 * SR) for i in range(4)]),
        "tick": tone(1500, 0.03, kind="square", vol=0.5),
        "spark": mix(*[tone(f, 0.18, kind="tri", vol=0.5) for f in (660, 880, 1320, 1760)], offsets=[int(i * 0.07 * SR) for i in range(4)]),
        "nope": tone(220, 0.22, 0.7, kind="tri", vol=0.7),
    }
    for name, s in sounds.items():
        write_wav(os.path.join(dest, f"{name}.wav"), s)
    if "--old-loops" not in sys.argv:
        print("done:", sorted(os.listdir(dest)))
        return
    loops = {"brown": brown(), "rain": rain(), "keys": keys()}
    for name, s in loops.items():
        wav = os.path.join(dest, f"{name}.wav")
        write_wav(wav, s)
        m4a = os.path.join(dest, f"{name}.m4a")
        try:
            subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", wav, m4a], check=True, capture_output=True)
            os.remove(wav)
        except (OSError, subprocess.CalledProcessError):
            print(f"afconvert not available, kept {wav}")
    print("done:", sorted(os.listdir(dest)))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    main(args[0] if args else "assets/sounds")
