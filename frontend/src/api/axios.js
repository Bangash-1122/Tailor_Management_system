import axios from 'axios';

import {
    getToken,
    setToken,
    handleUnauthorized,
} from './authToken';

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        '/api',

    headers: {
        'Content-Type': 'application/json',
    },

    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        const status = error.response?.status;

        const requestUrl =
            originalRequest?.url || '';

        const isLoginRequest =
            requestUrl.includes('/auth/login');

        const isRefreshRequest =
            requestUrl.includes('/auth/refresh');

        if (
            status === 401 &&
            !isLoginRequest &&
            !isRefreshRequest &&
            !originalRequest?._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse =
                    await api.post('/v1/auth/refresh');

                const newAccessToken =
                    refreshResponse.data?.data?.accessToken;

                if (!newAccessToken) {
                    throw new Error(
                        'Access token was not returned'
                    );
                }

                setToken(newAccessToken);

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                handleUnauthorized();

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;