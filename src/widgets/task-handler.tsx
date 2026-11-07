import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { NextBiteWidget, WIDGET_NAME } from './next-bite-widget';
import { readWidgetData } from './widget-data';

/** Runs headless when Android asks the widget to draw (added, every 30 min, resized). */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== WIDGET_NAME) return;
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = readWidgetData();
      props.renderWidget({ light: <NextBiteWidget data={data} scheme="light" />, dark: <NextBiteWidget data={data} scheme="dark" /> });
      break;
    }
    default:
      break;
  }
}
