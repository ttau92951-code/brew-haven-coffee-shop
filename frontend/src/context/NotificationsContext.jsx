import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

// Order statuses change on the staff dashboard, so the badge is refreshed
// periodically to keep "your order is ready" notifications current.
const POLL_INTERVAL = 30000;

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { token, isCustomer } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token || !isCustomer) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const result = await api.get('/notifications', token);
      setNotifications(result.data || []);
      setError(null);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token, isCustomer]);

  useEffect(() => {
    if (!token || !isCustomer) {
      setNotifications([]);
      return undefined;
    }

    load();
    const timer = setInterval(load, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [token, isCustomer, load]);

  const markRead = useCallback(
    async (id) => {
      if (!token) return;

      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item))
      );

      try {
        await api.patch(`/notifications/${id}/read`, undefined, token);
      } catch {
        /* the next poll will restore the true state */
      }
    },
    [token]
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;

    setNotifications((current) => current.map((item) => ({ ...item, read: true })));

    try {
      await api.patch('/notifications/read-all', undefined, token);
    } catch {
      /* the next poll will restore the true state */
    }
  }, [token]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      reload: load,
      markRead,
      markAllRead
    }),
    [notifications, unreadCount, loading, error, load, markRead, markAllRead]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
}
