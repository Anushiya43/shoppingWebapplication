import API from './index';

export const getStats = () => API.get('/analytics/stats');
