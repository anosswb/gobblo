'use no memo'; // react-native-android-widget needs plain functions: no React Compiler here

import { requestPinWidget, requestWidgetUpdate } from 'react-native-android-widget';

import { renderWidgetFor, WIDGET_NAME, WIDGET_NAMES, type WidgetName } from './next-bite-widget';
import { readWidgetData } from './widget-data';

export const widgetsSupported = true;

/** Redraw every placed home-screen widget right now, from what is saved in MMKV. */
export function redrawWidgetsNow() {
  const data = readWidgetData();
  for (const widgetName of WIDGET_NAMES) {
    void requestWidgetUpdate({ widgetName, renderWidget: () => renderWidgetFor(widgetName, data) }).catch(() => undefined);
  }
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
    redrawWidgetsNow();
  }, 120);
}

/** Ask the launcher to add a widget (Android 8+). */
export function addWidgetToHomeScreen(widgetName: WidgetName = WIDGET_NAME): Promise<boolean> {
  return requestPinWidget({ widgetName }).catch(() => false);
}
