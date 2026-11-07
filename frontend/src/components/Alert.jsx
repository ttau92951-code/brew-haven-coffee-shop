export default function Alert({ variant = 'info', children }) {
  if (!children) return null;

  return (
    <div
      className={`alert alert--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span>{children}</span>
    </div>
  );
}
