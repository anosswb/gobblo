'use no memo'; // react-native-android-widget needs plain functions: no React Compiler here

import * as Linking from 'expo-linking';
import { cloneElement, type ReactNode } from 'react';
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { reportWidgetError } from '@/lib/crash';

import { iconSvg, mix, petSvg } from './svg-art';
import type { WidgetData } from './widget-data';

/**
 * Android home-screen widgets, One UI style (Anass 2026-11-07: "1×1 and 2×2, more reactive,
 * like a UI"): big continuous corners, bold short text, a tinted tile in the pet's colour, real
 * buttons (Start, Skip, Add). Skip redraws in place, no app launch.
 *
 * - PetSmall (1×1): your pet in its colour and mood + how many bites wait. Tap = start / open.
 * - NextBiteSquare (2×2): the next bite with its icon, Start 2 min and Skip.
 * - NextBite (4×2, the original name so placed widgets keep working): pet tile + bite + 3 buttons.
 *
 * Native widget views can't read React theme tokens, so the palette lives here (light + dark).
 */
const PALETTE = {
  light: { bg: '#FBEEDD', ink: '#00171F', ink2: '#5E6F78', chip: '#F1DFC8', btn: '#003459', onBtn: '#FBEEDD' },
  dark: { bg: '#003459', ink: '#FBEEDD', ink2: '#A9C0CF', chip: '#0A4673', btn: '#FFD166', onBtn: '#00171F' },
} as const;
type Scheme = 'light' | 'dark';

export const WIDGET_NAME = 'NextBite';
export const SQUARE_WIDGET = 'NextBiteSquare';
export const SMALL_WIDGET = 'PetSmall';
export const WIDGET_NAMES = [WIDGET_NAME, SQUARE_WIDGET, SMALL_WIDGET] as const;
export type WidgetName = (typeof WIDGET_NAMES)[number];

/** Custom click: show the next bite (handled headless in task-handler.tsx). */
export const SKIP_ACTION = 'SKIP_BITE';

/**
 * Uses the running app's own scheme (gobblo:// or gobblo-preview:// for the preview build).
 * createURL throws when it cannot read the app config; a widget must still draw then, so a
 * missing link becomes null and the button just opens the app (OPEN_APP).
 */
function link(path: string, queryParams?: Record<string, string>): string | null {
  try {
    return Linking.createURL(path, queryParams ? { queryParams } : undefined);
  } catch (e) {
    reportWidgetError('link', e);
    return null;
  }
}
const startUri = (biteId: string) => link('/start', { bite: biteId });
const dumpUri = () => link('/dump');
const focusUri = () => link('/focus');
const clickTo = (uri: string | null) => (uri ? { clickAction: 'OPEN_URI', clickActionData: { uri } } : { clickAction: 'OPEN_APP' });

const RADIUS = 28;

function colorsFor(data: WidgetData, scheme: Scheme) {
  const c = PALETTE[scheme];
  return {
    ...c,
    // soft tile in the pet's colour, and a deeper shade for icons on it
    tint: scheme === 'light' ? mix(data.petColor, '#FFFFFF', 0.84) : mix(data.petColor, c.bg, 0.74),
    tintInk: scheme === 'light' ? mix(data.petColor, '#000000', 0.25) : mix(data.petColor, '#FFFFFF', 0.25),
  };
}

const clock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function headline(data: WidgetData): string {
  if (data.focus) return 'Focusing now';
  if (!data.bite) return data.fedToday ? `${data.petName} is full` : `${data.petName}’s plate is empty`;
  return data.left > 1 ? `Next bite · ${data.position} of ${data.left}` : 'Next bite';
}

function mainText(data: WidgetData): string {
  if (data.focus) return data.focus.text || 'Free focus';
  if (!data.bite) return data.fedToday ? `${data.fedToday} fed today. Nice.` : 'Add something small';
  return data.bite.text;
}

