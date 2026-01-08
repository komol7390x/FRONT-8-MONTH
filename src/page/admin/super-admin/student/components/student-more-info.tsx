import type React from 'react';
import { CalendarClock, Copy, Hash, Phone, UserRound } from 'lucide-react';
import type { Student } from '../service/useGetStudents';

interface StudentMoreInfoProps {
    student: Student;
}

export const StudentMoreInfo: React.FC<StudentMoreInfoProps> = ({ student }) => {
    const fullname = `${student.firstName || ''} ${student.lastName || ''}`.trim();
    const createdAt = student.createdAt
        ? new Date(student.createdAt).toLocaleString('uz-UZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const updatedAt = student.updatedAt
        ? new Date(student.updatedAt).toLocaleString('uz-UZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-';

    return (
        <div className="space-y-2">
            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <Hash size={14} className="text-sky-700 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">{student.id}</span>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(String(student.id))}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <UserRound size={14} className="text-violet-700 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Name</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">{fullname || '-'}</span>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(fullname)}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <Phone size={14} className="text-emerald-700 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Phone</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">{student.phoneNumber || '-'}</span>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(student.phoneNumber || '')}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <Hash size={14} className="text-blue-700 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">TG ID</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">{student.tgId || '-'}</span>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(student.tgId || '')}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <Hash size={14} className="text-indigo-700 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">TG Username</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">@{student.tgUsername || '-'}</span>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(student.tgUsername || '')}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <CalendarClock size={14} className="text-gray-700 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Created</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">{createdAt}</span>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(createdAt)}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <CalendarClock size={14} className="text-gray-700 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Updated</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">{updatedAt}</span>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(updatedAt)}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            {student.blockedReason && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800">Blocked reason</p>
                    <p className="text-xs text-amber-800 mt-1">{student.blockedReason}</p>
                </div>
            )}

            <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Balance</span>
                    <span className="text-xs font-medium text-gray-900 flex-1 truncate">{student.wallet || '0'} UZS</span>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = `/super-admin/student/add-balance/${student.id}?balance=${student.wallet || 0}`;
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        title="Add Balance"
                    >
                        Add Balance
                    </button>
                </div>
            </div>
        </div>
    );
};
