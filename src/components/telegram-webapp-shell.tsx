import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { request } from '../config/request';
import { PageLoader } from './page-loader';

const decodeJwtPayload = (token: string): any | null => {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
        const json = decodeURIComponent(
            Array.prototype.map
                .call(atob(b64 + pad), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
};

const getTelegramToken = (): string => {
    try {
        const t = localStorage.getItem('telegram_token');
        if (t) return String(t);
    } catch {
        // ignore
    }

    try {
        const cookieValue = document.cookie
            .split(';')
            .map((s) => s.trim())
            .find((c) => c.startsWith('telegram_token='));
        if (cookieValue) {
            const v = cookieValue.split('=')[1];
            if (v) return decodeURIComponent(String(v));
        }
    } catch {
        // ignore
    }

    try {
        const href = window.location.href;
        const qIndex = href.indexOf('?');
        const hIndex = href.indexOf('#');

        const queryPart = qIndex >= 0
            ? href.slice(qIndex + 1, hIndex >= 0 ? hIndex : undefined)
            : '';

        const hashPart = hIndex >= 0 ? href.slice(hIndex + 1) : '';
        const hashQuery = hashPart.includes('?') ? hashPart.split('?')[1] : '';

        const qp = new URLSearchParams(queryPart || hashQuery);
        const t = qp.get('token');
        if (t) {
            try {
                localStorage.setItem('telegram_token', String(t));
            } catch {
                // ignore
            }
            try {
                document.cookie = `telegram_token=${encodeURIComponent(String(t))}; path=/; samesite=lax`;
            } catch {
                // ignore
            }
            return String(t);
        }
    } catch {
        // ignore
    }

    return '';
};

const getTelegramUserId = (): string => {
    try {
        const tgId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (tgId == null) return '';
        return String(tgId);
    } catch {
        return '';
    }
};

export const TelegramWebAppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
    const location = useLocation();

    const token = useMemo(() => getTelegramToken(), [location.key]);
    const tokenPayload = useMemo(() => {
        if (!token) return null;
        return decodeJwtPayload(token);
    }, [token]);

    const studentIdFromToken = useMemo(() => {
        const id = Number(tokenPayload?.id ?? tokenPayload?.studentId ?? tokenPayload?.userId);
        return Number.isFinite(id) && id > 0 ? id : 0;
    }, [tokenPayload]);

    const studentIdFromStorage = useMemo(() => {
        try {
            const v = localStorage.getItem('telegram_student_id');
            const n = Number(v);
            return Number.isFinite(n) && n > 0 ? n : 0;
        } catch {
            return 0;
        }
    }, [location.key]);

    const [studentIdResolved, setStudentIdResolved] = useState<number>(0);

    const studentId = studentIdFromToken || studentIdResolved || studentIdFromStorage;

    const [serverActive, setServerActive] = useState<boolean | null>(null);
    const [serverCheckPending, setServerCheckPending] = useState<boolean>(false);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!studentId) {
                setServerActive(null);
                return;
            }
            setServerCheckPending(true);
            try {
                const res = await request.get(`/student/${studentId}`);
                const raw: any = res?.data;
                const active = raw?.data?.isActive;
                if (!cancelled) {
                    setServerActive(typeof active === 'boolean' ? active : null);
                }
            } catch {
                if (!cancelled) {
                    setServerActive(null);
                }
            } finally {
                if (!cancelled) {
                    setServerCheckPending(false);
                }
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [studentId, location.pathname]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (studentIdFromToken || studentIdFromStorage) return;
            const tgId = getTelegramUserId();
            if (!tgId) return;

            try {
                const res = await request.get(`/student/telegram/${tgId}`);
                const raw: any = res?.data;
                const id = Number(raw?.data?.id ?? raw?.data?.data?.id);
                if (cancelled) return;
                if (Number.isFinite(id) && id > 0) {
                    try {
                        localStorage.setItem('telegram_student_id', String(id));
                    } catch {
                        // ignore
                    }

                    try {
                        window.dispatchEvent(new CustomEvent('telegram-student-id-updated', { detail: { studentId: id } }));
                    } catch {
                        // ignore
                    }

                    if (!cancelled) {
                        setStudentIdResolved(id);
                    }
                }
            } catch {
                // ignore
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [studentIdFromStorage, studentIdFromToken, location.key]);

    const isBlocked = useMemo(() => {
        if (studentId) {
            return serverActive === false;
        }
        return tokenPayload?.isActive === false;
    }, [serverActive, studentId, tokenPayload?.isActive]);

    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) return;

        try {
            tg.ready();
        } catch {
            // ignore
        }

        try {
            tg.expand();
        } catch {
            // ignore
        }

        try {
            tg.disableVerticalSwipes?.();
        } catch {
            // ignore
        }

        try {
            tg.setHeaderColor?.('#ffffff');
            tg.setBackgroundColor?.('#f9fafb');
        } catch {
            // ignore
        }

        const setViewportHeight = () => {
            try {
                const vh = Number(tg.viewportHeight);
                if (Number.isFinite(vh) && vh > 0) {
                    document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
                }
            } catch {
                // ignore
            }
        };

        setViewportHeight();

        try {
            tg.onEvent?.('viewportChanged', setViewportHeight);
        } catch {
            // ignore
        }

        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        const prevBodyHeight = document.body.style.height;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';

        return () => {
            try {
                tg.offEvent?.('viewportChanged', setViewportHeight);
            } catch {
                // ignore
            }
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
            document.body.style.height = prevBodyHeight;
        };
    }, [location.pathname]);

    if (isBlocked) {
        return (
            <div className="min-h-screen bg-gray-50 px-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                <div className="max-w-md mx-auto">
                    <div className="mt-16 bg-white rounded-2xl border border-red-200 shadow-sm p-5">
                        <div className="text-lg font-bold text-red-700">You are blocked</div>
                        <div className="mt-2 text-sm text-gray-700">
                            Please contact support or your admin to unlock your account.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ height: 'var(--tg-viewport-height, 100vh)', overflow: 'hidden' }}>
            <div style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {children}
            </div>
            {studentId && serverCheckPending && (
                <div className="fixed inset-0 bg-gray-50/70 z-10 flex items-center justify-center pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    <PageLoader />
                </div>
            )}
        </div>
    );
};
