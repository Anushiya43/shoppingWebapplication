import API from './index';

export const getBrands = () => API.get('/brands');
export const createBrand = (data) => API.post('/brands', data);
export const updateBrand = (id, data) => API.patch(`/brands/${id}`, data);
export const deleteBrand = (id) => API.delete(`/brands/${id}`);
export const getBrand = (id) => API.get(`/brands/${id}`);
