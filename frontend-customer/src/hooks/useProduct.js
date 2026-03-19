import { useState, useEffect } from 'react';
import { getProduct } from '../api/products';

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getProduct(id);
      setProduct(res.data);
    } catch (err) {
      console.error(`Failed to fetch product ${id}:`, err);
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return { product, loading, error, refetch: fetchProduct };
};
