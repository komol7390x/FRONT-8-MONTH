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

    if (!telegramToken) {
        try {
            const href = window.location.href;
            const qIndex = href.indexOf('?');
            const hIndex = href.indexOf('#');

            const queryPart = qIndex >= 0
                ? href.slice(qIndex + 1, hIndex >= 0 ? hIndex : undefined)
                : '';

            const hashPart = hIndex >= 0 ? href.slice(hIndex + 1) : '';
            const hashQuery = hashPart.includes('?') ? hashPart.split('?')[1] : '';

            const qp = new URLSearchParams(queryPart || hashQuery);
            const t = qp.get('token');
            telegramToken = t ? String(t) : undefined;
        } catch {
            telegramToken = undefined;
        }
    }

    if (telegramToken) {
        try {
            localStorage.setItem('telegram_token', telegramToken);
        } catch {
            // ignore
        }
        try {
            Cookies.set('telegram_token', telegramToken, { sameSite: 'Lax' });
        } catch {
            // ignore
        }
    }

    if (telegramToken) {
        const headers: any = (config.headers ?? {}) as any;
        if (!headers.Authorization) {
            headers.Authorization = `Bearer ${telegramToken}`;
            config.headers = headers;
        }
    }

    if (telegramToken) {
        const params: any = (config.params ?? {}) as any;
        if (!params.token) {
            config.params = { ...params, token: telegramToken };
        }
    }
    return config
})
