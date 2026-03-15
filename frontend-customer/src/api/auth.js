import api from './index';

export const getProfile = () => api.get('/auth/profile');

export const logoutUser = () => api.post('/auth/logout');

export const googleLoginUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;

export const requestOtp = (phoneNumber) => api.post('/auth/phone/request-otp', { phoneNumber });

export const verifyOtp = (phoneNumber, otp, firstName, lastName) => 
    api.post('/auth/phone/verify-otp', { phoneNumber, otp, firstName, lastName });
