import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as clearCartApi } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity);
      await fetchCart();
    } catch (err) {
      console.error('Failed to add item', err);
      throw err;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity', err);
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove item', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await clearCartApi();
      setCart(null);
    } catch (err) {
      console.error('Failed to clear cart', err);
      throw err;
    }
  };

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((acc, item) => {
    const discountedPrice = item.product.discountPercentage 
        ? item.product.price * (1 - item.product.discountPercentage / 100)
        : item.product.price;
    return acc + (discountedPrice * item.quantity);
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addItem, 
      updateQuantity, 
      removeItem, 
      clearCart, 
      cartCount,
      cartTotal,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
