export const config = {
    BACKEND_URL: String(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3030/api/v1'),
    FRONTEND_URL: String(import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5050')
};