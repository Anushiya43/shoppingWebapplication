import API from './index';

export const getUsers = () => API.get('/users');
export const toggleBlockUser = (id) => API.patch(`/users/${id}/block`);
