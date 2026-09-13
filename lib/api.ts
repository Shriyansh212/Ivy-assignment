export const API_KEY = process.env.NEXT_PUBLIC_IVY_API_KEY || 'IVY26-436663951613';
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solve.ivy.homes';

export interface User {
  email: string;
  name?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  user: User;
  expires_at: number; // Unix timestamp ms
}

const STORAGE_KEY = 'ivy_auth_session';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    return session;
  } catch (err) {
    console.error('Failed to parse auth session:', err);
    return null;
  }
}

export function saveSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function loginApi(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const errText = await res.text();
    let detail = 'Login failed';
    try {
      const errObj = JSON.parse(errText);
      detail = errObj.detail || detail;
    } catch {}
    throw new Error(detail);
  }

  const data = await res.json();
  const expiresAt = Date.now() + (data.expires_in || 900) * 1000;

  const session: AuthSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user || { email },
    expires_at: expiresAt
  };

  saveSession(session);
  return session;
}

export async function refreshApi(refreshToken: string): Promise<AuthSession | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const current = getStoredSession();
    if (!current) return null;

    const newSession: AuthSession = {
      ...current,
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in || 900) * 1000
    };

    saveSession(newSession);
    return newSession;
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  const session = getStoredSession();
  if (session) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${session.access_token}`
        }
      });
    } catch {}
  }
  clearSession();
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let session = getStoredSession();

  // Auto-refresh if token expires in less than 60 seconds
  if (session && session.refresh_token && Date.now() >= session.expires_at - 60000) {
    const refreshed = await refreshApi(session.refresh_token);
    if (refreshed) session = refreshed;
  }

  const token = session?.access_token;
  const headers: Record<string, string> = {
    'X-API-Key': API_KEY,
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  return res;
}
