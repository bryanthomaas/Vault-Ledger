import { create } from 'zustand';
import { Platform } from 'react-native';
import { darkColors, type ThemeColors } from '../theme/tokens';

export type ThemeMode = 'dark';

interface ThemeState {
  mode: 'dark';
  isDark: true;
  colors: ThemeColors;
  toggleTheme: () => void;
  setMode: (mode: 'dark') => void;
  initTheme: () => Promise<void>;
}

function applyThemeToDocument() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.classList.add('dark');
    document.body?.classList.add('dark');

    // Update meta theme-color for mobile browser headers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', '#0A0B14');
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  isDark: true,
  colors: darkColors,

  setMode: () => {
    applyThemeToDocument();
    set({ mode: 'dark', isDark: true, colors: darkColors });
  },

  toggleTheme: () => {
    // Dark mode is permanently active across the application
    applyThemeToDocument();
  },

  initTheme: async () => {
    applyThemeToDocument();
  },
}));

export const useTheme = () => useThemeStore();
