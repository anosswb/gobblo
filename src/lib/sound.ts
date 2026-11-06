import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { useAppStore } from '@/state/app-store';
import type { FocusSound, NudgeSound } from '@/state/schema';

/** Original sounds from scripts/gen-sounds.py (assets/sounds/LICENSES.md). */
const SFX = {
  boop: require('@/assets/sounds/boop.wav'),
  pop: require('@/assets/sounds/pop.wav'),
  chime: require('@/assets/sounds/chime.wav'),
  loud: require('@/assets/sounds/loud.wav'),
  tick: require('@/assets/sounds/tick.wav'),
  spark: require('@/assets/sounds/spark.wav'),
  nope: require('@/assets/sounds/nope.wav'),
} as const;
export type Sfx = keyof typeof SFX;

const LOOPS: Record<Exclude<FocusSound, 'none'>, number> = {
  brown: require('@/assets/sounds/brown.m4a'),
  rain: require('@/assets/sounds/rain.m4a'),
  keys: require('@/assets/sounds/keys.m4a'),
};

const settings = () => useAppStore.getState().settings;
const players = new Map<string, AudioPlayer>();

function player(key: string, source: number): AudioPlayer {
  let p = players.get(key);
  if (!p) {
    p = createAudioPlayer(source);
    players.set(key, p);
  }
  return p;
}

/** Respect the in-app sound toggle; iOS silent switch is respected by default (playsInSilentMode false). */
export async function configureAudio() {
  await setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: settings().mixWithMusic ? 'mixWithOthers' : 'duckOthers',
    shouldPlayInBackground: true, // focus loops keep going when the screen locks
  });
}

export function play(name: Sfx, opts: { force?: boolean } = {}) {
  const s = settings();
  if (!s.sound && !opts.force) return;
  try {
    const p = player(name, SFX[name]);
    p.volume = s.volume;
    void p.seekTo(0);
    p.play();
  } catch {
    // sound is never critical
  }
}

export const previewNudgeSound = (s: NudgeSound) => play(s, { force: true });

let loopKey: string | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

function fade(p: AudioPlayer, to: number, ms: number, done?: () => void) {
  if (fadeTimer) clearInterval(fadeTimer);
  const from = p.volume;
  const steps = Math.max(1, Math.round(ms / 50));
  let i = 0;
  fadeTimer = setInterval(() => {
    i += 1;
    p.volume = from + ((to - from) * i) / steps;
    if (i >= steps) {
      if (fadeTimer) clearInterval(fadeTimer);
      fadeTimer = null;
      done?.();
    }
  }, 50);
}

/** Focus soundscape with a 600 ms fade in/out (docs/03). Free: brown, rain, keys. */
export function startLoop(kind: FocusSound) {
  stopLoop(true);
  if (kind === 'none') return;
  const p = player(`loop-${kind}`, LOOPS[kind]);
  p.loop = true;
  p.volume = 0;
  void p.seekTo(0);
  p.play();
  loopKey = `loop-${kind}`;
  fade(p, settings().volume * 0.8, 600);
}

export function stopLoop(immediate = false) {
  if (!loopKey) return;
  const p = players.get(loopKey);
  loopKey = null;
  if (!p) return;
  if (immediate) {
    p.pause();
    return;
  }
  fade(p, 0, 600, () => p.pause());
}
