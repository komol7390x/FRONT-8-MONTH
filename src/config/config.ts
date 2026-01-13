export const config = {
    BACKEND_URL: String(import.meta.env.VITE_BACKEND_URL || 'https://komol.uz/api/v1'),
    FRONTEND_URL: String(import.meta.env.VITE_FRONTEND_URL || 'https://komol.uz'),
};

console.log(config);
