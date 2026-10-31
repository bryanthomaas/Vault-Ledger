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
      <StatusBar style="light" />
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #14110F !important;
                background-image: 
                  repeating-linear-gradient(90deg, 
                    rgba(235, 215, 190, 0.015) 0px, 
                    rgba(235, 215, 190, 0.015) 2px, 
                    transparent 2px, 
                    transparent 7px,
                    rgba(235, 215, 190, 0.02) 7px,
                    rgba(235, 215, 190, 0.02) 10px,
                    transparent 10px,
                    transparent 22px
                  ),
                  radial-gradient(rgba(234, 225, 214, 0.035) 1px, transparent 1px),
                  linear-gradient(180deg, #181411 0%, #14110F 50%, #0F0D0B 100%) !important;
                background-size: auto, 18px 18px, 100% 100% !important;
              }
              div[style*="background-color: rgb(31, 26, 22)"],
              div[style*="background-color: #1F1A16"],
              div[style*="background-color: #1f1a16"] {
                background-image: radial-gradient(rgba(234, 225, 214, 0.035) 1px, transparent 0) !important;
                background-size: 14px 14px !important;
                box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(234, 225, 214, 0.08) inset !important;
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
