import { fixSettings, migrate, mergeDefaults } from './migrations';
import { dayKey, freshState, SCHEMA_VERSION, todayKey } from './schema';

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
  it('dayKey starts the pet day at 4 am', () => {
    expect(dayKey(new Date(2026, 0, 6, 3, 59))).toBe('2026-01-05');
    expect(dayKey(new Date(2026, 0, 6, 4, 0))).toBe('2026-01-06');
    expect(dayKey(new Date(2026, 2, 1, 2))).toBe('2026-02-28');
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

describe('colour themes (palette)', () => {
  it('an old save without a palette loads with Ink and keeps its old accent', () => {
    const old = { ...freshState(), settings: { theme: 'dark', accent: 'jade' } };
    const s = migrate(old, SCHEMA_VERSION);
    expect(s.settings.palette).toBe('ink');
    expect(s.settings.accent).toBe('jade');
    expect(s.settings.theme).toBe('dark');
    expect(migrate({ settings: { accent: 'cobalt' } }, 0).settings.palette).toBe('ink');
  });

  it('keeps a chosen palette', () => {
    const saved = { ...freshState(), settings: { ...freshState().settings, palette: 'sage' } };
    expect(migrate(saved, SCHEMA_VERSION).settings.palette).toBe('sage');
  });
});

describe('share anonymous usage (docs/19)', () => {
  it('an old save without the switch loads with it on, and keeps everything else', () => {
    const { shareUsage: _drop, ...oldSettings } = freshState().settings;
    const old = { ...freshState(), settings: { ...oldSettings, theme: 'dark' } };
    const s = migrate(old, SCHEMA_VERSION);
    expect(s.settings.shareUsage).toBe(true);
    expect(s.settings.theme).toBe('dark');
    expect(mergeDefaults(freshState(), old).settings.shareUsage).toBe(true);
  });

  it('keeps it off once the user turned it off', () => {
    const saved = { ...freshState(), settings: { ...freshState().settings, shareUsage: false } };
    expect(migrate(saved, SCHEMA_VERSION).settings.shareUsage).toBe(false);
  });
});

describe('focus sounds', () => {
  it('a saved "keys" (removed) becomes rain, at boot and in the merge', () => {
    const old = { ...freshState(), settings: { ...freshState().settings, focusSound: 'keys' } };
    expect(migrate(old, SCHEMA_VERSION).settings.focusSound).toBe('rain');
    expect(fixSettings(mergeDefaults(freshState(), old)).settings.focusSound).toBe('rain');
  });
  it('an unknown sound becomes none; current sounds stay', () => {
    const bad = { ...freshState(), settings: { ...freshState().settings, focusSound: 'zzz' } };
    expect(migrate(bad, SCHEMA_VERSION).settings.focusSound).toBe('none');
    for (const k of ['none', 'rain', 'fire', 'autumn', 'brown']) {
      const ok = { ...freshState(), settings: { ...freshState().settings, focusSound: k } };
      expect(migrate(ok, SCHEMA_VERSION).settings.focusSound).toBe(k);
    }
  });
});
