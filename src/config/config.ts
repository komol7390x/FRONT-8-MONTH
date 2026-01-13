const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

export const config = {
    BACKEND_URL: isDevelopment
        ? import.meta.env.VITE_BACKEND_URL_SERVER
        : import.meta.env.VITE_BACKEND_URL_LOCAL,

    FRONTEND_URL: isDevelopment
        ? import.meta.env.VITE_FRONTEND_URL_SERVER
        : import.meta.env.VITE_FRONTEND_URL_LOCAL
};