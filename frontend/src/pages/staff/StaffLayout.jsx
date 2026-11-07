import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { api } from '../../api/client.js';
import Icon from '../../components/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const SECTIONS = [
  { to: '/staff', label: 'Overview', icon: 'grid', end: true, title: 'Overview', subtitle: 'Business performance at a glance' },
  { to: '/staff/menu', label: 'Menu Management', icon: 'book', title: 'Menu Management', subtitle: 'Add, edit and manage your products' },
  { to: '/staff/orders', label: 'Order Management', icon: 'receipt', title: 'Order Management', subtitle: 'Process and track customer orders' },
  { to: '/staff/feedback', label: 'Customer Feedback', icon: 'chat', title: 'Customer Feedback', subtitle: 'Reviews, compliments and complaints from customers' },
  { to: '/staff/employees', label: 'Employees', icon: 'idcard', adminOnly: true, title: 'Employee Management', subtitle: 'Add employees and assign their work email and password' },
  { to: '/staff/reports', label: 'Sales & Reports', icon: 'chart', title: 'Sales & Reports', subtitle: 'Daily, weekly and monthly performance' },
  { to: '/staff/customers', label: 'Customers', icon: 'users', title: 'Customer Management', subtitle: 'View customers and their order history' },
  { to: '/staff/settings', label: 'Store Settings', icon: 'image', title: 'Store Settings', subtitle: 'Choose the background image shown on the home page' }
];

function sectionClass({ isActive }) {
  return `sidebar-link${isActive ? ' is-active' : ''}`;
}

export default function StaffLayout() {
  const { user, token, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [newMessages, setNewMessages] = useState(0);

  // Employees do not see administrator-only sections such as Employees.
  const sections = SECTIONS.filter((section) => !section.adminOnly || isAdmin);

  // Keeps the sidebar badge in step with messages that still need a reply.
  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      if (!token) return;

      try {
        const result = await api.get('/feedback', token);
        if (!cancelled) setNewMessages(result.summary?.new || 0);
      } catch {
        /* the badge is best-effort only */
      }
    }

    loadCount();
    return () => {
      cancelled = true;
    };
  }, [token, location.pathname]);

  const current =
    sections.find((section) => section.to === location.pathname) ||
    sections
      .slice()
      .reverse()
      .find((section) => location.pathname.startsWith(section.to) && section.to !== '/staff') ||
    sections[0];

  function handleLogout() {
    logout();
    navigate('/staff/login', { replace: true });
  }

  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">
        <Link to="/staff" className="brand">
          <span className="brand__mark" aria-hidden="true">
            ☕
          </span>
          <span className="brand__text">
            <span className="brand__name">Brew Haven</span>
            <span className="brand__tag">Staff Portal</span>
          </span>
        </Link>

        <nav className="staff-nav" aria-label="Dashboard navigation">
          {sections.map((section) => (
            <NavLink key={section.to} to={section.to} end={section.end} className={sectionClass}>
              <Icon name={section.icon} size={18} />
              {section.label}
              {section.to === '/staff/feedback' && newMessages > 0 && (
                <span className="sidebar-count">{newMessages}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="staff-sidebar__foot">
          <Link to="/" className="sidebar-link">
            <Icon name="home" size={18} /> View storefront
          </Link>
          <button type="button" className="sidebar-link" onClick={handleLogout}>
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      </aside>

      <div className="staff-main">
        <header className="staff-topbar">
          <div>
            <h1>{current.title}</h1>
            <p className="text-muted">{current.subtitle}</p>
          </div>

          <div className="staff-user">
            <span className="account__avatar" aria-hidden="true">
              {(user?.name || user?.username || 'S').charAt(0).toUpperCase()}
            </span>
            <div>
              <strong style={{ fontSize: '0.88rem' }}>{user?.name || 'Staff'}</strong>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {isAdmin ? 'Signed in as Administrator' : 'Signed in as staff'}
              </div>
            </div>
          </div>
        </header>

        <div className="staff-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
