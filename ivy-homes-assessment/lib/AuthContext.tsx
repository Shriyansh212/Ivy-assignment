'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthSession, getStoredSession, loginApi, logoutApi, refreshApi, User } from './api';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncSession = useCallback(async () => {
    const stored = getStoredSession();
    if (stored) {
      if (Date.now() >= stored.expires_at - 60000 && stored.refresh_token) {
        const refreshed = await refreshApi(stored.refresh_token);
        setSession(refreshed || stored);
      } else {
        setSession(stored);
      }
    } else {
      setSession(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncSession();

    const handleStorageChange = (e?: StorageEvent | Event) => {
      // Only react if it's an explicit auth change or storage event for ivy_auth_session
      if (e && 'key' in e && e.key && e.key !== 'ivy_auth_session') {
        return;
      }
      setTimeout(() => {
        syncSession();
      }, 0);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth_state_change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth_state_change', handleStorageChange);
    };
  }, [syncSession]);

  const login = async (email: string, pass: string) => {
    const newSession = await loginApi(email, pass);
    setSession(newSession);
    setTimeout(() => {
      window.dispatchEvent(new Event('auth_state_change'));
    }, 0);
  };

  const logout = async () => {
    await logoutApi();
    setSession(null);
    setTimeout(() => {
      window.dispatchEvent(new Event('auth_state_change'));
    }, 0);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
