import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useAppStore } from '@/state/app-store';
import type { ThemePreference } from '@/state/schema';

import { dark, light, type ColorTokens } from './tokens';

type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  preference: ThemePreference;
  /** system Reduce Motion OR the in-app toggle */
  reduceMotion: boolean;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const preference = useAppStore((s) => s.settings.theme);
  const appReduceMotion = useAppStore((s) => s.settings.reduceMotion);
  const systemReduceMotion = useReducedMotion();

  const value = useMemo<Theme>(() => {
    const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
    return {
      scheme,
      colors: scheme === 'dark' ? dark : light,
      preference,
      reduceMotion: systemReduceMotion || appReduceMotion,
    };
  }, [preference, system, systemReduceMotion, appReduceMotion]);

  const navTheme = useMemo(() => {
    const base = value.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: value.colors.bg,
        card: value.colors.card,
        text: value.colors.ink,
        primary: value.colors.primary,
        border: value.colors.line,
      },
    };
  }, [value]);

  return (
    <ThemeContext.Provider value={value}>
      <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside <ThemeProvider>');
  return t;
}
