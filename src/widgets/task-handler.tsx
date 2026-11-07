'use no memo'; // react-native-android-widget needs plain functions: no React Compiler here

import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { renderWidgetFor, SKIP_ACTION, WIDGET_NAMES } from './next-bite-widget';
import { updateWidgets } from './update';
import { readWidgetData, skipWidgetBite } from './widget-data';

/** Runs headless when Android asks a widget to draw (added, every 30 min, resized) or a button is tapped. */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const name = props.widgetInfo.widgetName;
  if (!(WIDGET_NAMES as readonly string[]).includes(name)) return;
  switch (props.widgetAction) {
    case 'WIDGET_CLICK':
      if (props.clickAction === SKIP_ACTION) {
        skipWidgetBite();
        // redraw every placed widget so they all agree on the next bite
        updateWidgets();
        props.renderWidget(renderWidgetFor(name, readWidgetData()));
      }
      break;
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(renderWidgetFor(name, readWidgetData()));
      break;
    default:
      break;
  }
}
