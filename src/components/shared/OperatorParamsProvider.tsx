"use client"

import { ReactNode } from 'react';
import { useEffect } from 'react';
import { useOperatorParamsStore } from '@/lib/operatorParamsStore';

/**
 * Hook to initialize operator params from server and apply theme
 */
export function useInitializeOperatorParams(operatorParams: any) {
  const { setData, getPanelTheme, getUserWebConfig } = useOperatorParamsStore();

  useEffect(() => {
    if (operatorParams) {
      console.log('Initializing operator params:', operatorParams);
      setData(operatorParams);

      // Apply theme colors from config
      const config = getUserWebConfig();
      if (config.main_color || config.secondary_color) {
        applyTheme(config);
      } else {
        // Fallback to panel theme if config doesn't have colors
        const theme = getPanelTheme();
        if (theme) {
          applyTheme(theme);
        }
      }
    }
  }, [operatorParams, setData, getPanelTheme, getUserWebConfig]);
}

/**
 * Client wrapper component to initialize operator params
 */
interface OperatorParamsProviderProps {
  operatorParams: any;
  children: ReactNode;
}

export function OperatorParamsProvider({ operatorParams, children }: OperatorParamsProviderProps) {
  useInitializeOperatorParams(operatorParams);

  return <>{children}</>;
}

/**
 * Apply theme colors to CSS custom properties
 */
function applyTheme(theme: { main_color?: string; secondary_color?: string }) {
  if (!theme) return;
  //   theme.main_color = '#0096FF';
  //   theme.secondary_color = '#00008B';
  const root = document.documentElement;
  // console.log("theme found -> ",theme)
  if (theme.main_color) {
    root.style.setProperty('--primary', theme.main_color);
    root.style.setProperty('--primary-hover', adjustColorBrightness(theme.main_color, -20));
    root.style.setProperty('--primary-light', adjustColorBrightness(theme.main_color, 30));
    root.style.setProperty('--primary-dark', adjustColorBrightness(theme.main_color, -30));
  }

  if (theme.secondary_color) {
    root.style.setProperty('--secondary', theme.secondary_color);
    root.style.setProperty('--secondary-hover', adjustColorBrightness(theme.secondary_color, -20));
    root.style.setProperty('--secondary-light', adjustColorBrightness(theme.secondary_color, 30));
    root.style.setProperty('--secondary-dark', adjustColorBrightness(theme.secondary_color, -30));
  }

  console.log('Applied operator theme:', theme);
}

/**
 * Helper function to adjust color brightness
 */
function adjustColorBrightness(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;

  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
   .toString(16).slice(1);
}