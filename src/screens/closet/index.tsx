import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { skyOf, StageBackdrop, stageIsDark } from '@/components/stage-backdrop';
import { Text } from '@/components/text';
import { capFirst } from '@/features/bites/logic';
import { COLORS, FACES, HATS, ROOMS, type HomeMood, type Item, type RoomId, type Slot } from '@/features/closet/items';
import { itemOpen, priceOf, type ShopCtx } from '@/features/closet/shop';
import { useLook } from '@/features/closet/use-look';
import { buyItemNow } from '@/features/closet/use-shop';
import { PLUS_VISIBLE } from '@/config/monetization';
import { STAGES } from '@/features/progress/logic';
import { daysUntilWeek } from '@/features/weekly/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { MOODS, Pet, type Mood } from '@/pet/pet';
import type { FaceId, HatId } from '@/pet/wardrobe';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { petColors, radius, space, type PetColor } from '@/theme/tokens';

const daysBadge = (days: number) => (days <= 1 ? en.closet.tomorrowBadge : en.closet.daysBadge(days));

const t = en.closet;
type Tab = 'mood' | Slot;
const TABS: Tab[] = ['mood', 'hat', 'face', 'color', 'room'];

/** A tile in the grid: a mood (the face on Home) or a wardrobe item. */
type Tile = { key: string; tab: Tab; label: string; item?: Item; mood?: HomeMood };

/**
 * Closet (Anass 2026-11-07): dress the pet. Faces (the emote shown on Home), hats, glasses,
 * colours and rooms (the Home background). Level rewards unlock as you level up; the premium set
 * is Plus. Tap = wear it (saved). Locked = preview it on the big pet + how to unlock, and (spark
 * shop, features/closet/shop) get that one item now with sparks: "Get it · ✦ 40".
 */
