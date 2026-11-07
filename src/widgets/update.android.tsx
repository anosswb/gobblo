'use no memo'; // react-native-android-widget needs plain functions: no React Compiler here

import { requestPinWidget, requestWidgetUpdate } from 'react-native-android-widget';

import { renderWidgetFor, WIDGET_NAME, WIDGET_NAMES, type WidgetName } from './next-bite-widget';
import { readWidgetData } from './widget-data';

export const widgetsSupported = true;

/** Redraw every placed home-screen widget after bites, the pet, focus or Plus change. */
export function updateWidgets() {
  const data = readWidgetData();
  for (const widgetName of WIDGET_NAMES) {
    void requestWidgetUpdate({ widgetName, renderWidget: () => renderWidgetFor(widgetName, data) }).catch(() => undefined);
  }
}

/** Ask the launcher to add a widget (Android 8+). */
export function addWidgetToHomeScreen(widgetName: WidgetName = WIDGET_NAME): Promise<boolean> {
  return requestPinWidget({ widgetName }).catch(() => false);
}
