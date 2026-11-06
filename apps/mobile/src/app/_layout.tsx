import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
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
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Enforce permanent dark theme and custom brand favicon on web
  useEffect(() => {
    checkSession();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.title = 'Vault Ledger';

      const svgFavicon = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">` +
          `<rect x="4" y="4" width="92" height="92" rx="22" fill="#121324" stroke="#FF5A1F" stroke-width="4"/>` +
          `<path d="M 56 26 L 56 72 L 80 72" stroke="#8D8DF5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<path d="M 20 26 L 40 72 L 60 26" stroke="#FF5A1F" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` +
        `</svg>`
      );
      const dataUrl = `data:image/svg+xml,${svgFavicon}`;
      const existingIcons = document.querySelectorAll('link[rel*="icon"]');
      existingIcons.forEach((el) => el.parentNode?.removeChild(el));

      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = dataUrl;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const pageKey = segments.join('/') || 'root';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Exclusively Fraunces and Instrument Serif with JetBrains Mono for tabular data */
              @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap');

              /* Wayglim Palette (Dark Theme) */
              :root, [data-theme="dark"], body {
                --vl-bg: #0A0B14;
                --vl-canvas: #0A0B14;
                --vl-canvas-muted: #07070F;
                --vl-surface: #121324;
                --vl-surface-subtle: #17192E;
                --vl-surface-raised: #1F223D;
                --vl-surface-highlight: #272B4E;
                --vl-surface-elevated: #1A1E38;
                --vl-surface-glass: rgba(18, 19, 36, 0.88);
                --vl-glass-border: rgba(141, 141, 245, 0.20);
                --vl-glass-highlight: rgba(141, 141, 245, 0.32);
                --vl-electric-blue: #8D8DF5;
                --vl-electric-blue-deep: #6A6AE0;
                --vl-electric-blue-subtle: rgba(141, 141, 245, 0.14);
                --vl-electric-blue-border: rgba(141, 141, 245, 0.28);
                --vl-border: rgba(141, 141, 245, 0.16);
                --vl-border-strong: rgba(141, 141, 245, 0.34);
                --vl-text-primary: #FFFFFF;
                --vl-text-secondary: #C8CCEE;
                --vl-text-tertiary: #7F84B2;
                --vl-sand: #17192E;
                --vl-sand-subtle: #1F223D;
                --vl-sand-muted: #7F84B2;
                --vl-wood-warm: #272B4E;
                --vl-accent: #FF5A1F;
                --vl-accent-hover: #E84A12;
                --vl-accent-subtle: rgba(255, 90, 31, 0.15);
                --vl-accent-border: rgba(255, 90, 31, 0.45);
                --vl-accent-gold: #FFB03A;
                --vl-accent-peach: #FF8A5C;
                --vl-iris-violet: #8D8DF5;
                --vl-crimson: #E8243C;
                --vl-positive: #10B981;
                --vl-positive-subtle: rgba(16, 185, 129, 0.14);
                --vl-positive-border: rgba(16, 185, 129, 0.3);
                --vl-negative: #E8243C;
                --vl-negative-subtle: rgba(232, 36, 60, 0.14);
                --vl-negative-border: rgba(232, 36, 60, 0.3);
                --vl-warning: #FFB03A;
                --vl-warning-subtle: rgba(255, 176, 58, 0.14);
                --vl-warning-border: rgba(255, 176, 58, 0.35);
              }

              /* Non-scrollable Fixed Viewport Shell */
              html, body, #root, [data-testid="root"] {
                background-color: #0A0B14 !important;
                color: #FFFFFF !important;
                font-family: 'Fraunces', Georgia, serif !important;
                margin: 0;
                padding: 0;
                height: 100vh !important;
                max-height: 100vh !important;
                overflow: hidden !important;
              }

              /* Font Assignment */
              div, span, p, a, button, input, textarea {
                font-family: 'Fraunces', Georgia, serif !important;
              }

              code, pre, kbd, samp, .font-mono, [data-mono="true"] {
                font-family: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace !important;
              }

              h1, h2, h3, [data-serif="true"], .display-serif {
                font-family: 'Instrument Serif', Georgia, serif !important;
                font-weight: 400 !important;
                letter-spacing: -0.3px;
              }

              /* Page Transition Animation */
              @keyframes vlPageTransitionIn {
                0% {
                  opacity: 0;
                  transform: translateY(6px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .vl-page-transition {
                animation: vlPageTransitionIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) both;
                display: flex;
                flex: 1;
                flex-direction: column;
                width: 100%;
                height: 100vh !important;
                max-height: 100vh !important;
                overflow: hidden !important;
              }

              /* Wayglim Iris & Tangerine Surfaces */
              .vl-glass-card,
              .vl-card,
              [data-surface="card"] {
                background-color: var(--vl-surface) !important;
                border: 1px solid var(--vl-border) !important;
                box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(141, 141, 245, 0.12) !important;
                transition: border-color 0.16s ease !important;
              }

              /* Sidebar & Navigation */
              #vl-desktop-sidebar {
                background-color: var(--vl-surface) !important;
                border-right: 1px solid var(--vl-border) !important;
              }

              #vl-mobile-tab-bar {
                background-color: var(--vl-surface) !important;
                border-top: 1px solid var(--vl-border) !important;
              }

              /* Minimal Scrollbars */
              ::-webkit-scrollbar {
                width: 6px;
                height: 6px;
              }
              ::-webkit-scrollbar-track {
                background: #0A0B14;
              }
              ::-webkit-scrollbar-thumb {
                background: #1A253D;
                border-radius: 3px;
                border: 1px solid rgba(141, 141, 245, 0.2);
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #8D8DF5;
              }

              /* Interactive Cursor, Micro-interactions & Tactile Feedback */
              button,
              div[role="button"],
              [data-button="true"],
              a,
              .vl-clickable {
                cursor: pointer !important;
                transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
                            background-color 0.15s ease,
                            border-color 0.15s ease,
                            box-shadow 0.15s ease,
                            color 0.15s ease !important;
              }

              /* Button Active Press Compression */
              button:active,
              div[role="button"]:active,
              [data-button="true"]:active {
                transform: scale(0.98) !important;
              }

              /* Accessible Wayglim Focus Rings */
              :focus-visible {
                outline: 2px solid var(--vl-iris-violet) !important;
                outline-offset: 2px !important;
              }

              button:focus-visible,
              div[role="button"]:focus-visible,
              a:focus-visible,
              [tabindex="0"]:focus-visible {
                outline: 2px solid var(--vl-iris-violet) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 3px rgba(141, 141, 245, 0.28) !important;
              }

              /* Form Inputs Focus Ring (Overrides outlineStyle: none) */
              input:focus,
              input:focus-visible,
              textarea:focus,
              textarea:focus-visible {
                outline: none !important;
                border-color: var(--vl-iris-violet) !important;
                box-shadow: 0 0 0 2px rgba(141, 141, 245, 0.25) !important;
              }

              /* Interactive Table Rows Hover Feedback */
              .vl-interactive-row,
              [data-interactive="row"] {
                cursor: pointer !important;
                transition: background-color 0.14s ease, border-color 0.14s ease !important;
              }
              .vl-interactive-row:hover,
              [data-interactive="row"]:hover {
                background-color: rgba(141, 141, 245, 0.06) !important;
              }
              .vl-interactive-row:active,
              [data-interactive="row"]:active {
                background-color: rgba(141, 141, 245, 0.10) !important;
                transform: scale(0.998) !important;
              }

              /* Interactive Cards Hover Feedback */
              .vl-interactive-card,
              [data-interactive="card"] {
                transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
                            box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1),
                            border-color 0.18s ease !important;
              }
              .vl-interactive-card:hover,
              [data-interactive="card"]:hover {
                border-color: rgba(141, 141, 245, 0.35) !important;
                box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(141, 141, 245, 0.20) !important;
                transform: translateY(-1px) !important;
              }

              /* Navigation Items Hover Feedback */
              .vl-nav-item,
              [data-interactive="nav"] {
                cursor: pointer !important;
                transition: background-color 0.15s ease, color 0.15s ease !important;
              }
              .vl-nav-item:hover {
                background-color: rgba(141, 141, 245, 0.08) !important;
              }

              /* Engine Switcher Tactile Badge */
              .vl-engine-badge {
                cursor: pointer !important;
                transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
                            box-shadow 0.18s ease,
                            border-color 0.18s ease,
                            background-color 0.18s ease !important;
              }
              .vl-engine-badge:hover {
                background-color: rgba(26, 28, 54, 0.92) !important;
                border-color: rgba(141, 141, 245, 0.45) !important;
                box-shadow: 0 4px 16px rgba(141, 141, 245, 0.22), 0 0 0 1px rgba(141, 141, 245, 0.25) !important;
                transform: translateY(-1px) !important;
              }
              .vl-engine-badge:active {
                transform: translateY(1px) scale(0.98) !important;
              }

              /* Reduced Motion: preserve layout transforms (like active tab indicator) */
              @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                  scroll-behavior: auto !important;
                }
              }
            `,
          }}
        />
      )}
      <View
        key={pageKey}
        style={styles.transitionWrapper}
        {...(Platform.OS === 'web' ? ({ className: 'vl-page-transition' } as any) : {})}
      >
        <Slot />
      </View>
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
    backgroundColor: '#0A0B14',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
  },
  transitionWrapper: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0B14',
    justifyContent: 'center',
    alignItems: 'center',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
  },
});
