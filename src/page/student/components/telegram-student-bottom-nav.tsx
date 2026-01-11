import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, List, User, CreditCard } from 'lucide-react';

interface TelegramStudentBottomNavProps {
    studentId?: number;
}

export const TelegramStudentBottomNav: React.FC<TelegramStudentBottomNavProps> = ({ studentId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const [resolvedStudentId, setResolvedStudentId] = React.useState<number>(0);

    React.useEffect(() => {
        const handler = (e: any) => {
            const id = Number(e?.detail?.studentId);
            if (Number.isFinite(id) && id > 0) {
                setResolvedStudentId(id);
            }
        };
        window.addEventListener('telegram-student-id-updated', handler as any);
        return () => window.removeEventListener('telegram-student-id-updated', handler as any);
    }, []);

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

    const effectiveStudentId = React.useMemo(() => {
        if (typeof studentId === 'number' && studentId > 0) return studentId;
        if (params.studentId && Number(params.studentId) > 0) return Number(params.studentId);
        if (resolvedStudentId > 0) return resolvedStudentId;
        try {
            const t = localStorage.getItem('telegram_token') || '';
            const payload = t ? decodeJwtPayload(t) : null;
            const id = Number(payload?.id ?? payload?.studentId ?? payload?.userId);
            return Number.isFinite(id) && id > 0 ? id : 0;
        } catch {
            // ignore
        }

        try {
            const idFromStorage = Number(localStorage.getItem('telegram_student_id'));
            return Number.isFinite(idFromStorage) && idFromStorage > 0 ? idFromStorage : 0;
        } catch {
            return 0;
        }
    }, [params.studentId, resolvedStudentId, studentId]);

    const items = [
        {
            key: 'schedule',
            label: 'Schedule',
            icon: CalendarDays,
            to: '/telegram/student-schedule',
        },
        {
            key: 'lessons',
            label: 'Lessons',
            icon: List,
            to: '/telegram/student-lessons',
        },
        {
            key: 'profile',
            label: 'Profile',
            icon: User,
            to: effectiveStudentId ? `/telegram/student/${effectiveStudentId}` : '/telegram/student/0',
        },
        {
            key: 'payment',
            label: 'Payment',
            icon: CreditCard,
            to: '/telegram/student-payments',
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-around py-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

                        return (
                            <button
                                key={item.key}
                                onClick={() => navigate(item.to)}
                                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${isActive ? 'text-green-600' : 'text-gray-600'}`}
                            >
                                <Icon size={24} className={isActive ? 'text-green-600' : 'text-gray-600'} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
