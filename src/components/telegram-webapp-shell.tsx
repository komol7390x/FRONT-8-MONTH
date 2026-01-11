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
        const sp = new URLSearchParams(window.location.search);
        const t = sp.get('token');
        if (t) return String(t);
    } catch {
        // ignore
    }

    return '';
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

    const [serverActive, setServerActive] = useState<boolean | null>(null);
    const [serverCheckPending, setServerCheckPending] = useState<boolean>(false);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!studentIdFromToken) {
                setServerActive(null);
                return;
            }
            setServerCheckPending(true);
            try {
                const res = await request.get(`/student/${studentIdFromToken}`);
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
    }, [studentIdFromToken, location.pathname]);

    const isBlocked = useMemo(() => {
        if (studentIdFromToken) {
            return serverActive === false;
        }
        return tokenPayload?.isActive === false;
    }, [serverActive, studentIdFromToken, tokenPayload?.isActive]);

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

        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        const prevBodyHeight = document.body.style.height;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';

        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
            document.body.style.height = prevBodyHeight;
        };
    }, [location.pathname]);

    if (studentIdFromToken && serverCheckPending) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <PageLoader />
            </div>
        );
    }

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
        <div className="min-h-screen" style={{ height: '100vh', overflow: 'hidden' }}>
            <div style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {children}
            </div>
        </div>
    );
};
