import api from './axios';

export const login = (data) => {
    return api.post('/v1/auth/login', data);
};

export const getMe = () => {
    return api.get('/v1/auth/me');
};

export const register = (data) => {
    return api.post('/v1/auth/register', data);
};

export const refreshToken = () => {
    return api.post('/v1/auth/refresh');
};

export const logout = () => {
    return api.post('/v1/auth/logout');
};