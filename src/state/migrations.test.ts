import { migrate, mergeDefaults } from './migrations';
import { freshState, SCHEMA_VERSION, todayKey } from './schema';

describe('migrate', () => {
  it('returns fresh defaults for empty or broken data', () => {
    for (const bad of [undefined, null, 42, 'x', []]) {
      const s = migrate(bad, 0);
      expect(s.settings.theme).toBe('system');
      expect(s.bites).toEqual([]);
    }
  });

  it('keeps user data from an old unversioned save and fills new fields', () => {
    const old = {
      bites: [{ id: 'a', text: 'text mom back', size: 0, createdAt: 1, order: 0 }],
      pet: { name: 'Mochi', color: 'mint' },
      stats: { sparks: 12 },
      settings: { theme: 'dark', nudge: 'off' },
    };
    const s = migrate(old, 0);
    expect(s.bites).toHaveLength(1);
    expect(s.pet.name).toBe('Mochi');
    expect(s.pet.color).toBe('mint');
    expect(s.pet.owned).toEqual(['none']); // new field filled
    expect(s.stats.sparks).toBe(12);
    expect(s.stats.byPart).toEqual({ morning: 0, day: 0, night: 0 });
    expect(s.settings.theme).toBe('dark');
    expect(s.settings.nudge).toBe('off');
    expect(s.settings.quietStart).toBe(22);
  });

  it('is a no-op shape-wise for the current version', () => {
    const now = freshState(0);
    expect(migrate(now, SCHEMA_VERSION)).toEqual(now);
  });
});

describe('mergeDefaults', () => {
  it('takes saved arrays as they are', () => {
    expect(mergeDefaults({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] });
  });
});

describe('todayKey', () => {
  it('uses the local day', () => {
    expect(todayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('migration 2 -> 3', () => {
  it('moves the old default tint (cobalt) to the new default (pink) once', () => {
    const v2 = { ...freshState(), settings: { ...freshState().settings, accent: 'cobalt' } };
    expect(migrate(v2, 2).settings.accent).toBe('berry');
    const picked = { ...freshState(), settings: { ...freshState().settings, accent: 'jade' } };
    expect(migrate(picked, 2).settings.accent).toBe('jade');
  });
});
