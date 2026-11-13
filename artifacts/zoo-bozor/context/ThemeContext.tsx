import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors, { type Palette } from '@/constants/colors';

/** `system` follows the phone's light/dark setting; the other two are an explicit choice. */
export type ThemeName = 'light' | 'dark' | 'system';
const THEME_KEY = 'zoo-bozor/theme/v1';

type ThemeValue = { theme: ThemeName; dark: boolean; C: Palette; setTheme: (t: ThemeName) => void; toggleTheme: () => void };

const ThemeContext = createContext<ThemeValue>({
  theme: 'system', dark: false, C: colors.light, setTheme: () => undefined, toggleTheme: () => undefined,
});

/** Device-wide appearance (default: follow the phone). Lives above the account-scoped tree so it survives sign-in. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeName>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => { if (saved === 'dark' || saved === 'light' || saved === 'system') setThemeState(saved); })
      .catch(() => undefined);
  }, []);

  const dark = theme === 'dark' || (theme === 'system' && scheme === 'dark');
  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => undefined);
  }, []);
  // The moon/sun shortcut flips what the user sees now and stores it as an explicit choice.
  const toggleTheme = useCallback(() => setTheme(dark ? 'light' : 'dark'), [dark, setTheme]);

  const value = useMemo<ThemeValue>(
    () => ({ theme, dark, C: dark ? colors.dark : colors.light, setTheme, toggleTheme }),
    [theme, dark, setTheme, toggleTheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Theme-aware StyleSheet: `const useSt = makeStyles((C) => ({ ... }))`, then `const st = useSt()`
 * inside the component. One sheet per palette is built lazily and reused.
 */
type Styles = Parameters<typeof StyleSheet.create>[0];

export function makeStyles<S extends Styles>(factory: (C: Palette) => S & Styles) {
  const cache = new Map<Palette, Readonly<S>>();
  return function useStyles(): Readonly<S> {
    const { C } = useTheme();
    let sheet = cache.get(C);
    if (!sheet) {
      sheet = StyleSheet.create(factory(C));
      cache.set(C, sheet);
    }
    return sheet;
  };
}
