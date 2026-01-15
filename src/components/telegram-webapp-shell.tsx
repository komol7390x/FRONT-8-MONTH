import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TelegramStudentBottomNav } from '../page/student/components/telegram-student-bottom-nav';
import { request } from '../config/request';

export const TelegramWebAppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const readCachedStudentId = (): number => {
        try {
            const raw = localStorage.getItem('telegram_student_internal_id_cache');
            if (!raw) return 0;
            const parsed = JSON.parse(raw);
            const value = Number(parsed?.value);
            const expiresAt = Number(parsed?.expiresAt);
            if (!Number.isFinite(value) || value <= 0) return 0;
            if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return 0;
            return value;
        } catch {
            return 0;
        }
    };

    const writeCachedStudentId = (id: number) => {
        try {
            const ttlMs = 24 * 60 * 60 * 1000;
            localStorage.setItem('telegram_student_internal_id_cache', JSON.stringify({ value: id, expiresAt: Date.now() + ttlMs }));
        } catch {
            // ignore
        }
    };

    const [resolvedStudentId, setResolvedStudentId] = useState<number>(() => {
        try {
            const cached = readCachedStudentId();
            if (cached > 0) return cached;
        } catch {
            // ignore
        }
        try {
            const v = Number(localStorage.getItem('telegram_student_internal_id') || localStorage.getItem('telegram_student_id') || 0);
            return Number.isFinite(v) && v > 0 ? v : 0;
        } catch {
            return 0;
        }
    });

    const studentId = useMemo(() => {
        return resolvedStudentId;
    }, [resolvedStudentId]);

    useEffect(() => {
        setLoading(true);

        const qp = new URLSearchParams(window.location.search);
        const student = qp.get('student');
        if (student) {
            const sid = Number(student);
            (async () => {
                if (Number.isFinite(sid) && sid > 0) {
                    let internalId = 0;
                    try {
                        const res = await request.get(`/student/${sid}`);
                        internalId = Number((res as any)?.data?.data?.id ?? (res as any)?.data?.id ?? sid);
                    } catch {
                        internalId = 0;
                    }

                    if (!internalId) {
                        try {
                            const res = await request.get('/student', {
                                params: {
                                    search: String(sid),
                                    page: 1,
                                    limit: 50,
                                },
                            });
                            const raw: any = (res as any)?.data;
                            const items: any[] = Array.isArray(raw?.data) ? raw.data : [];
                            const found = items.find((s: any) => String(s?.tgId ?? '') === String(sid) || String(s?.id ?? '') === String(sid));
                            internalId = Number(found?.id || 0);
                        } catch {
                            internalId = 0;
                        }
                    }

                    const finalId = Number.isFinite(internalId) && internalId > 0 ? internalId : sid;
                    try {
                        localStorage.setItem('telegram_student_internal_id', String(finalId));
                        localStorage.setItem('telegram_student_id', String(finalId));
                    } catch {
                        // ignore
                    }
                    writeCachedStudentId(finalId);
                    setResolvedStudentId(finalId);
                    try {
                        window.dispatchEvent(new CustomEvent('telegram-student-id-updated', { detail: { studentId: finalId } }));
                    } catch {
                        // ignore
                    }
                }

                try {
                    qp.delete('student');
                    const rest = qp.toString();
                    navigate(`${location.pathname}${rest ? `?${rest}` : ''}`, { replace: true });
                } catch {
                    // ignore
                }

                setLoading(false);
            })();
            return;
        }

        const t = window.setTimeout(() => setLoading(false), 250);
        return () => window.clearTimeout(t);
    }, [location.key, location.pathname, navigate]);

    return (
        <div className="telegram-webapp min-h-screen bg-gray-50 font-sans">
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="text-[14px] font-normal text-gray-900">Online School</div>
                    <div className="text-[12px] font-normal text-gray-500">Telegram</div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-4 pb-24">
                {loading ? (
                    <div className="py-16 flex items-center justify-center">
                        <div className="text-[14px] font-normal text-gray-500">Loading...</div>
                    </div>
                ) : (
                    children
                )}
            </div>

            <TelegramStudentBottomNav studentId={studentId || undefined} />
        </div>
    );
};