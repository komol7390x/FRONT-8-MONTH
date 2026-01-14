import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { request } from '../config/request';

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
    const [role, setRole] = useState<string>('');

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
                    if (decoded?.role != null) {
                        const r = String(decoded.role);
                        setRole(r);
                        try {
                            localStorage.setItem('telegram_role', r);
                        } catch {
                            // ignore
                        }
                    }
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
                        try {
                            localStorage.setItem('telegram_is_blocked', '1');
                        } catch {
                            // ignore
                        }
                    } else {
                        try {
                            localStorage.removeItem('telegram_is_blocked');
                        } catch {
                            // ignore
                        }
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
        if (!isBlocked) return;

        const normalizedRole = String(role || '').toLowerCase();
        if (normalizedRole !== 'student') return;

        const isOnProfile = location.pathname.startsWith('/telegram/student/');
        if (isOnProfile) return;

        let id = 0;
        try {
            id = Number(localStorage.getItem('telegram_student_internal_id') || localStorage.getItem('telegram_student_id') || 0);
        } catch {
            id = 0;
        }
        navigate(`/telegram/student/${id || 0}`, { replace: true });
    }, [isBlocked, location.pathname, navigate, role]);

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

    return (
        <>
            {children}
            {loading && (
                <div className="fixed left-0 right-0 bottom-24 z-50 flex justify-center px-4">
                    <button
                        type="button"
                        disabled
                        className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-lg py-3 text-sm font-bold text-gray-600"
                    >
                        Loading...
                    </button>
                </div>
            )}
        </>
    );
};