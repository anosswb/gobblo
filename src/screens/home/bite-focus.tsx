import { BlurView } from 'expo-blur';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon, type IconName } from '@/components/icon';
import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import type { Bite } from '@/state/schema';
import { distance, duration, easing, scale as scales, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { BiteRowBody } from './bite-row';
import { BiteFocusContext, type BiteFocusCtx, type FocusRect } from './focus-context';
import { liftTarget, MENU_GAP, MENU_ITEM_H, menuHeight, swipeRemoves, tabBarClearance } from './focus-logic';

const h = en.home;
const LIFT = 0.03; // the lifted bite grows 3 %
const MENU_W = 248;

type ActionKey = 'start' | 'first' | 'later' | 'remove';
type Item = { key: ActionKey; icon: IconName; label: string; danger?: boolean };
type Phase = 'holding' | 'open' | 'dragging' | 'closing';
type Focus = { bite: Bite; rect: FocusRect; targetY: number; items: Item[]; phase: Phase };

export type FocusActions = {
  onStart: (b: Bite) => void;
  onFirst: (b: Bite) => void;
  /** only offered for bites on today's plate (a bite already in Later has no "Later") */
  onLater: (b: Bite) => void;
  onRemove: (b: Bite) => void;
};

const itemsFor = (b: Bite): Item[] => [
  { key: 'start', icon: 'play', label: h.actStart },
  { key: 'first', icon: 'toTop', label: h.actFirst },
  ...(b.when ? [] : [{ key: 'later' as const, icon: 'calendar' as const, label: h.actLater }]),
  { key: 'remove', icon: 'trash', label: h.actRemove, danger: true },
];

/**
 * Long-press focus mode for a bite (docs/16 point 6, iOS context-menu style). The hold gesture
 * lives on each row (feed-drag.tsx HoldBite); this draws the lifted copy, the dim (+ blur on
 * iOS; Android dims only, blur is slow there) and the menu above everything on Home, in the
 * row's exact place (moved up only if the menu would hit the tab bar). The lifted copy can be
 * swiped left to remove: the only swipe-to-delete in the app. Tap outside or Android back closes.
 * Reduce Motion: no lift or scale, the dim and the menu just fade.
 */
export function BiteFocusProvider({ actions, children }: PropsWithChildren<{ actions: FocusActions }>) {
  const { colors, scheme, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const container = useAnimatedRef<View>();
  const boxH = useRef(0);
  const [focus, setFocusState] = useState<Focus | null>(null);
  const cur = useRef<Focus | null>(null);
  const token = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setFocus = (f: Focus | null) => {
    cur.current = f;
    setFocusState(f);
  };

  const dim = useSharedValue(0);
  const menu = useSharedValue(0);
  const card = useSharedValue(0);
  const lift = useSharedValue(0);
  const y = useSharedValue(0);
  const tx = useSharedValue(0);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clearTimer, []);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    token.current++;
    dim.set(0);
    menu.set(0);
    card.set(0);
    lift.set(0);
    tx.set(0);
    cur.current = null;
    setFocusState(null);
  }, [dim, menu, card, lift, tx]);

  const fadeOut = () => {
    const t = { duration: duration.quick, easing: easing.smoothOut };
    dim.set(withTiming(0, t));
    menu.set(withTiming(0, t));
  };

  /** 'back': the bite settles into its row again; 'fade': it just fades (the row moved or left) */
  const close = (how: 'back' | 'fade') => {
    const f = cur.current;
    if (!f || f.phase === 'closing' || f.phase === 'dragging') return;
    fadeOut();
    const back = how === 'back' && !reduceMotion;
    const ms = back ? duration.fast : duration.quick;
    if (back) {
      // exits are calmer than entrances: a timed settle, never a bounce on close
      y.set(withTiming(f.rect.y, { duration: ms, easing: easing.smoothOut }));
      lift.set(withTiming(0, { duration: ms, easing: easing.smoothOut }));
    } else {
      card.set(withTiming(0, { duration: ms, easing: easing.smoothOut }));
    }
    setFocus({ ...f, phase: 'closing' });
    const mine = ++token.current;
    clearTimer();
    timer.current = setTimeout(() => {
      if (token.current === mine) reset();
    }, ms);
  };

  const run = (key: ActionKey) => {
    const f = cur.current;
    if (!f || (f.phase !== 'open' && f.phase !== 'holding')) return;
    const b = f.bite;
    if (key === 'start') {
      close('back');
      actions.onStart(b);
    } else {
      close('fade');
      if (key === 'first') actions.onFirst(b);
      else if (key === 'later') actions.onLater(b);
      else actions.onRemove(b);
    }
  };

  const ctx: BiteFocusCtx = {
    container,
    liftedId: focus && focus.phase !== 'dragging' ? focus.bite.id : null,
    onHold: (id, rect) => {
      const b = useAppStore.getState().bites.find((x) => x.id === id);
      if (!b) return;
      clearTimer();
      token.current++;
      const items = itemsFor(b);
      const targetY = liftTarget({
        y: rect.y,
        h: rect.h,
        menuH: menuHeight(items.length),
        top: insets.top + space.s,
        bottom: (boxH.current || rect.y + rect.h + 1000) - tabBarClearance(insets.bottom),
      });
      haptics.medium();
      const enter = { duration: duration.fast, easing: easing.smoothOut };
      tx.set(0);
      card.set(1);
      y.set(rect.y);
      if (reduceMotion) {
        y.set(targetY);
        lift.set(0);
      } else {
        y.set(withSpring(targetY, spring.apple));
        lift.set(withSpring(1, spring.snappy));
      }
      dim.set(withTiming(1, enter));
      menu.set(withTiming(1, enter));
      setFocus({ bite: b, rect, targetY, items, phase: 'holding' });
    },
    onDragStart: () => {
      const f = cur.current;
      if (!f) return;
      // the pet must be visible to aim at: the dim, the menu and the copy all step aside
      fadeOut();
      card.set(withTiming(0, { duration: duration.quick }));
      lift.set(0);
      setFocus({ ...f, phase: 'dragging' });
    },
    onHoldRelease: (canceled) => {
      const f = cur.current;
      if (!f || f.phase !== 'holding') return;
      if (canceled) close('back');
      else setFocus({ ...f, phase: 'open' });
    },
    onDragEnd: () => {
      if (cur.current?.phase === 'dragging') reset();
    },
  };

  // Android back closes focus mode first
  useEffect(() => {
    if (!focus) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close('back');
      return true;
    });
    return () => sub.remove();
  });

  // leaving Home (a tab tap) drops focus mode at once
  useFocusEffect(
    useCallback(() => () => reset(), [reset]),
  );

  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.get() }));
  const liftStyle = useAnimatedStyle(() => ({
    opacity: card.get(),
    transform: [{ translateY: y.get() }, { scale: 1 + LIFT * lift.get() }],
  }));
  const swipeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.get() }], shadowOpacity: 0.35 * dim.get() }));
  const revealStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, -tx.get() / 60) }));
  const menuStyle = useAnimatedStyle(() => {
    const m = menu.get();
    if (reduceMotion) return { opacity: m };
    return { opacity: m, transform: [{ translateY: (1 - m) * -distance.small }, { scale: scales.modal + (1 - scales.modal) * m }] };
  });

  const open = focus?.phase === 'open';
  const w = focus?.rect.w ?? 0;
  const swipe = usePanGesture({
    enabled: open,
    activeOffsetX: [-12, 12],
    failOffsetY: [-12, 12],
    onUpdate: (e) => {
      'worklet';
      const t = e.translationX;
      tx.set(t < 0 ? t : t * 0.15); // only left means something; right just resists
    },
    onDeactivate: (e) => {
      'worklet';
      if (!e.canceled && swipeRemoves(tx.get(), e.velocityX, w)) {
        tx.set(withTiming(-w - space.xxl, { duration: duration.quick, easing: easing.strongOut }));
        scheduleOnRN(run, 'remove');
      } else {
        tx.set(withSpring(0, spring.snappy));
      }
    },
  });

  const menuW = focus ? Math.min(MENU_W, focus.rect.w) : MENU_W;

  return (
    <BiteFocusContext.Provider value={ctx}>
      <View style={styles.fill} onLayout={(e) => (boxH.current = e.nativeEvent.layout.height)}>
        {children}
        <Animated.View
          ref={container}
          collapsable={false}
          pointerEvents={!focus ? 'box-none' : focus.phase === 'dragging' || focus.phase === 'closing' ? 'none' : 'auto'}
          accessibilityViewIsModal={!!focus}
          style={StyleSheet.absoluteFill}>
          {focus ? (
            <>
              <Animated.View style={[StyleSheet.absoluteFill, dimStyle]}>
                {Platform.OS === 'ios' ? <BlurView intensity={24} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} /> : null}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} />
                <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={h.focusClose} onPress={() => close('back')} />
              </Animated.View>

              {/* window coordinates (the row's measured box), so `left` on purpose, like the drag food */}
              <Animated.View style={[styles.lifted, { left: focus.rect.x, width: focus.rect.w, height: focus.rect.h }, liftStyle]}>
                <Animated.View style={[styles.reveal, { backgroundColor: colors.danger }, revealStyle]}>
                  <Icon name="trash" size={20} color={colors.onPrimary} />
                </Animated.View>
                <GestureDetector gesture={swipe}>
                  <Animated.View style={[styles.shadow, { shadowColor: colors.primary }, swipeStyle]}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${focus.bite.text}. ${h.actStart}`}
                      onPress={() => run('start')}
                      style={[styles.ring, { borderColor: colors.primary, backgroundColor: colors.cardSolid }]}>
                      <BiteRowBody bite={focus.bite} lifted />
                    </Pressable>
                  </Animated.View>
                </GestureDetector>
              </Animated.View>

              <Animated.View
                accessibilityRole="menu"
                accessibilityLabel={h.focusMenu(focus.bite.text)}
                style={[
                  styles.menu,
                  { left: focus.rect.x, top: focus.targetY + focus.rect.h + MENU_GAP, width: menuW, backgroundColor: colors.cardSolid, borderColor: colors.cardBorder, shadowColor: colors.shadow },
                  menuStyle,
                ]}>
                {focus.items.map((it, i) => (
                  <Pressable
                    key={it.key}
                    accessibilityRole="menuitem"
                    accessibilityLabel={it.label}
                    onPress={() => {
                      haptics.select();
                      run(it.key);
                    }}
                    style={({ pressed }) => [
                      styles.item,
                      i > 0 ? { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth } : null,
                      pressed ? { backgroundColor: colors.cardAlt } : null,
                    ]}>
                    <Icon name={it.icon} size={18} color={it.danger ? colors.danger : colors.ink} />
                    <Text variant="body" style={it.danger ? { color: colors.danger } : undefined}>{it.label}</Text>
                  </Pressable>
                ))}
              </Animated.View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </BiteFocusContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  lifted: { position: 'absolute', top: 0 },
  reveal: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, borderRadius: radius.field, alignItems: 'flex-end', justifyContent: 'center', paddingEnd: space.xl },
  shadow: { flex: 1, borderRadius: radius.field, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 12 },
  ring: { flex: 1, borderRadius: radius.field, borderWidth: 2, overflow: 'hidden', justifyContent: 'center' },
  menu: { position: 'absolute', borderRadius: radius.field, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', shadowOpacity: 1, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: MENU_ITEM_H, paddingHorizontal: space.l },
});
