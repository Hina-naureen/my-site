/**
 * Better-Auth — React context for authentication state.
 * Persists JWT + user profile in localStorage.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { API_BASE } from '@site/src/config/apiConfig';

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  background_level: 'beginner' | 'intermediate' | 'expert';
  field_of_interest: string;
  learning_goals: string[];
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  background_level: string;
  field_of_interest: string;
  learning_goals: string[];
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<UserProfile, 'background_level' | 'field_of_interest' | 'learning_goals'>>) => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'physai_auth';

function persist(token: string, user: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  localStorage.setItem('token', token);
}

function clearPersisted() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('token');
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { token: t, user: u } = JSON.parse(raw);
        setToken(t);
        setUser(u);
      }
    } catch {
      clearPersisted();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthResponse = useCallback((data: { access_token: string; user: UserProfile }) => {
    setToken(data.access_token);
    setUser(data.user);
    persist(data.access_token, data.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('[login] status:', res.status, res.statusText);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.log('[login] error body:', err);
      const msg = res.status === 404
        ? 'Server is starting up, please try again in a moment.'
        : (err.detail || 'Login failed');
      throw new Error(msg);
    }
    handleAuthResponse(await res.json());
  }, [handleAuthResponse]);

  const signup = useCallback(async (data: SignupPayload) => {
    const url = `${API_BASE}/api/auth/signup`;
    console.log('[signup] POST', url, data);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log('[signup] status:', res.status, res.statusText);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.log('[signup] error body:', err);
      const msg = res.status === 404
        ? 'Server is starting up, please try again in a moment.'
        : (err.detail || 'Signup failed');
      throw new Error(msg);
    }
    const response = await res.json();
    console.log('[signup] success response:', response);
    handleAuthResponse(response);
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearPersisted();
  }, []);

  const updateProfile = useCallback(async (patch: Partial<Pick<UserProfile, 'background_level' | 'field_of_interest' | 'learning_goals'>>) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Profile update failed');
    const updatedUser: UserProfile = await res.json();
    setUser(updatedUser);
    persist(token, updatedUser);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
