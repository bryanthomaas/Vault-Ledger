import { create } from 'zustand';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { apiRequest, tokenStorage } from '../api/client';
import type { User, AuthResponse, LoginInput, RegisterInput } from '@vault-ledger/shared';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoading: boolean;
  error: string | null;

  checkSession: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  loginDemo: () => Promise<void>;
  unlockBiometric: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLocked: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkSession: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = await tokenStorage.getItem('vault_access_token');
      if (!token) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }

      const user = await apiRequest<User>('/api/auth/me');
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        // On mobile native, lock app until biometric or passcode verification
        isLocked: Platform.OS !== 'web',
      });
    } catch (_err) {
      await tokenStorage.removeItem('vault_access_token');
      await tokenStorage.removeItem('vault_refresh_token');
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (input: LoginInput) => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      await tokenStorage.setItem('vault_access_token', res.accessToken);
      await tokenStorage.setItem('vault_refresh_token', res.refreshToken);

      set({
        user: res.user,
        isAuthenticated: true,
        isLocked: false,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (input: RegisterInput) => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      await tokenStorage.setItem('vault_access_token', res.accessToken);
      await tokenStorage.setItem('vault_refresh_token', res.refreshToken);

      set({
        user: res.user,
        isAuthenticated: true,
        isLocked: false,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  loginDemo: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiRequest<AuthResponse>('/api/auth/demo', {
        method: 'POST',
      });

      await tokenStorage.setItem('vault_access_token', res.accessToken);
      await tokenStorage.setItem('vault_refresh_token', res.refreshToken);

      // Trigger automatic data sync for demo user
      try {
        await apiRequest('/api/sync', { method: 'POST', headers: { Authorization: `Bearer ${res.accessToken}` } });
      } catch (_syncErr) {
        // Continue even if sync was already populated
      }

      set({
        user: res.user,
        isAuthenticated: true,
        isLocked: false,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Demo session failed' });
      throw err;
    }
  },

  unlockBiometric: async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      set({ isLocked: false });
      return true;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback: unlock gracefully
        set({ isLocked: false });
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Vault Ledger',
        fallbackLabel: 'Enter Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        set({ isLocked: false });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Biometric] Auth error:', err);
      set({ isLocked: false });
      return true;
    }
  },

  logout: async () => {
    await tokenStorage.removeItem('vault_access_token');
    await tokenStorage.removeItem('vault_refresh_token');
    set({ user: null, isAuthenticated: false, isLocked: false });
  },
}));
