import type React from 'react';
import { CalendarClock, Copy, Hash, Phone, ShieldCheck, User } from 'lucide-react';

import type { Admin } from '../service/useGetList';
import { copyToClipboard, formatDateTime, toDisplay } from '../../teacher/components/teacher-utils';

interface AdminMoreInfoProps {
    admin: Admin;
}

export const AdminMoreInfo: React.FC<AdminMoreInfoProps> = ({ admin }) => {
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
                            className={`text-xs font-semibold px-2 py-1 rounded ${admin.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${admin.isDeleted
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {admin.isDeleted ? 'Deleted' : 'Not Deleted'}
                        </span>
                    </div>
                </div>
            </div>

            {(
                [
                    { label: 'ID', value: admin.id, copy: true, icon: <Hash size={14} className="text-sky-700" /> },
                    { label: 'Fullname', value: admin.fullname, copy: true, icon: <User size={14} className="text-emerald-700" /> },
                    { label: 'Username', value: admin.username ? `@${admin.username}` : '', copy: true, icon: <User size={14} className="text-violet-700" /> },
                    { label: 'Phone', value: admin.phoneNumber, copy: true, icon: <Phone size={14} className="text-amber-700" /> },
                    { label: 'Role', value: admin.role, icon: <ShieldCheck size={14} className="text-rose-700" /> },
                    { label: 'Created At', value: formatDateTime((admin as any).createdAt), copy: true, icon: <CalendarClock size={14} className="text-rose-700" /> },
                    { label: 'Updated At', value: formatDateTime((admin as any).updatedAt), copy: true, icon: <CalendarClock size={14} className="text-rose-700" /> },
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
