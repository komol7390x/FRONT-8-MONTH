import axios from 'axios'
import Cookies from 'js-cookie'
import { config } from './config';

export const request = axios.create({
    baseURL: config.BACKEND_URL,
});

request.interceptors.request.use((config) => {
    const frontToken = Cookies.get('frontToken');
    if (frontToken) {
        config.headers.Authorization = `Bearer ${frontToken}`
    }
    return config
})