/** The black (or white in dark) capsule: Start / Add bites / the running timer. */
function PrimaryButton({ data, scheme, compact = false }: { data: WidgetData; scheme: Scheme; compact?: boolean }) {
  'use no memo';
  const c = PALETTE[scheme];
  // one tap starts 2 minutes from the home screen, free for everyone (the core loop is never gated)
  const label = data.focus ? `Ends ${clock(data.focus.endsAt)}` : !data.bite ? 'Add bites' : 'Start 2 min';
  const icon = data.focus ? 'timer' : !data.bite ? 'plus' : 'play';
  const uri = data.focus ? focusUri() : !data.bite ? dumpUri() : startUri(data.bite.id);
  return (
    <FlexWidget
      {...clickTo(uri)}
      style={{
        flex: 1,
        height: compact ? 40 : 44,
        backgroundColor: c.btn,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexGap: 6,
        paddingHorizontal: 10,
      }}>
      <SvgWidget svg={iconSvg(icon, c.onBtn, 2.4, icon === 'play')} style={{ width: 14, height: 14 }} />
      <TextWidget text={label} maxLines={1} style={{ fontSize: compact ? 13 : 14, fontWeight: '700', color: c.onBtn }} />
    </FlexWidget>
  );
}

/** Round chip button (Skip, Add). */
function RoundButton({ icon, scheme, action, uri = null, size = 44 }: { icon: 'skip' | 'plus'; scheme: Scheme; action?: string; uri?: string | null; size?: number }) {
  'use no memo';
  const c = PALETTE[scheme];
  return (
    <FlexWidget
      {...(action ? { clickAction: action } : clickTo(uri))}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' }}>
      <SvgWidget svg={iconSvg(icon, c.ink, 2.4)} style={{ width: 18, height: 18 }} />
    </FlexWidget>
  );
}

/** 1×1: the pet, its mood, and a count badge. */
export function PetSmallWidget({ data, scheme }: { data: WidgetData; scheme: Scheme }) {
  'use no memo';
  const c = colorsFor(data, scheme);
  const uri = data.focus ? focusUri() : data.bite ? startUri(data.bite.id) : null;
  return (
    <OverlapWidget
      {...clickTo(uri)}
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: c.tint, borderRadius: RADIUS }}>
      <FlexWidget style={{ height: 'match_parent', width: 'match_parent', alignItems: 'center', justifyContent: 'center' }}>
        <SvgWidget svg={petSvg(data.petColor, data.mood)} style={{ width: 46, height: 55 }} />
      </FlexWidget>
      {data.left > 0 || data.focus ? (
        <FlexWidget style={{ height: 'match_parent', width: 'match_parent', alignItems: 'flex-end', justifyContent: 'flex-start', padding: 7 }}>
          <FlexWidget style={{ height: 22, paddingHorizontal: 7, borderRadius: 11, backgroundColor: c.btn, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', flexGap: 2 }}>
            {data.focus ? (
              <SvgWidget svg={iconSvg('timer', c.onBtn, 2.8)} style={{ width: 11, height: 11 }} />
            ) : (
              <TextWidget text={String(data.left)} style={{ fontSize: 12, fontWeight: '800', color: c.onBtn }} />
            )}
          </FlexWidget>
        </FlexWidget>
      ) : null}
    </OverlapWidget>
  );
}

/** 2×2: icon tile + count, the bite in big bold type, Start + Skip. */
export function NextBiteSquareWidget({ data, scheme }: { data: WidgetData; scheme: Scheme }) {
  'use no memo';
  const c = colorsFor(data, scheme);
  const canSkip = !data.focus && data.left > 1;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: c.bg, borderRadius: RADIUS, padding: 14, flexDirection: 'column', justifyContent: 'space-between' }}>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
          {data.bite && !data.focus ? (
            <SvgWidget svg={iconSvg(data.bite.icon, c.tintInk, 2.2)} style={{ width: 20, height: 20 }} />
          ) : (
            <SvgWidget svg={petSvg(data.petColor, data.mood)} style={{ width: 28, height: 34 }} />
          )}
        </FlexWidget>
        {data.bite && !data.focus ? <RoundButton icon="plus" scheme={scheme} uri={dumpUri()} size={40} /> : null}
      </FlexWidget>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'column', flexGap: 2 }}>
        <TextWidget text={headline(data)} maxLines={1} style={{ fontSize: 12, fontWeight: '600', color: c.ink2 }} />
        <TextWidget text={mainText(data)} maxLines={2} truncate="END" style={{ fontSize: 17, fontWeight: '800', color: c.ink }} />
      </FlexWidget>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', flexGap: 8 }}>
        <PrimaryButton data={data} scheme={scheme} compact />
        {canSkip ? <RoundButton icon="skip" scheme={scheme} action={SKIP_ACTION} size={40} /> : null}
      </FlexWidget>
    </FlexWidget>
  );
}

