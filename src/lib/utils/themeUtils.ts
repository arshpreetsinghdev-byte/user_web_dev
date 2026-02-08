/**
 * Theme Utilities and Helpers
 * 
 * This file provides utility functions and constants for working with the theme system.
 */

import { useThemeStore, type Theme } from '@/stores/theme.store';

/**
 * Theme color definitions
 */
export const THEME_COLORS = {
  orange: {
    primary: '#F27D3A',
    hover: '#E06B28',
    light: '#FFA366',
    dark: '#D16829',
    rgb: '242, 125, 58',
  },
  blue: {
    primary: '#3B82F6',
    hover: '#2563EB',
    light: '#60A5FA',
    dark: '#1D4ED8',
    rgb: '59, 130, 246',
  },
} as const;

/**
 * Get the current theme colors
 */
export function useThemeColors() {
  const theme = useThemeStore((state) => state.theme);
  return THEME_COLORS[theme];
}

/**
 * Get theme-specific class names
 */
export function getThemeClasses(theme: Theme) {
  return {
    primary: 'bg-primary text-primary-foreground',
    primaryHover: 'hover:bg-primary/90',
    primaryOutline: 'border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    primaryText: 'text-primary',
    primaryBorder: 'border-primary',
    primaryRing: 'ring-primary',
  };
}

/**
 * Check if a theme is currently active
 */
export function useIsTheme(targetTheme: Theme): boolean {
  const theme = useThemeStore((state) => state.theme);
  return theme === targetTheme;
}

/**
 * Custom hook for theme-aware components
 */
export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const colors = THEME_COLORS[theme];
  const classes = getThemeClasses(theme);

  return {
    theme,
    setTheme,
    toggleTheme,
    colors,
    classes,
    isOrange: theme === 'orange',
    isBlue: theme === 'blue',
  };
}

/**
 * Get theme-specific gradient classes
 */
export function getThemeGradient(theme: Theme) {
  switch (theme) {
    case 'orange':
      return 'bg-gradient-to-br from-orange-400 to-red-500';
    case 'blue':
      return 'bg-gradient-to-br from-blue-400 to-blue-600';
    default:
      return 'bg-gradient-to-br from-orange-400 to-red-500';
  }
}

/**
 * Initialize theme on app mount (for SSR compatibility)
 */
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.theme) {
        document.documentElement.classList.add(`theme-${state.theme}`);
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error);
    }
  }
}

/**
 * Theme presets for quick switching
 */
export const THEME_PRESETS = {
  orange: {
    name: 'Orange',
    description: 'Warm and energetic',
    icon: '🟠',
  },
  blue: {
    name: 'Blue',
    description: 'Professional and calm',
    icon: '🔵',
  },
} as const;

/**
 * Tailwind class utilities for theme-aware styling
 */
export const themeClasses = {
  // Buttons
  primaryButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outlineButton: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
  ghostButton: 'text-primary hover:bg-primary/10',
  
  // Inputs
  input: 'border-2 border-primary focus:ring-primary/20',
  
  // Cards
  cardHighlight: 'border-primary',
  
  // Text
  textPrimary: 'text-primary',
  textOnPrimary: 'text-primary-foreground',
  
  // Backgrounds
  bgPrimary: 'bg-primary',
  bgPrimaryLight: 'bg-primary/10',
  
  // Badges
  badge: 'bg-primary/10 text-primary border border-primary/20',
} as const;

/**
 * Export everything for convenience
 */
export {
  useThemeStore,
  type Theme,
};
