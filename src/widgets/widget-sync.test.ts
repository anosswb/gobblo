/**
 * Placed home-screen widgets must show what the app just saved (Anass 2026-11-08: the widget
 * stayed one change behind). zustand's persist runs listeners BEFORE it writes storage.
 */
// jest.mock calls below are hoisted above these imports by babel-jest
import { useAppStore } from '@/state/app-store';

import { redrawWidgetsNow, updateWidgets } from './update.android';
import { readWidgetData } from './widget-data';

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

jest.mock('@/components/icon', () => ({ sfSymbol: (n: string) => n }));

const mockDrawn: { name: string; bite: string | null }[] = [];
jest.mock('react-native-android-widget', () => ({
  requestWidgetUpdate: jest.fn(async ({ widgetName, renderWidget }: { widgetName: string; renderWidget: () => { light: { props: { data: { bite: { text: string } | null } } } } }) => {
    mockDrawn.push({ name: widgetName, bite: renderWidget().light.props.data.bite?.text ?? null });
  }),
  requestPinWidget: jest.fn(),
  FlexWidget: () => null,
  OverlapWidget: () => null,
  SvgWidget: () => null,
  TextWidget: () => null,
}));


describe('widget sync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDrawn.length = 0;
  });
  afterEach(() => jest.useRealTimers());

  it('reading inside a store listener sees the OLD save (why the widget lagged)', () => {
    let seen: string | null | undefined;
    const unsub = useAppStore.subscribe(() => {
      seen = readWidgetData().bite?.text ?? null;
    });
    useAppStore.getState().addBites([{ text: 'call the bank', size: 0 }]);
    unsub();
    expect(seen).toBeNull();
    expect(readWidgetData().bite?.text).toBe('Call the bank');
  });

  it('updateWidgets draws the bite that was just added', async () => {
    const unsub = useAppStore.subscribe((s, prev) => {
      if (s.bites !== prev.bites) updateWidgets();
    });
    useAppStore.getState().addBites([{ text: 'water the plant', size: 0 }]);
    expect(mockDrawn).toHaveLength(0); // waits for the save
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    unsub();
    expect(mockDrawn.map((d) => d.name)).toEqual(['NextBite', 'NextBiteSquare', 'PetSmall']);
    // plate order: the first bite on the plate is shown
    expect(mockDrawn[0].bite).toBe(readWidgetData().bite?.text);
    expect(readWidgetData().left).toBe(2);
  });

  it('several quick changes make one redraw', async () => {
    useAppStore.getState().addBites([{ text: 'a', size: 0 }]);
    updateWidgets();
    updateWidgets();
    updateWidgets();
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    expect(mockDrawn).toHaveLength(3); // one per widget kind
  });

  it('redrawWidgetsNow draws at once (leaving the app, Skip)', async () => {
    redrawWidgetsNow();
    await Promise.resolve();
    expect(mockDrawn).toHaveLength(3);
  });
});
