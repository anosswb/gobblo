import type { Bite } from '@/state/schema';

import { moveToTop, plate, splitBite } from './logic';
import { biteTimes, defaultPickedDay, endOfWeekKey, laterGroups, onPlate, setTime, setWhen, timeOn, whenOf } from './when';

const bite = (p: Partial<Bite> = {}): Bite => ({ id: 'a', text: 'Write the report', size: 3, createdAt: 0, order: 0, ...p });
// Wednesday 12 Nov 2025, 10:00
const wed = new Date(2025, 10, 12, 10, 0);

describe('when chip', () => {
  it('Today is the default and stays on the plate', () => {
    expect(onPlate(bite(), '2025-11-12')).toBe(true);
    expect(whenOf(bite(), '2025-11-12')).toBe('today');
  });

  it('Tomorrow waits in Later until its day, then comes onto the plate', () => {
    const b = setWhen(bite(), 'tomorrow', wed, true);
    expect(b.showOn).toBe('2025-11-13');
    expect(onPlate(b, '2025-11-12')).toBe(false);
    expect(whenOf(b, '2025-11-12')).toBe('tomorrow');
    expect(onPlate(b, '2025-11-13')).toBe(true);
    expect(plate([b], '2025-11-12')).toHaveLength(0);
    expect(plate([b], '2025-11-13')).toHaveLength(1);
  });

  it('This week shows up on the last day of the week', () => {
    expect(endOfWeekKey(wed, true)).toBe('2025-11-16'); // Sunday
    expect(endOfWeekKey(wed, false)).toBe('2025-11-15'); // Saturday
    expect(endOfWeekKey(new Date(2025, 10, 16, 12), true)).toBe('2025-11-16'); // on Sunday: today
  });

  it('Someday never comes onto the plate by itself', () => {
    const b = setWhen(bite(), 'someday', wed, true);
    expect(onPlate(b, '2099-01-01')).toBe(false);
  });

  it('a time moves with the day and is dropped for This week / Someday', () => {
    const today = setTime(bite(), 17 * 60, wed);
    expect(new Date(today.at!).getDate()).toBe(12);
    const tomorrow = setWhen(today, 'tomorrow', wed, true);
    expect(new Date(tomorrow.at!).getDate()).toBe(13);
    expect(new Date(tomorrow.at!).getHours()).toBe(17);
    expect(setWhen(today, 'week', wed, true).at).toBeUndefined();
    expect(setTime(today, null, wed).at).toBeUndefined();
  });

  it('1 am belongs to the pet day before (the day starts at 4 am)', () => {
    const at = new Date(timeOn('2025-11-12', 60));
    expect(at.getDate()).toBe(13);
    expect(at.getHours()).toBe(1);
  });

  it('groups Later and lists only future, uneaten times', () => {
    const list = [
      setWhen(bite({ id: 's' }), 'someday', wed, true),
      setWhen(bite({ id: 't' }), 'tomorrow', wed, true),
      setWhen(bite({ id: 'w' }), 'week', wed, true),
      bite({ id: 'n' }),
    ];
    expect(laterGroups(list, '2025-11-12').map((g) => g.when)).toEqual(['tomorrow', 'week', 'someday']);
    const timed = [setTime(bite({ id: 'x' }), 9 * 60, wed), setTime(bite({ id: 'y' }), 18 * 60, wed)];
    expect(biteTimes(timed, wed).map((t) => t.id)).toEqual(['y']);
  });
});

describe('pick a date', () => {
  it('a picked date waits in Later, then comes onto the plate on its pet day at 4 am', () => {
    const b = setWhen(bite(), 'date', wed, true, '2025-12-24');
    expect(b.when).toBe('date');
    expect(b.showOn).toBe('2025-12-24');
    expect(whenOf(b, '2025-12-23')).toBe('date');
    expect(onPlate(b, '2025-12-23')).toBe(false);
    expect(whenOf(b, '2025-12-24')).toBe('today');
    expect(plate([b], '2025-12-24')).toHaveLength(1);
  });

  it('today or a past day means Today; the default is the day after tomorrow', () => {
    expect(setWhen(bite(), 'date', wed, true, '2025-11-12').when).toBeUndefined();
    expect(setWhen(bite(), 'date', wed, true, '2025-11-01').when).toBeUndefined();
    expect(setWhen(bite(), 'date', wed, true).when).toBeUndefined();
    expect(defaultPickedDay(wed)).toBe('2025-11-14');
    // at 2 am it is still yesterday's pet day
    expect(defaultPickedDay(new Date(2025, 10, 13, 2))).toBe('2025-11-14');
  });

  it('a time lands on the picked day and moves with it', () => {
    const b = setTime(setWhen(bite(), 'date', wed, true, '2025-12-24'), 9 * 60, wed);
    expect(new Date(b.at!).getDate()).toBe(24);
    expect(new Date(b.at!).getHours()).toBe(9);
    const moved = setWhen(b, 'date', wed, true, '2026-01-02');
    expect(new Date(moved.at!).getMonth()).toBe(0);
    expect(new Date(moved.at!).getDate()).toBe(2);
    expect(biteTimes([moved], wed).map((t) => t.id)).toEqual(['a']);
  });

  it('Later groups by day: Tomorrow first, then each date, This week where it falls, Someday last', () => {
    const list = [
      setWhen(bite({ id: 's' }), 'someday', wed, true),
      setWhen(bite({ id: 'd2' }), 'date', wed, true, '2025-12-01'),
      setWhen(bite({ id: 'w' }), 'week', wed, true), // Sun 16
      setWhen(bite({ id: 'd1' }), 'date', wed, true, '2025-11-14'),
      setWhen(bite({ id: 'd1b', order: 1 }), 'date', wed, true, '2025-11-14'),
      setWhen(bite({ id: 'dt' }), 'date', wed, true, '2025-11-13'), // tomorrow
      setWhen(bite({ id: 't' }), 'tomorrow', wed, true),
    ];
    const g = laterGroups(list, '2025-11-12');
    expect(g.map((x) => x.day ?? x.when)).toEqual(['tomorrow', '2025-11-14', 'week', '2025-12-01', 'someday']);
    expect(g[0].bites.map((b) => b.id).sort()).toEqual(['dt', 't']);
    expect(g[1].bites.map((b) => b.id)).toEqual(['d1', 'd1b']);
  });
});

describe('plate actions', () => {
  const list = [bite({ id: 'a', order: 0 }), bite({ id: 'b', order: 1 }), bite({ id: 'c', order: 2 })];

  it('Do this first moves a bite to the top', () => {
    expect(plate(moveToTop(list, 'c'), '').map((b) => b.id)).toEqual(['c', 'a', 'b']);
  });

  it('Break it into steps puts the steps in the big bite’s place', () => {
    const r = splitBite(list, 'b', [
      { text: 'open the doc', size: 0 },
      { text: 'write 3 lines', size: 1 },
    ]);
    expect(plate(r.bites, '').map((b) => b.text)).toEqual(['Write the report', 'Open the doc', 'Write 3 lines', 'Write the report']);
    expect(r.bites.find((b) => b.id === 'b')).toBeUndefined();
    expect(splitBite(list, 'b', [{ text: ' ', size: 0 }]).bites).toBe(list);
  });
});
