import { Link } from 'react-router-dom';

import Icon from '../components/Icon.jsx';
import { EmptyState } from '../components/Loader.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/format.js';
import { productImage } from '../utils/image.js';

export default function CartPage() {
  const { items, count, subtotal, increment, decrement, removeItem, clear, isEmpty } = useCart();

  return (
    <div className="page container">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Shopping cart</span>
          <h1>Your cart</h1>
          <p>{count} item{count === 1 ? '' : 's'} ready to order</p>
        </div>
        <Link to="/menu" className="btn btn--outline btn--sm">
          <Icon name="arrowRight" size={16} /> Continue shopping
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add a few items from our menu and they will appear here."
          action={
            <Link to="/menu" className="btn btn--primary">
              Explore Our Menu
            </Link>
          }
        />
      ) : (
        <div className="cart-layout">
          <div className="card">
            {items.map((item) => (
              <div className="cart-table-line" key={item.id}>
                <img src={productImage(item)} alt={item.name} />

                <div className="stack" style={{ gap: '4px' }}>
                  <strong>{item.name}</strong>
                  <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                    {item.category} · {formatCurrency(item.price)} each
                  </span>
                  <div className="qty">
                    <button type="button" onClick={() => decrement(item.id)} aria-label={`Reduce ${item.name}`}>
                      <Icon name="minus" size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => increment(item.id)} aria-label={`Add ${item.name}`}>
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                </div>

                <div className="stack" style={{ alignItems: 'flex-end', gap: 'var(--space-3)' }}>
                  <strong className="price">{formatCurrency(item.price * item.quantity)}</strong>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Icon name="trash" size={15} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="summary-card">
            <h3>Order summary</h3>

            <div className="summary-row">
              <span>Items</span>
              <strong>{count}</strong>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong className="price price--lg">{formatCurrency(subtotal)}</strong>
            </div>

            <Link to="/checkout" className="btn btn--primary btn--block btn--lg">
              Proceed to Checkout
            </Link>
            <Link to="/menu" className="btn btn--outline btn--block">
              Continue Shopping
            </Link>
            <button type="button" className="btn btn--ghost btn--block" onClick={clear}>
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
