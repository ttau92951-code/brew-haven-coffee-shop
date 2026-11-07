import { Link } from 'react-router-dom';

import Icon from './Icon.jsx';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <span className="brand">
              <span className="brand__mark" aria-hidden="true">
                ☕
              </span>
              <span className="brand__text">
                <span className="brand__name">Brew Haven</span>
                <span className="brand__tag">Coffee &amp; Bakery</span>
              </span>
            </span>
            <p style={{ marginTop: 'var(--space-4)' }}>
              Freshly roasted coffee, artisan pastries and a warm welcome — every single day.
            </p>
            <div className="site-footer__social">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                f
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                ◎
              </a>
              <a href="https://x.com" aria-label="X" target="_blank" rel="noreferrer">
                ✕
              </a>
              <a href="https://wa.me/26658000000" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                ✆
              </a>
            </div>
          </div>

          <div>
            <h4>Explore</h4>
            <div className="site-footer__links">
              <Link to="/">Home</Link>
              <Link to="/menu">Our Menu</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4>Account</h4>
            <div className="site-footer__links">
              <Link to="/login">Login</Link>
              <Link to="/signup">Create Account</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/cart">Shopping Cart</Link>
            </div>
          </div>

          <div>
            <h4>Visit Us</h4>
            <div className="site-footer__links">
              <span className="row">
                <Icon name="pin" size={16} /> 12 Kingsway, Maseru
              </span>
              <span className="row">
                <Icon name="phone" size={16} /> +266 5800 0000
              </span>
              <span className="row">
                <Icon name="mail" size={16} /> hello@brewhaven.co.ls
              </span>
              <span className="row">
                <Icon name="clock" size={16} /> Mon–Sat 7:00–19:00
              </span>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          © {YEAR} Brew Haven.
        </div>
      </div>
    </footer>
  );
}
