import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/format.js';
import { categoryIcon, productImage } from '../utils/image.js';

export default function ProductCard({ item }) {
  const { addItem } = useCart();
  const available = item.available !== false;

  return (
    <article className={`product-card${available ? '' : ' is-unavailable'}`}>
      <div className="product-card__media">
        <img src={productImage(item)} alt={item.name} loading="lazy" />
        <span
          className={`badge ${available ? 'badge--available' : 'badge--unavailable'} product-card__status`}
        >
          {available ? 'Available' : 'Sold out'}
        </span>
      </div>

      <div className="product-card__body">
        <span className="product-card__category">
          <span aria-hidden="true">{categoryIcon(item.category)}</span> {item.category}
        </span>
        <h3>{item.name}</h3>
        <p className="product-card__desc">{item.description || 'Freshly prepared in store.'}</p>

        <div className="row row--between product-card__foot">
          <strong className="price">{formatCurrency(item.price)}</strong>
          <button
            type="button"
            className="btn btn--accent btn--sm"
            disabled={!available}
            onClick={() => addItem(item)}
          >
            {available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
}
