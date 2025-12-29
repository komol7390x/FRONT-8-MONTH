export const config = {
    BACKEND_URL: String(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3030/api/v1')
};