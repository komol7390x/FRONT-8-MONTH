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

    const isBlockedStudent = React.useMemo(() => {
        try {
            const blocked = localStorage.getItem('telegram_is_blocked') === '1';
            const role = String(localStorage.getItem('telegram_role') || '').toLowerCase();
            return blocked && role === 'student';
        } catch {
            return false;
        }
    }, []);

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

    const effectiveStudentId = React.useMemo(() => {
        if (typeof studentId === 'number' && studentId > 0) return studentId;
        if (params.studentId && Number(params.studentId) > 0) return Number(params.studentId);
        if (resolvedStudentId > 0) return resolvedStudentId;
        try {
            const idFromStorage = Number(localStorage.getItem('telegram_student_internal_id') || localStorage.getItem('telegram_student_id'));
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
            to: '/telegram/schedule',
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
                        const isDisabled = isBlockedStudent && item.key !== 'profile';

                        return (
                            <button
                                key={item.key}
                                disabled={isDisabled}
                                onClick={() => {
                                    if (isDisabled) return;
                                    navigate(item.to);
                                }}
                                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${isDisabled ? 'text-gray-300' : (isActive ? 'text-green-600' : 'text-gray-600')}`}
                            >
                                <Icon size={24} className={isDisabled ? 'text-gray-300' : (isActive ? 'text-green-600' : 'text-gray-600')} />
                                <span className={`text-xs font-medium ${isDisabled ? 'text-gray-300' : ''}`}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
