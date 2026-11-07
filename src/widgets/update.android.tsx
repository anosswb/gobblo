import { requestPinWidget, requestWidgetUpdate } from 'react-native-android-widget';

import { NextBiteWidget, WIDGET_NAME } from './next-bite-widget';
import { readWidgetData } from './widget-data';

export const widgetsSupported = true;

/** Redraw the home-screen widget(s) after bites, the pet or Plus change. */
export function updateWidgets() {
  const data = readWidgetData();
  void requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => ({ light: <NextBiteWidget data={data} scheme="light" />, dark: <NextBiteWidget data={data} scheme="dark" /> }),
  }).catch(() => undefined);
}

/** Ask the launcher to add the widget (Android 8+). */
export function addWidgetToHomeScreen(): Promise<boolean> {
  return requestPinWidget({ widgetName: WIDGET_NAME }).catch(() => false);
}
