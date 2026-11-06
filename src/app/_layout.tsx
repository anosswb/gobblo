import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { Figtree_500Medium, Figtree_700Bold, useFonts } from '@expo-google-fonts/figtree';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockGate } from '@/components/lock-gate';
import { ToastHost } from '@/components/toast';
import { useAppLifecycle } from '@/hooks/use-app-lifecycle';
import { useAppStore } from '@/state/app-store';
import { ThemeProvider, useTheme } from '@/theme/theme-provider';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_800ExtraBold,
    Figtree_500Medium,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { scheme, colors } = useTheme();
  useAppLifecycle();
  const onboarded = useAppStore((s) => s.settings.onboarded);
  return (
    <LockGate>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        {/* first launch: only the intro exists until it is done (or skipped) */}
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="dump" options={{ presentation: 'modal' }} />
          <Stack.Screen name="focus" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="reminders" />
        </Stack.Protected>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
      <ToastHost />
    </LockGate>
  );
}
