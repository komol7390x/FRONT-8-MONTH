const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' ? false : true;

export const config = {
    BACKEND_URL: isDevelopment
        ? import.meta.env.VITE_BACKEND_URL_LOCAL
        : import.meta.env.VITE_BACKEND_URL_SERVER,

    FRONTEND_URL: isDevelopment
        ? import.meta.env.VITE_FRONTEND_URL_LOCAL
        : import.meta.env.VITE_FRONTEND_URL_SERVER,

    TELEGRAM_URL: isDevelopment
        ? 'https://t.me/prod_online_7390_bot' :
        'https://t.me/online_course_7390_bot'
};