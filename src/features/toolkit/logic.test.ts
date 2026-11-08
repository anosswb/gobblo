import { dayKey } from '@/state/schema';

import { BREATH_PATTERNS, cycleSeconds, dayNumber, nextStep, TIPS, tipForDay, tipIndexForDay, UNSTICK_STEPS } from './logic';

const key = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

describe('daily tip', () => {
  it('has at least 60 tips with unique ids and no medical words', () => {
    expect(TIPS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(TIPS.map((t) => t.id)).size).toBe(TIPS.length);
    const banned = /\b(treat|treats|cure|cures|clinically|diagnos|medication|dose)\b/i;
    for (const t of TIPS) expect(t.text).not.toMatch(banned);
  });

  it('gives the same tip all day, and a new one after 4 am', () => {
    const morning = dayKey(new Date(2026, 10, 8, 9));
    const lateNight = dayKey(new Date(2026, 10, 9, 2)); // 2 am still belongs to the 8th
    const nextDay = dayKey(new Date(2026, 10, 9, 5));
    expect(tipForDay(morning)).toEqual(tipForDay(lateNight));
    expect(tipForDay(nextDay)).not.toEqual(tipForDay(morning));
  });

  it('shows every tip once before repeating', () => {
    const start = dayNumber('2026-01-01');
    const seen = new Set<number>();
    for (let i = 0; i < TIPS.length; i++) {
      const d = new Date(Date.UTC(2026, 0, 1) + i * 86_400_000);
      const k = key(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      expect(dayNumber(k)).toBe(start + i);
      seen.add(tipIndexForDay(k));
    }
    expect(seen.size).toBe(TIPS.length);
  });

  it('works for any list size, including ones that share a factor with the stride', () => {
    for (const count of [1, 2, 37, 74, 60]) {
      const idx = tipIndexForDay('2026-11-08', count);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(count);
    }
  });
});

describe('unstick picker', () => {
  it('never repeats the last step', () => {
    for (let prev = 0; prev < UNSTICK_STEPS.length; prev++) {
      for (const r of [0, 0.3, 0.5, 0.99]) {
        const n = nextStep(prev, () => r);
        expect(n).not.toBe(prev);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(UNSTICK_STEPS.length);
      }
    }
  });

  it('can reach every step', () => {
    const hits = new Set<number>();
    for (let i = 0; i < UNSTICK_STEPS.length; i++) hits.add(nextStep(null, () => i / UNSTICK_STEPS.length));
    expect(hits.size).toBe(UNSTICK_STEPS.length);
  });
});

describe('breathing', () => {
  it('patterns are short and start by breathing in', () => {
    for (const p of BREATH_PATTERNS) {
      expect(p.phases[0].kind).toBe('in');
      expect(cycleSeconds(p)).toBeLessThanOrEqual(20);
    }
  });
});
