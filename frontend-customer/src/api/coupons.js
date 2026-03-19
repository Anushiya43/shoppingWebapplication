import api from './index';

export const validateCoupon = (code, amount) => api.get(`/coupons/validate/${code}`, {
  params: { amount }
});

export const getActiveCoupons = () => api.get('/coupons/active');
