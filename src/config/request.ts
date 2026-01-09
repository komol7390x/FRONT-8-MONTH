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
    let telegramToken: string | undefined;
    try {
        const v = localStorage.getItem('telegram_token');
        telegramToken = v ? String(v) : undefined;
    } catch {
        telegramToken = undefined;
    }

    if (!telegramToken) {
        const cookieToken = Cookies.get('telegram_token');
        telegramToken = cookieToken ? String(cookieToken) : undefined;
    }

    if (telegramToken) {
        const params: any = (config.params ?? {}) as any;
        if (!params.token) {
            config.params = { ...params, token: telegramToken };
        }
    }
    return config
})
