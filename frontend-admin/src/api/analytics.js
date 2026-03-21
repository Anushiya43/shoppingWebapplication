import API from './index';

export const getStats = (range) => API.get(`/analytics/stats${range ? `?range=${range}` : ''}`);
