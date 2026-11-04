import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme/tokens';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

function RootNavigator() {
  const { isAuthenticated, isLocked, isLoading, checkSession } = useAuthStore();
  const { isDark, initTheme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkSession();
    initTheme();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users to app dashboard
      router.replace('/(tabs)/');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

              :root {
                --vl-bg: #F4EFEA;
                --vl-canvas: #F4EFEA;
                --vl-canvas-muted: #EDE5DC;
                --vl-surface: #FAF7F2;
                --vl-surface-subtle: #F2EBE1;
                --vl-surface-highlight: #EAE1D5;
                --vl-surface-elevated: #FFFFFF;
                --vl-sand: #EDE5DC;
                --vl-sand-subtle: #C5B8A8;
                --vl-sand-muted: #968D84;
                --vl-wood-warm: #54463A;
                --vl-border: rgba(32, 30, 27, 0.08);
                --vl-border-strong: rgba(32, 30, 27, 0.16);
                --vl-text-primary: #201E1B;
                --vl-text-secondary: #635C54;
                --vl-text-tertiary: #968D84;
                --vl-accent: #285430;
                --vl-accent-hover: #1E432A;
                --vl-accent-subtle: rgba(40, 84, 48, 0.12);
                --vl-accent-border: rgba(40, 84, 48, 0.28);
                --vl-positive: #2D6A4F;
                --vl-positive-subtle: rgba(45, 106, 79, 0.12);
                --vl-positive-border: rgba(45, 106, 79, 0.28);
                --vl-negative: #B94A3E;
                --vl-negative-subtle: rgba(185, 74, 62, 0.12);
                --vl-negative-border: rgba(185, 74, 62, 0.28);
                --vl-warning: #C47B27;
                --vl-warning-subtle: rgba(196, 123, 39, 0.12);
                --vl-warning-border: rgba(196, 123, 39, 0.28);
              }

              [data-theme="dark"], body.dark {
                --vl-bg: #141312;
                --vl-canvas: #141312;
                --vl-canvas-muted: #1B1917;
                --vl-surface: #1E1C19;
                --vl-surface-subtle: #262420;
                --vl-surface-highlight: #322E29;
                --vl-surface-elevated: #282521;
                --vl-sand: #342F29;
                --vl-sand-subtle: #5C544B;
                --vl-sand-muted: #8A8074;
                --vl-wood-warm: #C4B5A5;
                --vl-border: rgba(237, 229, 220, 0.10);
                --vl-border-strong: rgba(237, 229, 220, 0.18);
                --vl-text-primary: #F5EFEB;
                --vl-text-secondary: #B8AFA5;
                --vl-text-tertiary: #7D756C;
                --vl-accent: #3E8E56;
                --vl-accent-hover: #4BAA69;
                --vl-accent-subtle: rgba(62, 142, 86, 0.20);
                --vl-accent-border: rgba(62, 142, 86, 0.35);
                --vl-positive: #4CAF79;
                --vl-positive-subtle: rgba(76, 175, 121, 0.20);
                --vl-positive-border: rgba(76, 175, 121, 0.35);
                --vl-negative: #E06D5E;
                --vl-negative-subtle: rgba(224, 109, 94, 0.20);
                --vl-negative-border: rgba(224, 109, 94, 0.35);
                --vl-warning: #E5A144;
                --vl-warning-subtle: rgba(229, 161, 68, 0.20);
                --vl-warning-border: rgba(229, 161, 68, 0.35);
              }

              html, body {
                scroll-behavior: smooth !important;
                background-color: var(--vl-bg) !important;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                color: var(--vl-text-primary) !important;
                transition: background-color 0.2s ease, color 0.2s ease;
              }

              /* Light mode background texture */
              html:not([data-theme="dark"]) body {
                background-image: 
                  repeating-linear-gradient(90deg, 
                    rgba(32, 30, 27, 0.012) 0px, 
                    rgba(32, 30, 27, 0.012) 1px, 
                    transparent 1px, 
                    transparent 14px
                  ),
                  radial-gradient(rgba(180, 160, 140, 0.07) 1px, transparent 1px),
                  linear-gradient(180deg, #F7F3EE 0%, #F4EFEA 50%, #EDE6DD 100%) !important;
                background-size: auto, 16px 16px, 100% 100% !important;
              }

              /* Dark mode background texture */
              html[data-theme="dark"] body, body.dark {
                background-image: 
                  repeating-linear-gradient(90deg, 
                    rgba(237, 229, 220, 0.012) 0px, 
                    rgba(237, 229, 220, 0.012) 1px, 
                    transparent 1px, 
                    transparent 14px
                  ),
                  radial-gradient(rgba(237, 229, 220, 0.035) 1px, transparent 1px),
                  linear-gradient(180deg, #181614 0%, #141312 50%, #0F0E0D 100%) !important;
                background-size: auto, 16px 16px, 100% 100% !important;
              }

              /* Smooth minimal scrollbars */
              ::-webkit-scrollbar {
                width: 7px;
                height: 7px;
              }
              ::-webkit-scrollbar-track {
                background: var(--vl-sand);
              }
              ::-webkit-scrollbar-thumb {
                background: var(--vl-sand-subtle);
                border-radius: 4px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: var(--vl-accent);
              }

              /* Ceramic cards depth & sand border */
              div[style*="background-color: rgb(250, 247, 242)"],
              div[style*="background-color: #FAF7F2"],
              div[style*="background-color: #faf7f2"],
              div[style*="var(--vl-surface"] {
                box-shadow: 0 4px 20px -4px rgba(45, 38, 30, 0.06), 0 1px 3px rgba(45, 38, 30, 0.04) !important;
                transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
              }

              [data-theme="dark"] div[style*="background-color: rgb(250, 247, 242)"],
              [data-theme="dark"] div[style*="background-color: #FAF7F2"],
              [data-theme="dark"] div[style*="background-color: #faf7f2"],
              [data-theme="dark"] div[style*="var(--vl-surface"] {
                box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.55), 0 1px 4px rgba(0, 0, 0, 0.4) !important;
              }
            `,
          }}
        />
      )}
      <Slot />
    </View>
  );
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
  },
});
