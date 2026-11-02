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
  const { isAuthenticated, isLocked, isLoading, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkSession();
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
      <StatusBar style="dark" />
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

              html, body {
                scroll-behavior: smooth !important;
                background-color: #F4EFEA !important;
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
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                color: #201E1B !important;
              }

              /* Smooth minimal sandy scrollbars */
              ::-webkit-scrollbar {
                width: 7px;
                height: 7px;
              }
              ::-webkit-scrollbar-track {
                background: #EDE5DC;
              }
              ::-webkit-scrollbar-thumb {
                background: #C5B8A8;
                border-radius: 4px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #285430;
              }

              /* Ceramic cards depth & sand border */
              div[style*="background-color: rgb(250, 247, 242)"],
              div[style*="background-color: #FAF7F2"],
              div[style*="background-color: #faf7f2"] {
                box-shadow: 0 4px 20px -4px rgba(45, 38, 30, 0.06), 0 1px 3px rgba(45, 38, 30, 0.04) !important;
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
