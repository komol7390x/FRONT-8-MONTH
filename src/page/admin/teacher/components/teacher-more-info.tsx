import type React from 'react';
import { BriefcaseBusiness, CalendarClock, Copy, CreditCard, Hash, Link2, Mail, Phone, ShieldCheck, Star, User, Wallet } from 'lucide-react';
import type { Teacher } from '../service/useGetTeachers';
import { copyToClipboard, formatDateTime, formatNumber, toDisplay } from './teacher-utils';

interface TeacherMoreInfoProps {
    teacher: Teacher;
}

export const TeacherMoreInfo: React.FC<TeacherMoreInfoProps> = ({ teacher }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <User size={16} className="text-sky-700" />
                <p className="text-sm font-semibold text-gray-900">Info</p>
            </div>

            <div className="px-3 py-2 border rounded-lg bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-700">Status</span>
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${(teacher as any).isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {(teacher as any).isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${(teacher as any).isDeleted
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {(teacher as any).isDeleted ? 'Deleted' : 'Not Deleted'}
                        </span>
                    </div>
                </div>
            </div>

            {(
                [
                    { label: 'ID', value: teacher.id, copy: true, icon: <Hash size={14} className="text-sky-700" /> },
                    { label: 'Fullname', value: teacher.fullname, icon: <User size={14} className="text-emerald-700" /> },
                    { label: 'Email', value: teacher.email, copy: true, icon: <Mail size={14} className="text-violet-700" /> },
                    { label: 'Phone', value: teacher.phoneNumber, copy: true, icon: <Phone size={14} className="text-amber-700" /> },
                    { label: 'Role', value: (teacher as any).role, icon: <ShieldCheck size={14} className="text-rose-700" /> },
                    { label: 'Rating', value: formatNumber((teacher as any).rating ?? 0), icon: <Star size={14} className="text-yellow-700" /> },
                    { label: 'Experience', value: formatNumber((teacher as any).expirence ?? 0), icon: <BriefcaseBusiness size={14} className="text-sky-700" /> },
                    { label: 'Wallet', value: formatNumber((teacher as any).wallet ?? ''), icon: <Wallet size={14} className="text-emerald-700" /> },
                    { label: 'Card Number', value: (teacher as any).cardNumber, copy: true, icon: <CreditCard size={14} className="text-violet-700" /> },
                    { label: 'Portfolio', value: (teacher as any).portfolioLink, copy: true, icon: <Link2 size={14} className="text-amber-700" /> },
                    { label: 'Created At', value: formatDateTime((teacher as any).createdAt), icon: <CalendarClock size={14} className="text-rose-700" /> },
                    { label: 'Updated At', value: formatDateTime((teacher as any).updatedAt), icon: <CalendarClock size={14} className="text-rose-700" /> },
                ] as Array<{ label: string; value: unknown; copy?: boolean; icon?: React.ReactNode }>
            ).map((item) => {
                const displayValue = toDisplay(item.value);
                return (
                    <div key={item.label} className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{item.icon}</span>
                            <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">{item.label}</span>
                            <span className="text-xs font-medium text-gray-900 min-w-0 flex-1 truncate" title={displayValue}>
                                {displayValue}
                            </span>
                            {item.copy && !!displayValue && (
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.value)}
                                    className="shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    title="Copy"
                                >
                                    <Copy size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
