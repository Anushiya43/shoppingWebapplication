import { useState, useEffect, useCallback } from 'react';
import { getOrders, cancelOrder as cancelOrderApi } from '../api/orders';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (orderId) => {
    try {
      await cancelOrderApi(orderId);
      await fetchOrders(); // Refresh after cancel
      return { success: true };
    } catch (err) {
      console.error('Failed to cancel order', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to cancel order' 
      };
    }
  };

  return { orders, loading, error, refetch: fetchOrders, cancelOrder };
};
