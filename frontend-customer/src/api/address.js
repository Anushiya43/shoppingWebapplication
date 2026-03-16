import API from './index';

export const getAddresses = () => API.get('/address');
export const createAddress = (data) => API.post('/address', data);
export const updateAddress = (id, data) => API.put(`/address/${id}`, data);
export const deleteAddress = (id) => API.delete(`/address/${id}`);
export const setDefaultAddress = (id) => API.patch(`/address/${id}/default`);
