import type { LoginResponse } from '@/pages/admin/types/auth';
import axios from 'axios'
import Cookies from 'js-cookie'

export const request = axios.create({
    baseURL: 'https://049de3e7d73d.ngrok-free.app/api/v1',
});

request.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

request.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await axios.post<LoginResponse>(
                    'https://049de3e7d73d.ngrok-free.app/api/v1'
                )
                const newAccessToken = response.data.data.token;
                Cookies.set('token', newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return request(originalRequest)
            } catch (error) {
                Cookies.remove("token");
                Cookies.remove("role");

                window.location.href = "/";

                return Promise.reject(error);
            }
        }
        return Promise.reject(error);

    }
)