import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { chop, DUMP_EXAMPLE } from '@/features/bites/chop';
import { FOOD } from '@/features/bites/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useLook } from '@/features/closet/use-look';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import type { Size } from '@/state/schema';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';
import { backOrHome } from '@/lib/nav';
import { BiteIcon } from '@/components/bite-icon';
import { Chips } from '@/components/settings-parts';
import { movedLabel, WHEN_LABEL } from '@/components/when-picker';
import { WHENS, type When } from '@/features/bites/when';

const d = en.dump;
type Edit = { size?: Size; removed?: boolean };

/**
 * Brain dump (docs/01 §5) as a native form sheet. Type or ramble; the bites appear live
 * underneath (no extra "chop" step). Tap the icon to change the size, × to drop one,
 * then "serve" puts them on Home where they pop in with a stagger. The pet watches,
 * hungry while empty, excited once there is food.
 */
export default function DumpScreen() {
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const look = useLook();
  const stage = look.stage;
  const addBites = useAppStore((s) => s.addBites);
  // "Break it into steps" from the start sheet opens this page for one big bite
  const { split } = useLocalSearchParams<{ split?: string }>();
  const big = useAppStore((s) => (split ? s.bites.find((b) => b.id === split) : undefined));
  // big dumps felt heavy on the plate (panel): choose where they go
  const [when, setWhen] = useState<When>('today');
  const [text, setText] = useState('');
  const [edits, setEdits] = useState<Record<string, Edit>>({});

  const parsed = useMemo(() => chop(text), [text]);
  const items = parsed
    .map((b) => ({ ...b, key: b.text.toLowerCase(), size: edits[b.text.toLowerCase()]?.size ?? b.size }))
    .filter((b) => !edits[b.key]?.removed);

  const edit = (key: string, e: Edit) => setEdits((prev) => ({ ...prev, [key]: { ...prev[key], ...e } }));

  const serve = () => {
    if (!items.length) {
      haptics.warning();
      play('nope');
      return;
    }
    const st = useAppStore.getState();
    if (big) {
      st.splitBite(big.id, items.map((b) => ({ text: b.text, size: b.size })));
    } else {
      const ids = addBites(items.map((b) => ({ text: b.text, size: b.size })), 'dump');
      if (when !== 'today') for (const id of ids) st.setBiteWhen(id, when);
    }
    haptics.success();
    play('spark');
    backOrHome();
    setTimeout(() => toast(big ? d.splitServed(items.length) : when === 'today' ? d.served(items.length) : en.when.moved(movedLabel(when))), 350);
  };

  const enter = (i: number) => (reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast).delay(Math.min(i, 8) * 30));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.cardSolid }]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text variant="title2" accessibilityRole="header">{big ? d.splitTitle : d.title}</Text>
          <Text variant="subhead" tone="ink2">{big ? d.splitSub(big.text) : d.sub}</Text>
        </View>
        <PressScale accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} onPress={backOrHome} style={[styles.close, { backgroundColor: colors.fill }]}>
          <Icon name="close" size={14} weight="bold" color={colors.ink2} />
        </PressScale>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <View style={[styles.well, { backgroundColor: colors.fill }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={big ? d.splitPlaceholder : d.placeholder}
            placeholderTextColor={colors.ink3}
            multiline
            autoFocus={Platform.OS !== 'web'}
            maxLength={2000}
            accessibilityLabel={d.title}
            style={[styles.input, fonts.body, styles.noOutline, { color: colors.ink }]}
          />
          <View style={styles.wellBar}>
            {text || big ? (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => { setText(''); setEdits({}); haptics.light(); }}>
                <Text variant="caption" tone="ink2" style={styles.semi}>{d.clear}</Text>
              </Pressable>
            ) : (
              <PressScale accessibilityRole="button" onPress={() => { setText(DUMP_EXAMPLE); haptics.select(); play('pop'); }} style={[styles.example, { backgroundColor: colors.primarySoft }]}>
                <Icon name="sparkle" size={13} color={colors.primaryInk} />
                <Text variant="caption" tone="primary" style={styles.semi}>{d.example}</Text>
              </PressScale>
            )}
          </View>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Pet size={88} color={look.color} hat={look.hat} face={look.face} mood="hungry" stage={stage} />
            <Text variant="subhead" tone="ink2" style={styles.center}>{d.empty}</Text>
          </View>
        ) : (
          <Animated.View layout={reduceMotion ? undefined : LinearTransition.duration(duration.fast)} style={styles.preview}>
            <View style={styles.previewHead}>
              <Text variant="heading">{d.preview(items.length)}</Text>
              <Text variant="caption" tone="ink2">{d.previewHint}</Text>
            </View>
            <View style={[styles.list, { backgroundColor: colors.cardAlt }]}>
              {items.map((b, i) => (
                <Animated.View key={b.key} entering={enter(i)} exiting={reduceMotion ? undefined : FadeOut.duration(duration.quick)} layout={reduceMotion ? undefined : LinearTransition.duration(duration.fast)}>
                  <View style={[styles.row, i > 0 && { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth }]}>
                    <PressScale
                      accessibilityRole="button"
                      accessibilityLabel={`${b.text}: ${FOOD[b.size].label}. Change size`}
                      hitSlop={4}
                      onPress={() => {
                        edit(b.key, { size: ((b.size + 1) % 4) as Size });
                        haptics.select();
                        play('tick');
                      }}
                      style={[styles.food, { backgroundColor: colors.card }]}>
                      <BiteIcon text={b.text} size={b.size} />
                    </PressScale>
                    <View style={styles.flex}>
                      <Text variant="body" numberOfLines={2}>{b.text}</Text>
                      <Text variant="caption" tone="ink2">{FOOD[b.size].label} · ~{FOOD[b.size].min} min</Text>
                    </View>
                    <PressScale accessibilityRole="button" accessibilityLabel={d.remove(b.text)} hitSlop={10} onPress={() => { edit(b.key, { removed: true }); haptics.light(); }} style={[styles.remove, { backgroundColor: colors.fill }]}>
                      <Icon name="close" size={11} weight="bold" color={colors.ink2} />
                    </PressScale>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.l) }]}>
        {!big && items.length > 0 ? (
          <View style={styles.serveTo}>
            <Text variant="caption" tone="ink2" style={styles.semi}>{en.when.serveTo}</Text>
            <Chips<When> accessibilityLabel={en.when.serveTo} value={when} onChange={setWhen} options={DUMP_WHENS.map((v) => ({ value: v, label: WHEN_LABEL[v] }))} />
          </View>
        ) : null}
        <PressScale
          accessibilityRole="button"
          accessibilityState={{ disabled: items.length === 0 }}
          onPress={serve}
          style={[styles.serve, { backgroundColor: items.length ? colors.primary : colors.fill }]}>
          <Text variant="bodyBold" tone={items.length ? 'onPrimary' : 'ink3'}>{big ? d.splitServe(items.length) : d.serve(items.length)}</Text>
        </PressScale>
      </View>
    </View>
  );
}


