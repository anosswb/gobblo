import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { skyOf, StageBackdrop, stageIsDark } from '@/components/stage-backdrop';
import { Text } from '@/components/text';
import { capFirst } from '@/features/bites/logic';
import { COLORS, FACES, HATS, isUnlocked, ROOMS, type HomeMood, type Item, type RoomId, type Slot } from '@/features/closet/items';
import { useLook } from '@/features/closet/use-look';
import { PACKS } from '@/features/plus/catalog';
import { MONETIZATION } from '@/config/monetization';
import { STAGES } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { MOODS, Pet, type Mood } from '@/pet/pet';
import type { FaceId, HatId } from '@/pet/wardrobe';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { petColors, radius, space, type PetColor } from '@/theme/tokens';

/** Android earns packs with sparks: show the price, not "Plus" (panel: Android unlocks felt far away). */
const plusLock = MONETIZATION === 'ads' ? en.closet.sparkBadge(PACKS.makeItYours.sparks) : en.closet.plusBadge;

const t = en.closet;
type Tab = 'mood' | Slot;
const TABS: Tab[] = ['mood', 'hat', 'face', 'color', 'room'];

/** A tile in the grid: a mood (the face on Home) or a wardrobe item. */
type Tile = { key: string; tab: Tab; label: string; item?: Item; mood?: HomeMood };

/**
 * Closet (Anass 2026-11-07): dress the pet. Faces (the emote shown on Home), hats, glasses,
 * colours and rooms (the Home background). Level rewards unlock as you level up; the premium set
 * is Make It Yours. Tap = wear it (saved). Locked = preview it on the big pet + how to unlock.
 */
export function ClosetScreen() {
  const { colors, scheme } = useTheme();
  const look = useLook();
  const pet = useAppStore((s) => s.pet);
  const patchPet = useAppStore((s) => s.patchPet);
  const [tab, setTab] = useState<Tab>('mood');
  const [preview, setPreview] = useState<Tile | null>(null);
  const sky = skyOf(new Date().getHours());

  const tiles: Tile[] =
    tab === 'mood'
      ? [{ key: 'auto', tab, label: t.auto, mood: 'auto' as const }, ...MOODS.map((m) => ({ key: m, tab, label: capFirst(m), mood: m }))]
      : (tab === 'hat' ? HATS : tab === 'face' ? FACES : tab === 'color' ? COLORS : ROOMS).map((i: Item) => ({ key: i.id, tab, label: i.name, item: i }));

  const unlocked = (tile: Tile) => !tile.item || isUnlocked(tile.item.unlock, look.level, look.makeItYours);
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
    if (!unlocked(tile)) {
      haptics.warning();
      play('nope');
      return;
    }
    haptics.select();
    play('pop');
    if (tile.mood !== undefined) patchPet({ mood: tile.mood });
    else if (tile.item) patchPet({ [tile.item.slot]: tile.item.id } as Partial<typeof pet>);
  };

  const status = (() => {
    if (preview && !unlocked(preview) && preview.item) {
      return preview.item.unlock.type === 'level' ? t.lockedLevel(preview.item.unlock.level) : t.lockedPlus;
    }
    if (tab === 'mood') return look.homeMood === 'auto' ? t.homeAuto(pet.name) : t.homeFace(pet.name, look.homeMood);
    const it = [...HATS, ...FACES, ...COLORS, ...ROOMS].find((i) => i.slot === tab && i.id === look[tab as 'hat' | 'face' | 'color' | 'room']);
    return it ? t.wearing(it.name) : '';
  })();
  const lockedPlus = preview?.item?.unlock.type === 'pack' && !unlocked(preview);
  const onDarkStage = stageIsDark(show.room, sky, scheme);

  return (
    <Screen eyebrow={t.eyebrow(look.level, STAGES[look.stage].name)} title={t.title}>
      {/* the big preview */}
      <View style={[styles.hero, { borderColor: colors.cardBorder }]}>
        <StageBackdrop room={show.room} sky={sky} glowY={64} />
        <Pet size={150} color={show.color} mood={show.mood} stage={look.stage} hat={show.hat} face={show.face} onPress={() => play('boop')} accessibilityLabel={pet.name} />
        <Animated.View key={status} entering={FadeIn.duration(duration.quick)} style={styles.status}>
          <Text variant="subhead" tone={onDarkStage ? 'onFocus' : 'onLightScene'} style={styles.center}>{status}</Text>
          {lockedPlus ? (
            <PressScale accessibilityRole="button" onPress={() => router.push('/plus')} style={[styles.plusBtn, { backgroundColor: colors.primary }]}>
              <Text variant="caption" tone="onPrimary">{t.getPlus}</Text>
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
          const lockLabel = it && !open ? (it.unlock.type === 'level' ? t.lvBadge(it.unlock.level) : plusLock) : null;
          return (
            <Pressable
              key={`${tab}-${tile.key}`}
              accessibilityRole="button"
              accessibilityLabel={`${tile.label}${lockLabel ? `, ${lockLabel}` : ''}`}
              accessibilityState={{ selected: on }}
              onPress={() => choose(tile)}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: on ? colors.primarySoft : colors.card,
                  borderColor: on ? colors.primary : colors.cardBorder,
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
                    <Icon name="sparkle" size={14} color={colors.primary} />
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
  plusBtn: { minHeight: 34, paddingHorizontal: space.l, borderRadius: radius.button, justifyContent: 'center' },
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
