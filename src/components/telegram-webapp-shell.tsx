import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { PageLoader } from './page-loader';

interface TokenPayload {
    id: number;
    role: string;
    isActive: boolean;
    iat: number;
    exp: number;
}

export const TelegramWebAppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const extractAndVerifyToken = () => {
            try {
                let finalToken = '';
                const fullUrl = window.location.href;

                // 1. URL dan tokenni split orqali yechib olish
                if (fullUrl.includes('token=')) {
                    const afterToken = fullUrl.split('token=')[1];
                    finalToken = afterToken;
                }

                if (finalToken) {
                    finalToken = finalToken.trim();
                    localStorage.setItem('telegram_token', finalToken);

                    // 3. Parse va ID ni saqlash
                    const decoded = jwtDecode<TokenPayload>(finalToken);
                    localStorage.setItem('telegram_student_id', String(decoded.id));

                    // 4. Blokirovkani tekshirish
                    if (decoded.isActive === false) {
                        setIsBlocked(true);
                    }

                    // 5. URL ni tozalash
                    if (fullUrl.includes('token=')) {
                        navigate(location.pathname, { replace: true });
                    }
                }
            } catch (error) {
                console.error("Token error:", error);
            } finally {
                setLoading(false);
            }
        };

        extractAndVerifyToken();
    }, [location.pathname, navigate]);

    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            if (tg.isVersionAtLeast?.('6.1')) {
                tg.setHeaderColor?.('#ffffff');
            }
        }
    }, []);

    if (loading) return <PageLoader />;

    if (isBlocked) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white p-6 text-center">
                <div className="space-y-4">
                    <div className="text-red-500 text-5xl">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900">Hisobingiz faol emas</h2>
                    <p className="text-gray-500 text-sm">Administrator bilan bog'laning.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};