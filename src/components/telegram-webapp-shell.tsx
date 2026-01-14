import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { request } from '../config/request';
import { PageLoader } from './page-loader';

export const TelegramWebAppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [_, setStudentId] = useState<number | null>(null);

    // 1. Tokenni URL dan olish va saqlash
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
            localStorage.setItem('telegram_token', tokenFromUrl);
            // URLni tozalash (tokenni olib tashlash)
            params.delete('token');
            const newSearch = params.toString();
            navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true });
        }
    }, [location.pathname, navigate]);

    // 2. Student ma'lumotlarini aniqlash va tekshirish
    useEffect(() => {
        const checkStudentStatus = async () => {
            const token = localStorage.getItem('telegram_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Token payloadidan IDni olish (ixtiyoriy, lekin serverdan tekshirish ishonchliroq)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentId = payload?.id || payload?.studentId;

                if (currentId) {
                    setStudentId(currentId);
                    const res = await request.get(`/student/${currentId}`);
                    if (res.data?.data?.isActive === false) {
                        setIsBlocked(true);
                    }
                }
            } catch (error) {
                console.error("Auth check error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkStudentStatus();
    }, [location.pathname]);

    // 3. Telegram WebApp interfeysini sozlash
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) return;

        tg.ready();
        tg.expand();
        tg.setHeaderColor?.('#ffffff');

        const updateHeight = () => {
            document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
        };
        tg.onEvent('viewportChanged', updateHeight);
        updateHeight();

        return () => tg.offEvent('viewportChanged', updateHeight);
    }, []);

    if (loading) return <PageLoader />;

    if (isBlocked) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                    <h2 className="text-xl font-bold text-red-600">Hisob bloklangan</h2>
                    <p className="text-gray-600 mt-2">Iltimos, administrator bilan bog'laning.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ height: 'var(--tg-viewport-height, 100vh)' }}>
            <div className="flex-1 overflow-y-auto overflow-x-hidden safe-area-bottom">
                {children}
            </div>
        </div>
    );
};