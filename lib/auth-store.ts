'use client';

import { create } from 'zustand';
import api from './api';
import { UserRole } from '@/types';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; tempToken?: string; role?: UserRole }>;
  googleLogin: (credential: string) => Promise<{ mfaRequired?: boolean; tempToken?: string; role?: UserRole }>;
  verifyMfa: (tempToken: string, code: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; marketingConsent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    if (data.mfaRequired) {
      return { mfaRequired: true, tempToken: data.tempToken };
    }

    sessionStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
    return { role: data.user.role };
  },

  googleLogin: async (credential) => {
    const { data } = await api.post('/auth/google', { credential });

    if (data.mfaRequired) {
      return { mfaRequired: true, tempToken: data.tempToken };
    }

    sessionStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
    return { role: data.user.role };
  },

  verifyMfa: async (tempToken, code) => {
    const { data } = await api.post('/auth/login/mfa', { tempToken, code });
    sessionStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  register: async (registerData) => {
    const { data } = await api.post('/auth/register', registerData);
    sessionStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue logout even if request fails
    }
    sessionStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  refreshAuth: async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      sessionStorage.setItem('accessToken', data.accessToken);
      // Decode user info from token (basic decode, not verification)
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      set({
        user: { id: payload.userId, email: payload.email, role: payload.role },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));
