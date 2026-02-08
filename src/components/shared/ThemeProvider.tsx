"use client";

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Apply theme class on mount and when theme changes
    document.documentElement.classList.remove('theme-orange', 'theme-blue');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
}
