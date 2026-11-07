import { Link } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/format.js';
import { productImage } from '../utils/image.js';
import Icon from './Icon.jsx';

export default function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    isEmpty,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem
  } = useCart();

  return (
    <>
      <div
        className={`drawer-backdrop${isOpen ? ' is-open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`cart-drawer${isOpen ? ' is-open' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <header className="cart-drawer__head">
          <h3>
            Your Cart
            {count > 0 && <span className="cart-count">{count}</span>}
          </h3>
          <button type="button" className="btn btn--ghost btn--sm" onClick={closeCart} aria-label="Close cart">
            <Icon name="close" />
          </button>
        </header>

        <div className="cart-drawer__body">
          {isEmpty ? (
            <div className="empty-state">
              <span className="empty-state__icon" aria-hidden="true">
                🛒
              </span>
              <h3>Your cart is empty</h3>
              <p>Browse the menu and add your favourite brews.</p>
              <Link to="/menu" className="btn btn--accent btn--sm" onClick={closeCart}>
                Explore Our Menu
              </Link>
            </div>
          ) : (
            <ul className="cart-lines">
              {items.map((item) => (
                <li key={item.id} className="cart-line">
                  <img src={productImage(item)} alt={item.name} className="cart-line__img" />

                  <div className="cart-line__info">
                    <strong>{item.name}</strong>
                    <span className="text-muted">{formatCurrency(item.price)} each</span>

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

                  <div className="cart-line__end">
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isEmpty && (
          <footer className="cart-drawer__foot">
            <div className="row row--between">
              <span className="text-muted">Subtotal</span>
              <strong className="price price--lg">{formatCurrency(subtotal)}</strong>
            </div>
            <p className="field-hint">Taxes and any service charges are confirmed at checkout.</p>

            <Link to="/checkout" className="btn btn--primary btn--block" onClick={closeCart}>
              Proceed to Checkout
            </Link>
            <Link to="/cart" className="btn btn--outline btn--block" onClick={closeCart}>
              View Full Cart
            </Link>
            <button type="button" className="btn btn--ghost btn--block" onClick={closeCart}>
              Continue Shopping
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
