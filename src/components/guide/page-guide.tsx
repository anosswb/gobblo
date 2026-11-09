import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { GUIDES, guideCopy, type GuideId } from '@/i18n/guides.en';
import { haptics } from '@/lib/haptics';
import { useAppStore } from '@/state/app-store';
import { duration, easing } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { GuideDemo } from './demo';

const g = guideCopy;

/** Has this page's guide been shown once? (settings.guidesSeen, like tipDragSeen) */
export const guideSeen = (id: GuideId) => (useAppStore.getState().settings.guidesSeen ?? []).includes(id);

function markSeen(id: GuideId) {
  const st = useAppStore.getState();
  const seen = st.settings.guidesSeen ?? [];
  if (!seen.includes(id)) st.updateSettings({ guidesSeen: [...seen, id] });
}

/**
 * The "?" in a page header plus that page's guide. `auto` opens it by itself the first time the
 * page is opened (toolkit tools). One component for every page; only the steps differ
 * (i18n/guides.en.ts).
 */
export function GuideHelp({ id, auto = false, size }: { id: GuideId; auto?: boolean; size?: number }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!auto || guideSeen(id)) return;
    const t = setTimeout(() => setOpen(true), 450);
    return () => clearTimeout(t);
  }, [auto, id]);
  return (
    <>
      <HelpButton
        size={size}
        onPress={() => {
          haptics.select();
          setOpen(true);
        }}
      />
      <PageGuide
        id={id}
        visible={open}
        onClose={() => {
          setOpen(false);
          markSeen(id);
        }}
      />
    </>
  );
}

/** 44 pt glass "?" button (matches the other header buttons). */
export function HelpButton({ onPress, size = 44 }: { onPress: () => void; size?: number }) {
  const { colors } = useTheme();
  return (
    <PressScale accessibilityRole="button" accessibilityLabel={g.help} hitSlop={Math.max(0, (44 - size) / 2)} onPress={onPress}>
      <Glass interactive radius={size / 2} style={[styles.help, { width: size, height: size }]}>
        <Icon name="help" size={size > 36 ? 20 : 16} color={colors.ink} />
      </Glass>
    </PressScale>
  );
}

/** The guide sheet: pet demo, title, body, dots, Back / Next / Got it. Reduce Motion: fades only. */
export function PageGuide({ id, visible, onClose: done }: { id: GuideId; visible: boolean; onClose: () => void }) {
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const petName = useAppStore((s) => s.pet.name);
  const steps = GUIDES[id];
  const [i, setI] = useState(0);
  // next time it opens on step 1 again
  const onClose = () => {
    setI(0);
    done();
  };

  const step = steps[Math.min(i, steps.length - 1)];
  const fill = (s: string) => s.replaceAll('{pet}', petName);
  const last = i >= steps.length - 1;

  const enter = reduceMotion ? FadeIn.duration(duration.quick) : SlideInDown.duration(duration.verySlow).easing(easing.sheet);
  const exit = reduceMotion ? FadeOut.duration(duration.quick) : SlideOutDown.duration(duration.medium).easing(easing.sheet);
  const swap = FadeIn.duration(duration.fast);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      {visible ? (
        <View style={styles.fill}>
          <Animated.View entering={FadeIn.duration(duration.slow)} exiting={FadeOut.duration(duration.fast)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={g.close} style={styles.fill} onPress={onClose} />
          </Animated.View>
          <Animated.View
            entering={enter}
            exiting={exit}
            accessibilityViewIsModal
            style={[styles.sheet, { backgroundColor: colors.cardSolid, bottom: Math.max(insets.bottom, space.s), shadowColor: colors.shadow }]}>
            <View style={[styles.grabber, { backgroundColor: colors.fill2 }]} />
            <View style={styles.head}>
              <Text variant="caption" tone="ink2" style={styles.flex} accessibilityLiveRegion="polite">{g.step(i + 1, steps.length)}</Text>
              <PressScale accessibilityRole="button" accessibilityLabel={g.close} hitSlop={8} onPress={onClose} style={[styles.close, { backgroundColor: colors.fill }]}>
                <Icon name="close" size={14} weight="bold" color={colors.ink2} />
              </PressScale>
            </View>

            <Animated.View key={`${id}-${i}`} entering={swap} style={styles.body}>
              <GuideDemo kind={step.demo} label={fill(step.body)} />
              <Text variant="title2" accessibilityRole="header">{fill(step.title)}</Text>
              <Text variant="body" tone="ink2">{fill(step.body)}</Text>
            </Animated.View>

            <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {steps.map((_, k) => (
                <View key={k} style={[styles.dot, { backgroundColor: k === i ? colors.primary : colors.fill2, width: k === i ? 18 : 6 }]} />
              ))}
            </View>

            <View style={styles.actions}>
              {i > 0 ? (
                <PressScale accessibilityRole="button" onPress={() => { haptics.select(); setI(i - 1); }} style={[styles.btn, styles.btnSmall, { backgroundColor: colors.fill }]}>
                  <Text variant="bodyBold">{g.back}</Text>
                </PressScale>
              ) : null}
              <PressScale
                accessibilityRole="button"
                onPress={() => {
                  haptics.light();
                  if (last) onClose();
                  else setI(i + 1);
                }}
                style={[styles.btn, styles.flex, { backgroundColor: colors.primary }]}>
                <Text variant="bodyBold" tone="onPrimary">{last ? g.done : g.next}</Text>
              </PressScale>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  help: { alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  sheet: {
    position: 'absolute',
    start: space.s,
    end: space.s,
    borderRadius: radius.sheet,
    paddingHorizontal: space.xl,
    paddingTop: space.s,
    paddingBottom: space.l,
    gap: space.m,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  body: { gap: space.s },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space.xs },
  dot: { height: 6, borderRadius: 3 },
  actions: { flexDirection: 'row', gap: space.s },
  btn: { minHeight: 52, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  btnSmall: { minWidth: 96 },
});
