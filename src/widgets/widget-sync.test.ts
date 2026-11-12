/**
 * Placed home-screen widgets must show what the app just saved.
 *
 * Anass 2026-11-08: the widget stayed one change behind (zustand persist runs listeners BEFORE
 * it writes storage). Anass 2026-11-12: in the release APK both widgets stayed on "Laundry", a
 * bite that was gone. The old version of this test replaced react-native-android-widget with a
 * fake, so it never ran the library's own code: a render that throws inside the library's
 * un-awaited loop was lost, nothing was drawn, the old picture stayed and nobody was told.
 * These tests run the REAL library JS down to the native module (a fake AndroidWidget module
 * that records what would be drawn).
 */
// jest.mock calls below are hoisted above these imports by babel-jest
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { reportWidgetError, scrubErrorText, widgetTrailForTests } from '@/lib/crash';
import { useAppStore } from '@/state/app-store';

import { widgetTaskHandler } from './task-handler';
import { redrawWidgetsNow, updateWidgets } from './update.android';
import { readWidgetData } from './widget-data';

/** What the fake native module was asked to draw: one entry per placed widget. */
const mockNative = {
  placed: { NextBite: [11], NextBiteSquare: [12], PetSmall: [13] } as Record<string, number[]>,
  draws: [] as { name: string; id: number; tree: string }[],
};
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform.OS = 'android';
  RN.NativeModules.AndroidWidget = {
    getWidgetInfo: async (widgetName: string) =>
      (mockNative.placed[widgetName] ?? []).map((widgetId) => ({ widgetName, widgetId, width: 320, height: 160, screenInfo: {} })),
    drawWidgetById: (config: object, name: string, id: number) => {
      mockNative.draws.push({ name, id, tree: JSON.stringify(config) });
    },
    requestPinWidget: async () => true,
  };
  return RN;
});

const mockMem = new Map<string, string | number>();
jest.mock('@/lib/storage', () => {
  const storage = {
    getString: (k: string) => mockMem.get(k) as string | undefined,
    getNumber: (k: string) => mockMem.get(k) as number | undefined,
    set: (k: string, v: string | number) => void mockMem.set(k, v),
    remove: (k: string) => void mockMem.delete(k),
  };
  return {
    storage,
    mmkvStateStorage: {
      getItem: (k: string) => storage.getString(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.remove(k),
    },
  };
});

const mockLinking = { broken: false };
jest.mock('expo-linking', () => ({
  createURL: (path: string) => {
    // what expo-linking does when it cannot read the app config
    if (mockLinking.broken) throw new Error('expo-linking needs access to the expo-constants manifest');
    return `gobblo://${path.replace(/^\//, '')}`;
  },
}));
jest.mock('@/components/icon', () => ({ sfSymbol: (n: string) => n }));
jest.mock('@/lib/crash', () => {
  const actual = jest.requireActual('@/lib/crash');
  return { ...actual, reportWidgetError: jest.fn(actual.reportWidgetError), setCrashReports: jest.fn() };
});
// the task handler imports './update' (the iOS file under jest): use the Android one
jest.mock('./update', () => jest.requireActual('./update.android'));

/** Let the library's un-awaited per-widget loop finish. */
const settle = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
  await new Promise<void>((r) => setImmediate(() => r()));
};

const drawnWith = (text: string) => mockNative.draws.filter((d) => d.tree.includes(`"${text}"`)).map((d) => d.name);

const bites = () => useAppStore.getState().bites;

function resetPlate(...texts: string[]) {
  useAppStore.setState({ bites: [] });
  if (texts.length) useAppStore.getState().addBites(texts.map((text) => ({ text, size: 1 as const })));
}

