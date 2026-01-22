const isDevelopment = import.meta.env.VITE_NODE_ENV === 'prod' ? true : false;

export const config = {
    BACKEND_URL: isDevelopment
        ? import.meta.env.VITE_BACKEND_URL_SERVER
        : import.meta.env.VITE_BACKEND_URL_LOCAL,

    FRONTEND_URL: isDevelopment
        ? import.meta.env.VITE_FRONTEND_URL_SERVER
        : import.meta.env.VITE_FRONTEND_URL_LOCAL,

    TELEGRAM_URL: isDevelopment
        ? 'https://t.me/prod_online_7390_bot' :
        'https://t.me/online_course_7390_bot'
};