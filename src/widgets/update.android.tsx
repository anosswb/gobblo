'use no memo'; // react-native-android-widget needs plain functions: no React Compiler here

import { requestPinWidget, requestWidgetUpdate } from 'react-native-android-widget';

import { reportWidgetError, widgetStep } from '@/lib/crash';

import { renderWidgetSafe, WIDGET_NAME, WIDGET_NAMES, type WidgetName } from './next-bite-widget';
import { readWidgetData, type WidgetData } from './widget-data';

export const widgetsSupported = true;

/**
 * Redraw every placed home-screen widget right now, from what is saved in MMKV.
 *
 * Nothing in here may fail silently (Anass 2026-11-12: widgets stayed on an old bite and we had
 * no way to see why). Each widget kind is drawn on its own, a render error draws a safe fallback,
 * and every failure goes to Sentry with counts only (never a bite's text, docs/19).
 * Resolves with how many placed widgets of this app were found per kind.
 */
export async function redrawWidgetsNow(): Promise<Record<WidgetName, number>> {
  const found = { NextBite: 0, NextBiteSquare: 0, PetSmall: 0 } as Record<WidgetName, number>;
  let data: WidgetData;
  try {
    data = readWidgetData();
  } catch (e) {
    reportWidgetError('read', e);
    return found;
  }
  await Promise.all(
    WIDGET_NAMES.map((widgetName) =>
      requestWidgetUpdate({
        widgetName,
        renderWidget: () => {
          found[widgetName] += 1;
          return renderWidgetSafe(widgetName, data, 'update');
        },
      }).catch((e: unknown) => reportWidgetError(`request:${widgetName}`, e)),
    ),
  );
  widgetStep('redraw', { big: found.NextBite, square: found.NextBiteSquare, small: found.PetSmall, left: data.left });
  return found;
}

let pending: ReturnType<typeof setTimeout> | null = null;

/**
 * Redraw the widgets after bites, the pet, focus or Plus change. Waits a moment on purpose:
 * zustand's persist runs store listeners BEFORE it writes MMKV, so redrawing inside the listener
 * read the old save and placed widgets never changed (Anass 2026-11-08). Several quick changes
 * (feed = bite removed + sparks + stats) are merged into one redraw.
 */
export function updateWidgets() {
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    void redrawWidgetsNow();
  }, 120);
}

/** Ask the launcher to add a widget (Android 8+). */
export function addWidgetToHomeScreen(widgetName: WidgetName = WIDGET_NAME): Promise<boolean> {
  return requestPinWidget({ widgetName }).catch((e: unknown) => {
    reportWidgetError('pin', e);
    return false;
  });
}
