import { ASKING_MS, nextPetPhase, phaseTimeout, THANKS_MS } from './pet-me';

describe('pet me phases', () => {
  it('lifting the finger after petting says thanks', () => {
    expect(nextPetPhase('petting', 'lift')).toBe('thanks');
  });
  it('lifting does nothing in other phases', () => {
    for (const p of ['idle', 'thanks', 'asking', 'settled'] as const) expect(nextPetPhase(p, 'lift')).toBe(p);
  });
  it('petting again goes straight back to petting', () => {
    for (const p of ['idle', 'thanks', 'asking', 'settled'] as const) expect(nextPetPhase(p, 'pet')).toBe('petting');
  });
  it('timeouts walk thanks → asking → settled and then stop', () => {
    expect(nextPetPhase('thanks', 'timeout')).toBe('asking');
    expect(nextPetPhase('asking', 'timeout')).toBe('settled');
    expect(nextPetPhase('settled', 'timeout')).toBe('settled');
    expect(nextPetPhase('petting', 'timeout')).toBe('petting');
  });
  it('only thanks and asking have timers', () => {
    expect(phaseTimeout('thanks')).toBe(THANKS_MS);
    expect(phaseTimeout('asking')).toBe(ASKING_MS);
    expect(phaseTimeout('idle')).toBeNull();
    expect(phaseTimeout('petting')).toBeNull();
    expect(phaseTimeout('settled')).toBeNull();
  });
});
