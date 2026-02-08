import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Theme = 'orange' | 'blue';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'orange',
        
        setTheme: (theme: Theme) => {
          set({ theme });
          // Apply theme class to document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('theme-orange', 'theme-blue');
            document.documentElement.classList.add(`theme-${theme}`);
          }
        },
        
        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme: Theme = currentTheme === 'orange' ? 'blue' : 'orange';
          get().setTheme(newTheme);
        },
      }),
      {
        name: 'theme-storage',
        onRehydrateStorage: () => (state) => {
          // Apply theme on rehydration
          if (state && typeof document !== 'undefined') {
            document.documentElement.classList.add(`theme-${state.theme}`);
          }
        },
      }
    ),
    { name: 'ThemeStore' }
  )
);
