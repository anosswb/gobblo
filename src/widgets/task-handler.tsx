'use no memo'; // react-native-android-widget needs plain functions: no React Compiler here

import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { reportWidgetError, setCrashReports, widgetStep } from '@/lib/crash';

import { renderWidgetSafe, SKIP_ACTION, WIDGET_NAMES } from './next-bite-widget';
import { redrawWidgetsNow } from './update';
import { readWidgetData, shareUsageOn, skipWidgetBite } from './widget-data';

/**
 * Runs headless when Android asks a widget to draw (added, every 30 min, resized, app updated) or
 * a button is tapped. The app may be closed, so _layout has not started crash reports: start them
 * here (same switch as the app), and report any failure with counts only (docs/19).
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const name = props.widgetInfo.widgetName;
  const stage = `task:${props.widgetAction}`;
  try {
    setCrashReports(shareUsageOn());
    if (!(WIDGET_NAMES as readonly string[]).includes(name)) {
      reportWidgetError(`${stage}:unknown-widget`, new Error(`unknown widget name (${name.length} chars)`));
      return;
    }
    switch (props.widgetAction) {
      case 'WIDGET_CLICK':
        if (props.clickAction === SKIP_ACTION) {
          skipWidgetBite();
          // redraw every placed widget so they all agree on the next bite
          await redrawWidgetsNow();
          props.renderWidget(renderWidgetSafe(name, readWidgetData(), stage));
        }
        break;
      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED': {
        const data = readWidgetData();
        props.renderWidget(renderWidgetSafe(name, data, stage));
        widgetStep(stage, { left: data.left });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    reportWidgetError(stage, e);
  }
}
