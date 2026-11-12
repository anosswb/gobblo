/** iOS + web: no Android widget (the iOS widget comes with the Xcode / EAS iOS build). */
export const widgetsSupported = false;
export function updateWidgets() {}
export async function redrawWidgetsNow(): Promise<void> {}
export async function addWidgetToHomeScreen(): Promise<boolean> {
  return false;
}
