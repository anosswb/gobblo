'use no memo'; // react-native-android-widget needs plain functions: no React Compiler here

import * as Linking from 'expo-linking';
import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

import type { WidgetData } from './widget-data';

/**
 * Home-screen widget "Next bite" (Start Kit, docs/13: the #1 extra in the feature panel).
 * Native widget views can't read React theme tokens, so its palette lives here (light + dark).
 */
const PALETTE = {
  light: { bg: '#FFFFFF', ink: '#1C1C1E', ink2: '#6C6C70', chip: '#F2F2F7', tint: '#E5307D', onTint: '#FFFFFF' },
  dark: { bg: '#1C1C1E', ink: '#FFFFFF', ink2: '#AEAEB2', chip: '#2C2C2E', tint: '#FF4F96', onTint: '#FFFFFF' },
} as const;

export const WIDGET_NAME = 'NextBite';

/** Uses the running app's own scheme (gobblo:// or gobblo-preview:// for the preview build). */
export const startUri = (biteId: string) => Linking.createURL('/start', { queryParams: { bite: biteId } });

export function NextBiteWidget({ data, scheme }: { data: WidgetData; scheme: 'light' | 'dark' }) {
  'use no memo';
  const c = PALETTE[scheme];
  const { bite } = data;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: c.bg, borderRadius: 24, padding: 14, flexDirection: 'row', alignItems: 'center', flexGap: 12 }}>
      <ImageWidget image={require('../../assets/images/icon.png')} imageWidth={56} imageHeight={56} radius={16} />
      <FlexWidget style={{ flex: 1, flexDirection: 'column', flexGap: 4 }}>
        <TextWidget text={bite ? `${data.petName} is hungry for` : `${data.petName}’s plate is empty`} style={{ fontSize: 12, color: c.ink2 }} />
        <TextWidget
          text={bite ? bite.text : 'Tap to dump your brain'}
          maxLines={2}
          truncate="END"
          style={{ fontSize: 16, fontWeight: '700', color: c.ink }}
        />
        {bite ? (
          <FlexWidget
            clickAction={data.canStart ? 'OPEN_URI' : 'OPEN_APP'}
            clickActionData={data.canStart ? { uri: startUri(bite.id) } : undefined}
            style={{ backgroundColor: data.canStart ? c.tint : c.chip, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 }}>
            <TextWidget
              text={data.canStart ? '▶  Start 2 min' : `Open · ${data.left} on your plate`}
              style={{ fontSize: 13, fontWeight: '700', color: data.canStart ? c.onTint : c.ink }}
            />
          </FlexWidget>
        ) : null}
      </FlexWidget>
    </FlexWidget>
  );
}