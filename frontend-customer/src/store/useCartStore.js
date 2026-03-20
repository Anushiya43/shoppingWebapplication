import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as clearCartApi } from '../api/cart';

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,

      fetchCart: async () => {
        const authData = localStorage.getItem('modern-shop-auth');
        const accessToken = authData ? JSON.parse(authData).state?.accessToken : null;
        
        if (!accessToken) {
          set({ cart: null, loading: false });
          return;
        }

        try {
          set({ loading: true });
          const res = await getCart();
          set({ cart: res.data, loading: false });
        } catch (err) {
          console.error('Failed to fetch cart', err);
          set({ loading: false });
        }
      },

      addItem: async (productId, quantity = 1) => {
        try {
          await addToCart(productId, quantity);
          await get().fetchCart();
        } catch (err) {
          console.error('Failed to add item', err);
          throw err;
        }
      },

      updateQuantity: async (itemId, quantity) => {
        try {
          await updateCartItem(itemId, quantity);
          await get().fetchCart();
        } catch (err) {
          console.error('Failed to update quantity', err);
          throw err;
        }
      },

      removeItem: async (itemId) => {
        try {
          await removeFromCart(itemId);
          await get().fetchCart();
        } catch (err) {
          console.error('Failed to remove item', err);
          throw err;
        }
      },

      clearCart: async () => {
        try {
          await clearCartApi();
          set({ cart: null });
        } catch (err) {
          console.error('Failed to clear cart', err);
          throw err;
        }
      },

      getCartCount: () => {
        const cart = get().cart;
        return cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      },

      getCartTotal: () => {
        const cart = get().cart;
        return cart?.items?.reduce((acc, item) => {
          const discountedPrice = item.product.discountPercentage 
              ? item.product.price * (1 - item.product.discountPercentage / 100)
              : item.product.price;
          return acc + (discountedPrice * item.quantity);
        }, 0) || 0;
      },
      
      getShippingCost: () => {
        const total = get().getCartTotal();
        if (total === 0) return 0;
        return total >= 500 ? 0 : 50;
      },
      
      getFreeShippingThresholdRemaining: () => {
        const total = get().getCartTotal();
        if (total === 0 || total >= 500) return 0;
        return 500 - total;
      },
    }),
    {
      name: 'shopping-cart',
    }
  )
);

export default useCartStore;
