/** Pet me: idle → petting → thanks → asking → settled. Pure, so it is easy to test. */
export type PetPhase = 'idle' | 'petting' | 'thanks' | 'asking' | 'settled';
export type PetEvent = 'pet' | 'lift' | 'timeout';

/** How long the thank-you lasts, and how long the pet hopes for more. */
export const THANKS_MS = 2500;
export const ASKING_MS = 6000;

export function nextPetPhase(phase: PetPhase, event: PetEvent): PetPhase {
  if (event === 'pet') return 'petting';
  if (event === 'lift') return phase === 'petting' ? 'thanks' : phase;
  if (phase === 'thanks') return 'asking';
  if (phase === 'asking') return 'settled';
  return phase;
}

/** Time until the next automatic step, or null when the phase waits for the person. */
export function phaseTimeout(phase: PetPhase): number | null {
  return phase === 'thanks' ? THANKS_MS : phase === 'asking' ? ASKING_MS : null;
}

export const PET_MOOD = {
  idle: 'happy',
  petting: 'love',
  thanks: 'proud',
  asking: 'curious',
  settled: 'calm',
} as const;
