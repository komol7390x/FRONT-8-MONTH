import axios from 'axios'
import Cookies from 'js-cookie'
import { config } from './config';
import { TokenName } from './enum';

export const request = axios.create({
    baseURL: config.BACKEND_URL,
});

request.interceptors.request.use((config) => {
    let isTelegramContext = false;
    try {
        const p = window.location.pathname || '';

        let hashPath = '';
        try {
            const h = window.location.hash || '';
            hashPath = h.startsWith('#') ? h.slice(1) : h;
            hashPath = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
        } catch {
            hashPath = '';
        }

        isTelegramContext = p === '/telegram/schedule' || p.startsWith('/telegram') || hashPath === '/telegram/schedule' || hashPath.startsWith('/telegram');
    } catch {
        isTelegramContext = false;
    }

    const frontToken = Cookies.get(TokenName.TOKEN_NAME);
    if (frontToken && !isTelegramContext) {
        config.headers.Authorization = `Bearer ${frontToken}`
    }
    return config
})
