import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ role, roles, redirectTo = '/login', children }) {
  const { initialising, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="page container">
        <Loader label="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  // `roles` accepts several allowed roles; `role` keeps the single-role callers working.
  const allowed = roles || (role ? [role] : null);

  if (allowed && !allowed.includes(user?.role)) {
    // Signed in, but without the required role - send them to their own dashboard.
    const fallback =
      user?.role === 'staff' || user?.role === 'admin' ? '/staff' : '/account';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