/** 4×2: pet tile on the left, the bite and three buttons on the right. */
export function NextBiteWidget({ data, scheme }: { data: WidgetData; scheme: Scheme }) {
  'use no memo';
  const c = colorsFor(data, scheme);
  const canSkip = !data.focus && data.left > 1;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: c.bg, borderRadius: RADIUS, padding: 12, flexDirection: 'row', flexGap: 14 }}>
      <FlexWidget style={{ width: 104, height: 'match_parent', borderRadius: 20, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexGap: 4 }}>
        <SvgWidget svg={petSvg(data.petColor, data.mood)} style={{ width: 64, height: 77 }} />
        <TextWidget text={data.petName} maxLines={1} style={{ fontSize: 12, fontWeight: '700', color: c.tintInk }} />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, height: 'match_parent', flexDirection: 'column', justifyContent: 'space-between', paddingVertical: 2 }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'column', flexGap: 4 }}>
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6 }}>
            {data.bite && !data.focus ? <SvgWidget svg={iconSvg(data.bite.icon, c.ink2, 2.2)} style={{ width: 14, height: 14 }} /> : null}
            <TextWidget text={headline(data)} maxLines={1} style={{ fontSize: 12, fontWeight: '600', color: c.ink2 }} />
          </FlexWidget>
          <TextWidget text={mainText(data)} maxLines={2} truncate="END" style={{ fontSize: 19, fontWeight: '800', color: c.ink }} />
        </FlexWidget>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', flexGap: 8 }}>
          <PrimaryButton data={data} scheme={scheme} />
          {canSkip ? <RoundButton icon="skip" scheme={scheme} action={SKIP_ACTION} /> : null}
          {data.bite && !data.focus ? <RoundButton icon="plus" scheme={scheme} uri={dumpUri()} /> : null}
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

/** Both schemes of one widget, for renderWidget / requestWidgetUpdate. */
export function renderWidgetFor(name: string, data: WidgetData) {
  'use no memo';
  const W = name === SMALL_WIDGET ? PetSmallWidget : name === SQUARE_WIDGET ? NextBiteSquareWidget : NextBiteWidget;
  return { light: <W data={data} scheme="light" />, dark: <W data={data} scheme="dark" /> };
}

/**
 * The library builds the tree inside its own un-awaited loop, so an error there was lost and the
 * placed widget silently kept its old picture. Build here instead: on error, report it and draw
 * the plain "open the app" widget, so the home screen never shows a bite that is gone.
 */
export function renderWidgetSafe(name: string, data: WidgetData, stage: string) {
  'use no memo';
  const build = (d: WidgetData) => {
    const r = renderWidgetFor(name, d);
    // calling the components here surfaces their errors now, not inside the library
    return { light: expand(r.light), dark: expand(r.dark) };
  };
  try {
    return build(data);
  } catch (e) {
    reportWidgetError(`render:${stage}:${name}`, e);
    return build({ ...data, bite: null, focus: null, left: 0, position: 1, fedToday: 0 });
  }
}

/**
 * Runs every one of our function components down to the library's widget elements (what the
 * library's buildWidgetTree would do later), so any error is thrown here, inside our try.
 */
function expand(el: React.JSX.Element): React.JSX.Element {
  'use no memo';
  let node = el;
  while (typeof node.type === 'function' && !(node.type as { __name__?: string }).__name__) {
    node = (node.type as (p: unknown) => React.JSX.Element)(node.props);
  }
  const kids = (node.props as { children?: unknown }).children;
  if (kids === undefined || kids === null || typeof kids !== 'object') return node;
  const list = (Array.isArray(kids) ? kids : [kids]).flat(1) as unknown[];
  return cloneElement(node, undefined, ...list.map((k) => (k && typeof k === 'object' ? expand(k as React.JSX.Element) : (k as ReactNode))));
}
