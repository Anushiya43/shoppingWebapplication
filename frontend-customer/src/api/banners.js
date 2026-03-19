import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getBanners = (active = true) => {
  return axios.get(`${API_URL}/banners?active=${active}`);
};
