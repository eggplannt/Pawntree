import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { apiFetch, getToken, removeToken, storeToken } from '@/lib/api';
import { User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: fetch current user if token exists
  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, []);

  // Handle deep link callback from OAuth on native
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const sub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle cold-start deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => sub.remove();
  }, []);

  async function handleDeepLink(url: string) {
    const parsed = Linking.parse(url);
    if (parsed.path === 'auth/callback' && parsed.queryParams?.token) {
      const token = parsed.queryParams.token as string;
      await storeToken(token);
      await fetchMe();
    }
  }

  async function fetchMe() {
    try {
      const me = await apiFetch<User>('/api/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Web: full page redirect; server sets cookie
      window.location.href = `${API_URL}/api/auth/google`;
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      `${API_URL}/api/auth/google?platform=native`,
      'pawntree://auth/callback',
    );

    if (result.type === 'success') {
      await handleDeepLink(result.url);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    await removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