/** A whole dump goes to one simple bucket; dates are picked per bite in its start sheet. */
const DUMP_WHENS = WHENS.filter((v) => v !== 'date');
const styles = StyleSheet.create({
  wrap: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  semi: { fontWeight: '600' },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.m, paddingHorizontal: space.xl, paddingTop: space.xl, paddingBottom: space.m },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: space.l, gap: space.l, paddingBottom: space.xl },
  well: { borderRadius: radius.card - 6, padding: space.m, gap: space.s },
  input: { minHeight: 120, maxHeight: 220, fontSize: typeScale.body, lineHeight: 24, textAlignVertical: 'top', paddingHorizontal: space.xs },
  noOutline: Platform.select({ web: { outlineStyle: 'none' }, default: {} }) as object,
  wellBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', minHeight: 32 },
  example: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.m, height: 32, borderRadius: radius.chip },
  empty: { alignItems: 'center', gap: space.s, paddingTop: space.l, paddingHorizontal: space.xl },
  preview: { gap: space.s },
  previewHead: { gap: 2, paddingHorizontal: space.xs },
  list: { borderRadius: radius.card - 6, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.m, minHeight: 60, paddingVertical: space.s },
  food: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 22, lineHeight: 28 },
  remove: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: space.l, paddingTop: space.s, gap: space.m },
  serveTo: { gap: space.xs },
  serve: { minHeight: 54, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
