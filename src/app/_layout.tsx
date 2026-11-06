import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockGate } from '@/components/lock-gate';
import { ToastHost } from '@/components/toast';
import { useAppLifecycle } from '@/hooks/use-app-lifecycle';
import { ThemeProvider, useTheme } from '@/theme/theme-provider';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // iOS uses SF Pro / SF Pro Rounded (system). These are the Android + web stand-ins.
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
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
  return (
    <LockGate>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dump" options={{ presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [1], sheetCornerRadius: 38, contentStyle: { backgroundColor: colors.card } }} />
        <Stack.Screen name="focus" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="settings" options={{ animation: 'default' }} />
        <Stack.Screen name="reminders" options={{ animation: 'default' }} />
      </Stack>
      <ToastHost />
    </LockGate>
  );
}
