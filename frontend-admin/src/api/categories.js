import API from './index';

export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.patch(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const getCategory = (id) => API.get(`/categories/${id}`);
