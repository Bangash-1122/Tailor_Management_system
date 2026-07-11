import axios from 'axios';
import {
    getToken,
    handleUnauthorized
} from './authToken';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const isLoginRequest =
            err.config &&
            err.config.url &&
            err.config.url.includes('/auth/login');

        if (
            err.response &&
            err.response.status === 401 &&
            !isLoginRequest
        ) {
            handleUnauthorized();
        }

        return Promise.reject(err);
    }
);

export default api;