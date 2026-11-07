import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

const STORAGE_KEY = 'brew-haven.cart';
const MAX_QUANTITY = 99;

const CartContext = createContext(null);

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable - ignore */
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product?.available) return;

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image || '',
          available: true,
          quantity: Math.min(quantity, MAX_QUANTITY)
        }
      ];
    });

    setIsOpen(true);
  }, []);

  const changeQuantity = useCallback((id, delta) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(item.quantity + delta, MAX_QUANTITY) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totals = useMemo(
    () => ({
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count: totals.count,
      subtotal: totals.subtotal,
      isEmpty: items.length === 0,
      isOpen,
      addItem,
      increment: (id) => changeQuantity(id, 1),
      decrement: (id) => changeQuantity(id, -1),
      removeItem,
      clear,
      openCart,
      closeCart
    }),
    [items, totals, isOpen, addItem, changeQuantity, removeItem, clear, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
