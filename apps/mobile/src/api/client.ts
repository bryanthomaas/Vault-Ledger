import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { getMockResponse } from './mockFallback';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost:3000');

class StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
}

export const tokenStorage = new StorageAdapter();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const accessToken = await tokenStorage.getItem('vault_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 404 || response.status === 502 || response.status === 503) {
        return getMockResponse<T>(endpoint, options);
      }
      throw new ApiError(
        response.status,
        data?.message || data?.error || `HTTP error ${response.status}`,
        data,
      );
    }

    return data as T;
  } catch (err: any) {
    // If backend server is unreachable (Failed to fetch / connection refused), fall back to offline demo mock
    if (err instanceof TypeError || err.message?.includes('fetch') || err.message?.includes('Network')) {
      return getMockResponse<T>(endpoint, options);
    }
    // If it's an ApiError with 404/502/503, fallback to mock
    if (err instanceof ApiError && [404, 502, 503].includes(err.status)) {
      return getMockResponse<T>(endpoint, options);
    }
    throw err;
  }
}