describe('widget sync (real library JS, fake native module)', () => {
  beforeEach(() => {
    mockNative.draws.length = 0;
    mockNative.placed = { NextBite: [11], NextBiteSquare: [12], PetSmall: [13] };
    mockLinking.broken = false;
    (reportWidgetError as jest.Mock).mockClear();
  });

  it('reading inside a store listener sees the OLD save (why the widget lagged)', () => {
    resetPlate();
    let seen: string | null | undefined;
    const unsub = useAppStore.subscribe(() => {
      seen = readWidgetData().bite?.text ?? null;
    });
    useAppStore.getState().addBites([{ text: 'call the bank', size: 0 }]);
    unsub();
    expect(seen).toBeNull();
    expect(readWidgetData().bite?.text).toBe('Call the bank');
  });

  it('feeding Laundry and adding Hh redraws every placed widget with Hh, never Laundry', async () => {
    jest.useFakeTimers();
    resetPlate('laundry');
    const unsub = useAppStore.subscribe((s, prev) => {
      if (s.bites !== prev.bites) updateWidgets();
    });
    useAppStore.setState({ bites: bites().filter((b) => b.text !== 'Laundry') });
    useAppStore.getState().addBites([{ text: 'hh', size: 1 }]);
    expect(mockNative.draws).toHaveLength(0); // waits for the save
    jest.advanceTimersByTime(200);
    jest.useRealTimers();
    await settle();
    unsub();
    expect(mockNative.draws.map((d) => `${d.name}#${d.id}`).sort()).toEqual(['NextBite#11', 'NextBiteSquare#12', 'PetSmall#13']);
    expect(drawnWith('Hh').sort()).toEqual(['NextBite', 'NextBiteSquare']); // the 1×1 shows the pet only
    expect(drawnWith('Laundry')).toEqual([]);
  });

  it('a render that throws still redraws (no stale bite) and is reported without the bite text', async () => {
    resetPlate('hh');
    mockLinking.broken = true; // deep links cannot be built: the Start / Add buttons
    await redrawWidgetsNow();
    await settle();
    // before the fix: the error was lost inside the library's loop, nothing was drawn,
    // the home screen kept the old bite and nothing reached Sentry
    expect(drawnWith('Hh').sort()).toEqual(['NextBite', 'NextBiteSquare']);
    expect(mockNative.draws.every((d) => !d.tree.includes('OPEN_URI'))).toBe(true); // buttons open the app instead
    const calls = (reportWidgetError as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every(([stage]) => stage === 'link')).toBe(true);
    expect(JSON.stringify(calls)).not.toContain('Hh');
  });

  it('a widget kind that fails to draw does not stop the others, and the failure is reported', async () => {
    resetPlate('hh');
    const RN = jest.requireActual('react-native');
    const real = RN.NativeModules.AndroidWidget.getWidgetInfo;
    RN.NativeModules.AndroidWidget.getWidgetInfo = async (name: string) => {
      if (name === 'NextBiteSquare') throw new Error('binder died');
      return real(name);
    };
    const found = await redrawWidgetsNow();
    await settle();
    RN.NativeModules.AndroidWidget.getWidgetInfo = real;
    expect(found).toEqual({ NextBite: 1, NextBiteSquare: 0, PetSmall: 1 });
    expect(mockNative.draws.map((d) => d.name).sort()).toEqual(['NextBite', 'PetSmall']);
    expect((reportWidgetError as jest.Mock).mock.calls.map(([stage]) => stage)).toEqual(['request:NextBiteSquare']);
  });

  it('counts placed widgets (0 = the widgets on the home screen belong to another install)', async () => {
    mockNative.placed = {};
    resetPlate('hh');
    const found = await redrawWidgetsNow();
    expect(found).toEqual({ NextBite: 0, NextBiteSquare: 0, PetSmall: 0 });
    expect(widgetTrailForTests().at(-1)).toMatchObject({ step: 'redraw', big: 0, square: 0, small: 0, left: 1 });
    // the trail is numbers only
    expect(JSON.stringify(widgetTrailForTests())).not.toContain('Hh');
  });

  it('several quick changes make one redraw', async () => {
    jest.useFakeTimers();
    resetPlate('a');
    updateWidgets();
    updateWidgets();
    updateWidgets();
    jest.advanceTimersByTime(200);
    jest.useRealTimers();
    await settle();
    expect(mockNative.draws).toHaveLength(3); // one per placed widget
  });

  it('the headless task draws the current bite, and a broken render still draws', async () => {
    resetPlate('hh');
    const drawn: string[] = [];
    const props = (widgetAction: WidgetTaskHandlerProps['widgetAction']): WidgetTaskHandlerProps => ({
      widgetInfo: { widgetName: 'NextBite', widgetId: 11, width: 320, height: 160, screenInfo: { screenHeightDp: 800, screenWidthDp: 400, density: 3, densityDpi: 480, fontScale: 1 } },
      widgetAction,
      clickActionData: {},
      renderWidget: (w) => void drawn.push(JSON.stringify(w)),
    });
    await widgetTaskHandler(props('WIDGET_UPDATE'));
    mockLinking.broken = true;
    await widgetTaskHandler(props('WIDGET_ADDED'));
    expect(drawn).toHaveLength(2);
    expect(drawn.every((d) => d.includes('"Hh"'))).toBe(true);
  });

  it('error text is scrubbed of anything in quotes', () => {
    expect(scrubErrorText('Cannot read "Text mom back" of undefined')).toBe('Cannot read "…" of undefined');
    expect(scrubErrorText('bad ‘my secret’ value')).toBe('bad "…" value');
  });
});
