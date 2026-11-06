import { LockSimple } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { unlock } from '@/lib/lock';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const RELOCK_AFTER_MS = 60_000;

/** Optional biometric lock: on cold start and after 60 s in the background. */
export function LockGate({ children }: PropsWithChildren) {
  const enabled = useAppStore((s) => s.settings.biometricLock);
  const [locked, setLocked] = useState(enabled);
  const hiddenAt = useRef<number | null>(null);
  const { colors } = useTheme();

  const tryUnlock = useCallback(async () => {
    if (await unlock()) setLocked(false);
  }, []);

  // ask once on cold start (only when the lock is on)
  useEffect(() => {
    if (!useAppStore.getState().settings.biometricLock) return;
    void unlock().then((ok) => ok && setLocked(false));
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (!enabled) return;
      if (s === 'background') hiddenAt.current = Date.now();
      if (s === 'active' && hiddenAt.current && Date.now() - hiddenAt.current > RELOCK_AFTER_MS) {
        setLocked(true);
        void unlock().then((ok) => ok && setLocked(false));
      }
    });
    return () => sub.remove();
  }, [enabled]);

  return (
    <>
      {children}
      {enabled && locked && (
        <Animated.View exiting={FadeOut.duration(duration.fast)} style={[StyleSheet.absoluteFill, styles.wrap, { backgroundColor: colors.bg }]}>
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <LockSimple size={36} weight="fill" color={colors.primary} />
          </View>
          <Text variant="heading">your bites are locked</Text>
          <PressScale
            accessibilityRole="button"
            onPress={() => void tryUnlock()}
            style={[styles.cta, { backgroundColor: colors.primary }]}>
            <Text variant="bodyBold" tone="onPrimary">
              unlock
            </Text>
          </PressScale>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: space.l, zIndex: 100 },
  badge: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  cta: { minHeight: 56, minWidth: 200, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
