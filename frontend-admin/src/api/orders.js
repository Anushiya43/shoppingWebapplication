import api from './index';

export const getAllOrders = () => api.get('/orders/admin/all');

export const updateOrderStatus = (orderId, data) => 
    api.put(`/orders/admin/${orderId}/status`, data);
