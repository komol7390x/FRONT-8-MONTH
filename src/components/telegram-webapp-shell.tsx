import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TelegramStudentBottomNav } from '../page/student/components/telegram-student-bottom-nav';

export const TelegramWebAppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const studentId = useMemo(() => {
        try {
            const v = Number(localStorage.getItem('telegram_student_internal_id') || localStorage.getItem('telegram_student_id') || 0);
            return Number.isFinite(v) && v > 0 ? v : 0;
        } catch {
            return 0;
        }
    }, [location.key]);

    useEffect(() => {
        setLoading(true);

        const qp = new URLSearchParams(window.location.search);
        const student = qp.get('student');
        if (student) {
            const sid = Number(student);
            if (Number.isFinite(sid) && sid > 0) {
                try {
                    localStorage.setItem('telegram_student_internal_id', String(sid));
                    localStorage.setItem('telegram_student_id', String(sid));
                } catch {
                    // ignore
                }
                try {
                    window.dispatchEvent(new CustomEvent('telegram-student-id-updated', { detail: { studentId: sid } }));
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