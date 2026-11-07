import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from '../api/client.js';

const STORAGE_KEY = 'brew-haven.session';

const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(session, remember = false) {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);

    if (session) {
      const store = remember ? localStorage : sessionStorage;
      store.setItem(STORAGE_KEY, JSON.stringify({ ...session, remember }));
    }
  } catch {
    /* storage unavailable - ignore */
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [initialising, setInitialising] = useState(true);

  // Validate any stored token once on start-up.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored = readStoredSession();

      if (!stored?.token) {
        setInitialising(false);
        return;
      }

      try {
        const result = await api.get('/auth/me', stored.token);
        if (!cancelled) {
          setSession({ token: stored.token, user: result.user, remember: stored.remember });
        }
      } catch {
        if (!cancelled) {
          persistSession(null);
          setSession(null);
        }
      } finally {
        if (!cancelled) setInitialising(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback((result, remember) => {
    const next = { token: result.token, user: result.user, remember };
    persistSession(next, remember);
    setSession(next);
  }, []);

  const login = useCallback(
    async (email, password, remember = false) => {
      const result = await api.post('/auth/login', { email, password });
      applySession(result, remember);
      return result.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload, remember = true) => {
      const result = await api.post('/auth/register', payload);
      applySession(result, remember);
      return result.user;
    },
    [applySession]
  );

  const staffLogin = useCallback(
    async (identifier, password) => {
      const result = await api.post('/auth/staff/login', { email: identifier, password });
      applySession(result, true);
      return result.user;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    persistSession(null);
    setSession(null);
  }, []);

  const updateUser = useCallback((user) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user };
      persistSession(next, current.remember);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      token: session?.token || null,
      user: session?.user || null,
      initialising,
      isAuthenticated: Boolean(session?.token),
      isCustomer: session?.user?.role === 'customer',
      isStaff: session?.user?.role === 'staff' || session?.user?.role === 'admin',
      isAdmin: session?.user?.role === 'admin',
      login,
      register,
      staffLogin,
      logout,
      updateUser
    }),
    [session, initialising, login, register, staffLogin, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
