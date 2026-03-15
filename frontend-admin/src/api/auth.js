import api from './index';

export const getProfile = () => api.get('/auth/profile');

export const logoutUser = () => api.post('/auth/logout');

export const googleLoginUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;
