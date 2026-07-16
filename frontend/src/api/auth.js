import api from './axios';

export const login = (data) => api.post('/v1/auth/login', data);
export const getMe = () => api.get('/v1/auth/me');
export const register = (data) => api.post('/v1/auth/register', data);