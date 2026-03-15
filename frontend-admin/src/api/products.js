import API from './index';

export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);

export const createProduct = (formData) => API.post('/products', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const updateProduct = (id, formData) => API.patch(`/products/${id}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const deleteProduct = (id) => API.delete(`/products/${id}`);
