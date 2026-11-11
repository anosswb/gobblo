import { beforeSend, setEnabled, track } from './analytics';
import { adReason, bucket, clean, EVENTS, SECOND_BUCKETS, screenName, type EventName, type EventProps } from './analytics-events';
import { scrubEvent, setCrashReports } from './crash';

/**
 * docs/16 #12: "a test fails the build if an event carries free text".
 * 1. Type level: no event prop can be typed `string` (tsc --noEmit runs on this file).
 * 2. Table level: every prop is a boolean, a number or a short list of code-defined values.
 * 3. Runtime: clean() and beforeSend() drop any string that is not one of those values.
 */

// 1. If any prop of any event accepted a plain `string`, this type would not be `never`.
type StringProps = {
  [E in EventName]: { [K in keyof EventProps<E>]-?: string extends NonNullable<EventProps<E>[K]> ? `${E}.${K & string}` : never }[keyof EventProps<E>];
}[EventName];
const noStringProps: [StringProps] extends [never] ? true : false = true;

describe('analytics: no free text, ever', () => {
  it('no event prop is typed as a plain string', () => {
    expect(noStringProps).toBe(true);
    // @ts-expect-error a bite title is not one of the allowed sources
    expect(clean('bite_added', { source: 'buy milk' } satisfies EventProps<'bite_added'>)).toEqual({});
    // @ts-expect-error unknown event names do not compile
    track('typed_text', { text: 'hello' });
  });

  it('every prop is bool, num or a short list of code values', () => {
    for (const [event, props] of Object.entries(EVENTS)) {
      expect(event).toMatch(/^[a-z_]{3,24}$/);
      for (const [key, spec] of Object.entries(props as Record<string, unknown>)) {
        expect(key).toMatch(/^[a-z_]{2,16}$/);
        if (spec === 'bool' || spec === 'num') continue;
        expect(Array.isArray(spec)).toBe(true);
        const list = spec as readonly unknown[];
        expect(list.length).toBeGreaterThan(0);
        expect(list.length).toBeLessThanOrEqual(40);
        for (const v of list) expect([event, key, v, typeof v === 'string' && /^[a-zA-Z0-9_-]{1,24}$/.test(v)]).toEqual([event, key, v, true]);
      }
    }
  });

  it('drops free text, unknown keys and wrong types at runtime', () => {
    const sneaky = { source: 'Call mum about the rent', size: 2, title: 'Call mum', petName: 'Bean' } as Record<string, unknown>;
    expect(clean('bite_added', sneaky)).toEqual({ size: 2 });
    expect(clean('bite_added', { source: 'dump', size: '2' } as Record<string, unknown>)).toEqual({ source: 'dump' });
    expect(clean('app_opened', { first_open: 'yes' } as Record<string, unknown>)).toEqual({});
    expect(clean('session_end', { seconds: Number.NaN })).toEqual({});
    expect(clean('not_an_event', { a: 1 })).toBeNull();
  });

  it('beforeSend drops events that are not ours and person properties', () => {
    expect(beforeSend({ event: '$opt_in', properties: {} })).toBeNull();
    expect(beforeSend({ event: '$autocapture', properties: { $el_text: 'Buy milk' } })).toBeNull();
    const out = beforeSend({
      event: 'focus_started',
      properties: { minutes: 2, preset: '2min', source: 'Write essay', $os_name: 'iOS', $device_name: 'Anna’s phone', note: 'secret' },
      $set: { name: 'x' },
    });
    expect(out).toEqual({ event: 'focus_started', properties: { minutes: 2, preset: '2min', $os_name: 'iOS' } });
  });

  it('track never throws, with or without a key or the switch', () => {
    setEnabled(true);
    expect(() => track('bite_fed', { size: 1, sparks: 3, how: 'timer' })).not.toThrow();
    setEnabled(false);
    expect(() => track('rating_prompted')).not.toThrow();
  });
});

describe('analytics helpers', () => {
  it('maps routes to fixed screen names, never params', () => {
    expect(screenName('/')).toEqual({ name: 'home' });
    expect(screenName('/me')).toEqual({ name: 'me' });
    expect(screenName('/settings/privacy')).toEqual({ name: 'settings_privacy' });
    expect(screenName('/settings/whatever')).toEqual({ name: 'other' });
    expect(screenName('/tools/calm')).toEqual({ name: 'tool', tool: 'calm' });
    expect(screenName('/tools/my secret')).toEqual({ name: 'tool', tool: 'other' });
    expect(screenName('/dump?text=buy%20milk')).toEqual({ name: 'dump' });
  });

  it('buckets durations and keeps only the ad reason prefix', () => {
    expect(bucket(4, SECOND_BUCKETS)).toBe(10);
    expect(bucket(61, SECOND_BUCKETS)).toBe(120);
    expect(bucket(99999, SECOND_BUCKETS)).toBe(3601);
    expect(adReason('load-error:3')).toBe('load-error');
    expect(adReason('consent-error:Network down | load-timeout')).toBe('load-timeout');
    expect(adReason('something new')).toBe('other');
    expect(adReason(null)).toBe('none');
  });
});

describe('crash reports scrubbing', () => {
  it('sends nothing when the switch is off', () => {
    setCrashReports(false);
    expect(scrubEvent({ message: 'x' })).toBeNull();
  });

  it('strips user, request, extra, messages, breadcrumbs and the device name', () => {
    setCrashReports(true);
    const out = scrubEvent({
      message: 'state: Buy milk',
      user: { id: '1' },
      request: { url: 'x' },
      extra: { bite: 'Buy milk' },
      breadcrumbs: [{ message: 'typed' }],
      server_name: 'Anna’s phone',
      contexts: { device: { name: 'Anna’s phone', model: 'iPhone15,2' }, state: { bites: [] } },
      exception: { values: [{ type: 'TypeError', value: 'x'.repeat(500) }] },
    });
    expect(out).toEqual({
      contexts: { device: { model: 'iPhone15,2' } },
      exception: { values: [{ type: 'TypeError', value: 'x'.repeat(200) }] },
    });
    setCrashReports(false);
  });
});
