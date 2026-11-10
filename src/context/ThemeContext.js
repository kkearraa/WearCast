import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { getSettings, setSetting } from '../db/settings';
import { lightColors, darkColors, lightShadow, darkShadow } from '../theme';

// Theme mode: 'system' follows the phone, 'light' / 'dark' are the user's choice.
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState('system');

  useEffect(() => {
    (async () => {
      try {
        const s = await getSettings();
        setModeState(s.themeMode);
      } catch {
        // keep the default
      }
    })();
  }, []);

  const setMode = useCallback(async (next) => {
    setModeState(next);
    try {
      await setSetting('themeMode', next);
    } catch (e) {
      console.warn('Could not save theme', e);
    }
  }, []);

  const value = useMemo(() => {
    const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
    return {
      mode,
      setMode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      shadow: isDark ? darkShadow : lightShadow,
    };
  }, [mode, systemScheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// Screens write their styles as makeStyles({ colors, shadow }); this rebuilds them
// only when the theme actually changes.
export function useStyles(makeStyles) {
  const theme = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles({ colors: theme.colors, shadow: theme.shadow }),
    [makeStyles, theme.colors, theme.shadow]
  );
  return { ...theme, styles };
}
