import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface User {
  _id: string;
  email: string;
  username: string;
  avatar?: { url: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<void>;
  setUser: (user: User) => void;
  fetchProfile: () => Promise<void>;
  refreshTokens: () => Promise<string | null>;
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const BASE_URL = 'https://api.freeapi.app/api/v1';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || 'Login failed');
    }

    const { accessToken, refreshToken, user } = json.data;

    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  register: async (email, password, username) => {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || 'Registration failed');
    }
  },

  logout: async () => {
    const accessToken = get().accessToken;
    if (accessToken) {
      try {
        await fetch(`${BASE_URL}/users/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (err) {
        console.warn('Backend logout failed or offline', err);
      }
    }

    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    const accessToken = get().accessToken;
    if (!accessToken) return;

    const res = await fetch(`${BASE_URL}/users/current-user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || 'Failed to fetch profile');
    }

    set({ user: json.data, isAuthenticated: true });
  },

  refreshTokens: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const json = await res.json();

      if (res.ok) {
        const nextAccessToken = json.data.accessToken;
        const nextRefreshToken = json.data.refreshToken;

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, nextAccessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, nextRefreshToken);

        set({ accessToken: nextAccessToken, refreshToken: nextRefreshToken });
        return nextAccessToken;
      }
    } catch (err) {
      console.error('Token refresh failed', err);
    }
    return null;
  },

  loadStoredAuth: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (accessToken) {
        set({ accessToken, refreshToken });
        try {
          await get().fetchProfile();
        } catch (err) {
          console.warn('Access token verification failed, attempting token refresh...', err);
          const newAccess = await get().refreshTokens();
          if (newAccess) {
            await get().fetchProfile();
          } else {
            await get().logout();
          }
        }
      } else {
        set({ isAuthenticated: false });
      }
    } catch (e) {
      console.error('Failed to load stored auth', e);
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAvatar: async (imageUri: string) => {
    const formData = new FormData();
    // Platform-specific file handling
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('avatar', {
      uri: imageUri,
      name: `avatar.${fileType}`,
      type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
    } as any);

    let accessToken = get().accessToken;

    const performUpload = async (token: string) => {
      return fetch(`${BASE_URL}/users/avatar`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    };

    let res = await performUpload(accessToken!);

    if (res.status === 401) {
      const refreshedToken = await get().refreshTokens();
      if (refreshedToken) {
        res = await performUpload(refreshedToken);
      }
    }

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || 'Failed to update avatar');
    }

    set((state) => ({
      user: state.user ? { ...state.user, avatar: json.data.avatar } : state.user,
    }));
  },

  setUser: (user: User) => set({ user }),
}));