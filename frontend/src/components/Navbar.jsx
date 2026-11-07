import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import Icon from './Icon.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Our Menu' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' }
];

function navClass({ isActive }) {
  return `nav-link${isActive ? ' is-active' : ''}`;
}

function mobileClass({ isActive }) {
  return isActive ? 'is-active' : undefined;
}

export default function Navbar() {
  const { user, isAuthenticated, isCustomer, isStaff, logout } = useAuth();
  const { count, openCart } = useCart();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const closeAll = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAll();
    navigate('/');
  };

  const displayName = user?.fullName || user?.name || user?.username || 'Account';
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <header className="site-header">
      <div className="container">
        <nav className="navbar" aria-label="Main navigation">
          <Link to="/" className="brand" onClick={closeAll}>
            <span className="brand__mark" aria-hidden="true">
              ☕
            </span>
            <span className="brand__text">
              <span className="brand__name">Brew Haven</span>
              <span className="brand__tag">Coffee &amp; Bakery</span>
            </span>
          </Link>

          <ul className="nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={navClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            {isCustomer && (
              <li>
                <NavLink to="/orders" className={navClass}>
                  My Orders
                </NavLink>
              </li>
            )}
            {isStaff && (
              <li>
                <NavLink to="/staff" className={navClass}>
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          <div className="nav-actions">
            {isCustomer && (
              <Link
                to="/notifications"
                className="icon-button"
                onClick={closeAll}
                aria-label={`Notifications, ${unreadCount} unread`}
              >
                <Icon name="bell" />
                <span className="label-hide-sm">Alerts</span>
                <span className={`cart-count${unreadCount === 0 ? ' is-muted' : ''}`}>
                  {unreadCount}
                </span>
              </Link>
            )}

            <button
              type="button"
              className="icon-button"
              onClick={openCart}
              aria-label={`Open shopping cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <Icon name="cart" />
              <span className="label-hide-sm">Cart</span>
              <span className="cart-count">{count}</span>
            </button>

            {isAuthenticated ? (
              <div className="account" ref={accountRef}>
                <button
                  type="button"
                  className="account__trigger"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <span className="account__avatar" aria-hidden="true">
                    {initial}
                  </span>
                  <span className="label-hide-sm">{displayName.split(' ')[0]}</span>
                </button>

                {accountOpen && (
                  <div className="account__menu" role="menu">
                    <div className="account__menu-header">
                      <strong>{displayName}</strong>
                      <span>{user?.email || user?.username}</span>
                    </div>

                    {isCustomer && (
                      <>
                        <Link to="/account" onClick={closeAll} role="menuitem">
                          <Icon name="user" size={16} /> My Account
                        </Link>
                        <Link to="/orders" onClick={closeAll} role="menuitem">
                          <Icon name="receipt" size={16} /> My Orders
                        </Link>
                        <Link to="/notifications" onClick={closeAll} role="menuitem">
                          <Icon name="bell" size={16} /> Notifications
                          {unreadCount > 0 && <span className="menu-count">{unreadCount}</span>}
                        </Link>
                        <Link to="/reviews" onClick={closeAll} role="menuitem">
                          <Icon name="star" size={16} /> Reviews &amp; Feedback
                        </Link>
                      </>
                    )}

                    {isStaff && (
                      <Link to="/staff" onClick={closeAll} role="menuitem">
                        <Icon name="grid" size={16} /> Staff Dashboard
                      </Link>
                    )}

                    <button type="button" className="is-danger" onClick={handleLogout} role="menuitem">
                      <Icon name="logout" size={16} /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn--outline btn--sm" onClick={closeAll}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn--primary btn--sm" onClick={closeAll}>
                  Sign Up
                </Link>
              </>
            )}

            <button
              type="button"
              className="nav-toggle"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="mobile-nav">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={mobileClass} onClick={closeAll}>
                {link.label}
              </NavLink>
            ))}
            {isCustomer && (
              <>
                <NavLink to="/orders" className={mobileClass} onClick={closeAll}>
                  My Orders
                </NavLink>
                <NavLink to="/notifications" className={mobileClass} onClick={closeAll}>
                  Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
                </NavLink>
                <NavLink to="/reviews" className={mobileClass} onClick={closeAll}>
                  Reviews &amp; Feedback
                </NavLink>
              </>
            )}
            {isStaff && (
              <NavLink to="/staff" className={mobileClass} onClick={closeAll}>
                Staff Dashboard
              </NavLink>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={mobileClass} onClick={closeAll}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={mobileClass} onClick={closeAll}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
