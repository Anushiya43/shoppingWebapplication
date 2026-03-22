import API from './index';

export const getStats = (range) => API.get(`/analytics/stats${range ? `?range=${range}` : ''}`);
export const exportStats = (range) => API.get(`/analytics/export?range=${range}`, { responseType: 'blob' });
