import { useState, useCallback } from 'react';
import { loadThemePreference, saveThemePreference } from '@/core/storage/progressStorage';

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const initial = loadThemePreference();
    saveThemePreference(initial);
    return initial;
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveThemePreference(next);
      return next;
    });
  }, []);

  return { theme, isDark: theme === 'dark', toggleTheme };
}
