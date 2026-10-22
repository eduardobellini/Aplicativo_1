import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CartItem, Product } from '../types';
import { findCoupon } from '../utils/pricing';

type CartContextData = {
  items: CartItem[];
  count: number;
  subtotal: number;
  coupon: string | null;
  addToCart: (product: Product, quantity?: number) => void;
  changeQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  applyCoupon: (code: string) => string | null;
  removeCoupon: () => void;
  clearCart: () => void;
};

type StoredCart = { items: CartItem[]; coupon: string | null };

const CART_KEY = '@patinhas:cart';

const CartContext = createContext({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then(raw => {
        if (!raw) return;
        const saved: StoredCart = JSON.parse(raw);
        setItems(saved.items);
        setCoupon(saved.coupon);
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const cart: StoredCart = { items, coupon };
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [items, coupon]);

  function addToCart(product: Product, quantity = 1) {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }

  function changeQuantity(id: string, delta: number) {
    setItems(prev =>
      prev
        .map(i => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter(i => i.quantity > 0),
    );
  }

  function removeFromCart(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  // Returns an error message, or null when the coupon was applied.
  function applyCoupon(code: string) {
    const found = findCoupon(code);
    if (!found) return 'Cupom inválido ou expirado.';
    if (!items.some(found.appliesTo)) {
      return `O ${found.code} vale ${found.description}. Adicione um item elegível.`;
    }
    setCoupon(found.code);
    return null;
  }

  function removeCoupon() {
    setCoupon(null);
  }

  function clearCart() {
    setItems([]);
    setCoupon(null);
  }

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        coupon,
        addToCart,
        changeQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
