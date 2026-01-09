import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, List, User, CreditCard } from 'lucide-react';

interface TelegramStudentBottomNavProps {
    studentId?: number;
}

export const TelegramStudentBottomNav: React.FC<TelegramStudentBottomNavProps> = ({ studentId }) => {
    const navigate = useNavigate();
    const params = useParams();

    const effectiveStudentId = studentId ?? (params.studentId ? Number(params.studentId) : undefined) ?? 1;

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
            to: `/telegram/student/${effectiveStudentId}`,
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

                        return (
                            <button
                                key={item.key}
                                onClick={() => navigate(item.to)}
                                className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-600"
                            >
                                <Icon size={24} className="text-gray-600" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
