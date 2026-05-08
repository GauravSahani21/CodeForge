'use client';
import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  stats: { solved: number; attempted: number; streak: number };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('cf_token');
    const user = localStorage.getItem('cf_user');
    if (token && user) set({ token, user: JSON.parse(user) });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('cf_token', data.token);
      localStorage.setItem('cf_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      const errorObj = err as any;
      const msg = errorObj.response?.data?.error || errorObj.message || 'Login failed';
      throw new Error(msg);
    }
  },

  signup: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/signup', { username, email, password });
      localStorage.setItem('cf_token', data.token);
      localStorage.setItem('cf_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      const errorObj = err as any;
      const msg = errorObj.response?.data?.error || errorObj.message || 'Signup failed';
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    set({ user: null, token: null });
  },
}));