export function ClosetScreen() {
  const { colors, scheme } = useTheme();
  const look = useLook();
  const pet = useAppStore((s) => s.pet);
  const patchPet = useAppStore((s) => s.patchPet);
  const firstOpen = useAppStore((s) => s.settings.firstOpen);
  const sparks = useAppStore((s) => s.stats.sparks);
  const [tab, setTab] = useState<Tab>('mood');
  const [preview, setPreview] = useState<Tile | null>(null);
  /** the tile just bought (shows a small "it's yours" line, no big celebration) */
  const [got, setGot] = useState<string | null>(null);
  const shop: ShopCtx = { level: look.level, total: look.total, plus: look.plus, week: look.week, owned: look.owned };
  const sky = skyOf(new Date().getHours());

  const tiles: Tile[] =
    tab === 'mood'
      ? [{ key: 'auto', tab, label: t.auto, mood: 'auto' as const }, ...MOODS.map((m) => ({ key: m, tab, label: capFirst(m), mood: m }))]
      : (tab === 'hat' ? HATS : tab === 'face' ? FACES : tab === 'color' ? COLORS : ROOMS).filter((i: Item) => i.unlock.type !== 'week' || i.unlock.week <= look.week + 1) // open weekly colours + the next one
          .map((i: Item) => ({ key: i.id, tab, label: i.name, item: i }));

  const unlocked = (tile: Tile) => !tile.item || itemOpen(tile.item, shop);
  const price = (tile: Tile | null) => (tile?.item ? priceOf(tile.item, shop) : null);
  const worn = (tile: Tile) =>
    tile.mood !== undefined ? look.homeMood === tile.mood : tile.item ? look[tile.item.slot as 'hat' | 'face' | 'color' | 'room'] === tile.item.id : false;

  // what the big pet shows: the saved look, with the previewed tile on top
  const show = {
    mood: (preview?.mood && preview.mood !== 'auto' ? preview.mood : look.homeMood === 'auto' ? 'happy' : look.homeMood) as Mood,
    hat: (preview?.item?.slot === 'hat' ? preview.item.id : look.hat) as HatId,
    face: (preview?.item?.slot === 'face' ? preview.item.id : look.face) as FaceId,
    color: (preview?.item?.slot === 'color' ? preview.item.id : look.color) as PetColor,
    room: (preview?.item?.slot === 'room' ? preview.item.id : look.room) as RoomId,
  };

  const choose = (tile: Tile) => {
    setPreview(tile);
    setGot(null);
    if (!unlocked(tile)) {
      // for sale = a calm preview; not for sale (Legend) = the old "locked" nudge
      if (price(tile) !== null) haptics.select();
      else {
        haptics.warning();
        play('nope');
      }
      return;
    }
    haptics.select();
    play('pop');
    if (tile.mood !== undefined) patchPet({ mood: tile.mood });
    else if (tile.item) patchPet({ [tile.item.slot]: tile.item.id } as Partial<typeof pet>);
  };

  const getIt = () => {
    if (!preview?.item) return;
    const r = buyItemNow(preview.item);
    if (!r.ok) {
      haptics.warning();
      return;
    }
    haptics.success();
    play('spark');
    setGot(preview.key);
  };

  const previewPrice = preview && !unlocked(preview) ? price(preview) : null;
  const short = previewPrice !== null ? Math.max(0, previewPrice - sparks) : 0;

  const status = (() => {
    if (preview?.item && got === preview.key) return t.got(preview.item.name);
    if (preview && !unlocked(preview) && preview.item) {
      const u = preview.item.unlock;
      if (previewPrice === null) return u.type === 'level' ? t.lockedLevel(u.level) : t.lockedPlus;
      const why =
        u.type === 'level' ? t.earlyLevel(u.level) : u.type === 'week' ? t.earlyWeek(daysUntilWeek(firstOpen, u.week)) : PLUS_VISIBLE ? t.plusItem : t.sparkItem;
      return short > 0 ? `${t.short(short)} · ${why}` : why;
    }
    if (tab === 'mood') return look.homeMood === 'auto' ? t.homeAuto(pet.name) : t.homeFace(pet.name, look.homeMood);
    const it = [...HATS, ...FACES, ...COLORS, ...ROOMS].find((i) => i.slot === tab && i.id === look[tab as 'hat' | 'face' | 'color' | 'room']);
    return it ? t.wearing(it.name) : '';
  })();
  // the quiet "everything at once" link: only where Plus really works (hide, don't fake)
  const plusLink = preview?.item?.unlock.type === 'pack' && !unlocked(preview) && PLUS_VISIBLE;
  const onDarkStage = stageIsDark(show.room, sky, scheme);
  const stageTone = onDarkStage ? 'onFocus' : 'onLightScene';
  const hasActions = previewPrice !== null;

  return (
    <Screen eyebrow={t.eyebrow(look.level, STAGES[look.stage].name)} title={t.title}>
      {/* the big preview */}
      <View style={[styles.hero, { borderColor: colors.cardBorder }]}>
        <StageBackdrop room={show.room} sky={sky} glowY={64} />
        {/* the pet moves up a little while the buy row is showing, so nothing covers it */}
        <Animated.View layout={LinearTransition.duration(duration.fast)} style={hasActions ? styles.petUp : null}>
          <Pet size={150} color={show.color} mood={show.mood} stage={look.stage} hat={show.hat} face={show.face} onPress={() => play('boop')} accessibilityLabel={pet.name} />
        </Animated.View>
        <Animated.View key={status} entering={FadeIn.duration(duration.quick)} style={styles.status}>
          <Text variant="subhead" tone={stageTone} style={styles.center} accessibilityLiveRegion="polite">{status}</Text>
          {hasActions && short === 0 ? (
            <PressScale accessibilityRole="button" onPress={getIt} style={[styles.buyBtn, { backgroundColor: colors.primary }]}>
              <Text variant="bodyBold" tone="onPrimary">{t.getIt(previewPrice)}</Text>
            </PressScale>
          ) : hasActions ? (
            <Text variant="caption" tone={stageTone} style={styles.center}>{t.sparksFrom(pet.name)}</Text>
          ) : null}
          {plusLink ? (
            <PressScale accessibilityRole="link" hitSlop={10} onPress={() => router.push('/plus')} style={styles.linkTap}>
              <Text variant="caption" tone={stageTone} style={styles.link}>{t.orPlus}</Text>
            </PressScale>
          ) : null}
        </Animated.View>
      </View>

      {/* tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((k) => {
          const on = k === tab;
          return (
            <PressScale
              key={k}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => {
                setTab(k);
                setPreview(null);
                haptics.select();
              }}
              style={[styles.tab, { backgroundColor: on ? colors.primary : colors.card, borderColor: on ? colors.primary : colors.cardBorder }]}>
              <Text variant="bodyBold" tone={on ? 'onPrimary' : 'ink'}>{t.tabs[k]}</Text>
            </PressScale>
          );
        })}
      </ScrollView>

      {/* grid */}
      <View style={styles.grid}>
        {tiles.map((tile) => {
          const open = unlocked(tile);
          const on = worn(tile);
          const it = tile.item;
          const cost = it && !open ? priceOf(it, shop) : null;
          const when = it && !open ? (it.unlock.type === 'level' ? t.lvBadge(it.unlock.level) : it.unlock.type === 'week' ? daysBadge(daysUntilWeek(firstOpen, it.unlock.week)) : null) : null;
          // level/weekly: "Lv 9 · ✦ 20"; Plus items: "✦ 50"; Legend: "Lv 20"
          const lockLabel = it && !open ? [when, cost !== null ? t.sparkBadge(cost) : null].filter(Boolean).join(' · ') : null;
          const a11yLock = it && !open ? [when, cost !== null ? t.priceA11y(cost) : null].filter(Boolean).join(', ') : null;
          return (
            <Pressable
              key={`${tab}-${tile.key}`}
              accessibilityRole="button"
              accessibilityLabel={`${tile.label}${a11yLock ? `, ${a11yLock}` : ''}`}
              accessibilityState={{ selected: on }}
              onPress={() => choose(tile)}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: on ? colors.primarySoft : colors.card,
                  borderColor: on ? colors.primaryInk : colors.cardBorder,
                  borderWidth: on ? 2 : StyleSheet.hairlineWidth,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}>
              <View style={[styles.thumb, !open && styles.dim]}>
                {tab === 'room' && it ? (
                  <View style={[styles.roomSwatch, { borderColor: colors.cardBorder }]}>
                    <StageBackdrop room={it.id as RoomId} sky={sky} glowY={80} />
                    <Pet size={34} color={look.color} mood="happy" stage={look.stage} hat={look.hat} still />
                  </View>
                ) : (
                  <Pet
                    size={56}
                    still
                    stage={look.stage}
                    mood={tile.mood && tile.mood !== 'auto' ? tile.mood : 'happy'}
                    color={tab === 'color' && it ? (it.id as PetColor) : look.color}
                    hat={tab === 'hat' && it ? (it.id as HatId) : look.hat}
                    face={tab === 'face' && it ? (it.id as FaceId) : look.face}
                  />
                )}
                {tile.mood === 'auto' ? (
                  <View style={styles.autoBadge}>
                    <Icon name="sparkle" size={14} color={colors.primaryInk} />
                  </View>
                ) : null}
              </View>
              <Text variant="caption" tone={on ? 'primary' : 'ink2'} numberOfLines={1}>{tile.label}</Text>
              {lockLabel && it ? (
                <View style={[styles.lock, { backgroundColor: it.unlock.type === 'pack' ? colors.primary : colors.cardSolid, borderColor: colors.cardBorder }]}>
                  <Icon name="lock" size={10} color={it.unlock.type === 'pack' ? colors.onPrimary : colors.ink2} />
                  <Text variant="caption" tone={it.unlock.type === 'pack' ? 'onPrimary' : 'ink2'} style={styles.lockText}>{lockLabel}</Text>
                </View>
              ) : null}
              {tab === 'color' && it ? <View style={[styles.dot, { backgroundColor: petColors[it.id as PetColor] }]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  hero: { height: 300, borderRadius: radius.scene, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  status: { position: 'absolute', bottom: space.l, start: space.l, end: space.l, alignItems: 'center', gap: space.s },
  petUp: { marginBottom: 56 },
  buyBtn: { minHeight: 44, paddingHorizontal: space.xl, borderRadius: radius.button, justifyContent: 'center' },
  linkTap: { minHeight: 24, justifyContent: 'center' },
  link: { textDecorationLine: 'underline' },
  tabs: { gap: space.s, paddingVertical: space.xs },
  tab: { minHeight: 40, paddingHorizontal: space.l, borderRadius: radius.button, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  cell: { width: '31.6%', alignItems: 'center', gap: space.xs, paddingVertical: space.m, paddingHorizontal: space.xs, borderRadius: radius.card - 6 },
  thumb: { height: 74, alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.42 },
  roomSwatch: { width: 64, height: 64, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, borderWidth: StyleSheet.hairlineWidth },
  autoBadge: { position: 'absolute', top: 2, end: 2 },
  lock: { position: 'absolute', top: 6, end: 6, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  lockText: { fontSize: 10, lineHeight: 13 },
  dot: { position: 'absolute', top: 8, start: 8, width: 10, height: 10, borderRadius: 5 },
});
