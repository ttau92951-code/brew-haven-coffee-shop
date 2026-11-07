import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page container">
      <div className="empty-state" style={{ paddingTop: 'var(--space-8)' }}>
        <span className="empty-state__icon" aria-hidden="true">
          ☕
        </span>
        <h1>404 — Page not found</h1>
        <p>We could not find that page. Perhaps it has been moved, or the link is incorrect.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
          <Link to="/" className="btn btn--primary">
            Back to home
          </Link>
          <Link to="/menu" className="btn btn--outline">
            Browse the menu
          </Link>
        </div>
      </div>
    </div>
  );
}
