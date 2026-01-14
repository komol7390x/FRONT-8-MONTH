import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { request } from '../config/request';
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

                // 1) Query'dan tokenni olish: /telegram/schedule?token=...
                try {
                    const qp = new URLSearchParams(window.location.search);
                    const t = qp.get('token');
                    if (t) finalToken = t;
                } catch {
                    // ignore
                }

                // 2) Hash ichidagi query bo'lsa ham ushlash: /#/telegram/schedule?token=...
                if (!finalToken) {
                    try {
                        const hash = window.location.hash || '';
                        const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
                        const qp = new URLSearchParams(hashQuery);
                        const t = qp.get('token');
                        if (t) finalToken = t;
                    } catch {
                        // ignore
                    }
                }

                // 3) Token bo'lmasa, avval saqlanganini ishlatamiz
                if (!finalToken) {
                    try {
                        finalToken = localStorage.getItem('telegram_token') || '';
                    } catch {
                        finalToken = '';
                    }
                }

                if (finalToken) {
                    finalToken = String(finalToken).trim();
                    try {
                        localStorage.setItem('telegram_token', finalToken);
                    } catch {
                        // ignore
                    }
                    try {
                        Cookies.set('telegram_token', finalToken, { sameSite: 'Lax' });
                    } catch {
                        // ignore
                    }

                    // 4) Parse va ID ni saqlash
                    const decoded = jwtDecode<TokenPayload>(finalToken);
                    if (decoded?.id != null) {
                        try {
                            localStorage.setItem('telegram_student_id', String(decoded.id));
                        } catch {
                            // ignore
                        }

                        // Telegram token ichidagi id internal bo'lishi ham, tgId bo'lishi ham mumkin.
                        // Booking/Profile uchun backend internal student id kerak.
                        (async () => {
                            try {
                                const res = await request.get(`/student/${decoded.id}`);
                                const internalId = Number((res as any)?.data?.data?.id);
                                if (Number.isFinite(internalId) && internalId > 0) {
                                    try {
                                        localStorage.setItem('telegram_student_internal_id', String(internalId));
                                    } catch {
                                        // ignore
                                    }
                                    try {
                                        window.dispatchEvent(new CustomEvent('telegram-student-id-updated', { detail: { studentId: internalId } }));
                                    } catch {
                                        // ignore
                                    }
                                }
                            } catch {
                                try {
                                    const res = await request.get('/student', {
                                        params: {
                                            search: String(decoded.id),
                                            page: 1,
                                            limit: 10,
                                        },
                                    });
                                    const raw: any = (res as any)?.data;
                                    const items: any[] = Array.isArray(raw?.data) ? raw.data : [];
                                    const found = items.find((s: any) => String(s?.tgId ?? '') === String(decoded.id));
                                    const internalId = Number(found?.id);
                                    if (Number.isFinite(internalId) && internalId > 0) {
                                        try {
                                            localStorage.setItem('telegram_student_internal_id', String(internalId));
                                        } catch {
                                            // ignore
                                        }
                                        try {
                                            window.dispatchEvent(new CustomEvent('telegram-student-id-updated', { detail: { studentId: internalId } }));
                                        } catch {
                                            // ignore
                                        }
                                    }
                                } catch {
                                    // ignore
                                }
                            }
                        })();
                    }

                    // 5) Blokirovkani tekshirish
                    if (decoded?.isActive === false) {
                        setIsBlocked(true);
                    }

                    // 6) URL ni tozalash: faqat token paramni olib tashlash
                    try {
                        const qp = new URLSearchParams(window.location.search);
                        if (qp.has('token')) {
                            qp.delete('token');
                            const rest = qp.toString();
                            navigate(`${location.pathname}${rest ? `?${rest}` : ''}`, { replace: true });
                        }
                    } catch {
                        // ignore
                    }
                }
            } catch (error) {
                console.error('Token error:', error);
            } finally {
                setLoading(false);
            }
        };

        extractAndVerifyToken();
    }, [location.key, location.pathname, navigate]);

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