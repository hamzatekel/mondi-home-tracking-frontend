import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// İleride token eklemek istersek bu interceptor otomatik araya girecek
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !config.url?.includes('/api/auth/')) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;