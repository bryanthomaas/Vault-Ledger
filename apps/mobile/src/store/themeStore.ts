import { create } from 'zustand';
import { Platform } from 'react-native';
import { tokenStorage } from '../api/client';
import { lightColors, darkColors, type ThemeColors } from '../theme/tokens';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  initTheme: () => Promise<void>;
}

function applyThemeToDocument(mode: ThemeMode) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const isDark = mode === 'dark';
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
    }

    // Update meta theme-color for mobile browser headers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', isDark ? '#141312' : '#F4EFEA');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isDark: false,
  colors: lightColors,

  setMode: (mode: ThemeMode) => {
    const isDark = mode === 'dark';
    const activeColors = isDark ? darkColors : lightColors;

    applyThemeToDocument(mode);

    tokenStorage.setItem('vault_theme_mode', mode).catch(() => {});
    set({ mode, isDark, colors: activeColors });
  },

  toggleTheme: () => {
    const nextMode = get().mode === 'light' ? 'dark' : 'light';
    get().setMode(nextMode);
  },

  initTheme: async () => {
    try {
      const stored = await tokenStorage.getItem('vault_theme_mode');
      if (stored === 'light' || stored === 'dark') {
        get().setMode(stored);
        return;
      }

      if (
        Platform.OS === 'web' &&
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        get().setMode('dark');
      } else {
        get().setMode('light');
      }
    } catch {
      get().setMode('light');
    }
  },
}));

export const useTheme = () => useThemeStore();
