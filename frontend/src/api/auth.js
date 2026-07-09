import api from './axios';
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
