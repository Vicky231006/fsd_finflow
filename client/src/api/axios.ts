import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    console.log(`[HTTP REQ] %c${config.method?.toUpperCase()} ${config.url}`, 'color: #38bdf8; font-weight: bold;');
    if (config.data) console.log('[REQ DATA]', config.data);
    if (config.params) console.log('[REQ PARAMS]', config.params);

    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (err) => {
    console.error('[REQ ERROR]', err);
    return Promise.reject(err);
});

api.interceptors.response.use(
    (response) => {
        console.log(`[HTTP RES] %c${response.status} ${response.config.url}`, 'color: #a3e635; font-weight: bold;');
        console.log('[RES DATA]', response.data);
        return response;
    },
    async (error) => {
        console.error(`[HTTP ERR] %c${error.response?.status || 'FAIL'} ${error.config?.url}`, 'color: #f87171; font-weight: bold;');
        console.error('[ERR DETAILS]', error.response?.data || error.message);

        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }
            originalRequest._retry = true;
            try {
                await useAuthStore.getState().refreshToken();
                originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
                return api(originalRequest);
            } catch (err) {
                useAuthStore.getState().logout();
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);
