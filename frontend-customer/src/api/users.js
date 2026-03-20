import API from './index';

export const updateProfile = (data) => API.patch('/users/profile', data);
