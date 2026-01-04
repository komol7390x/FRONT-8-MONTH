import type React from 'react';
import { CalendarClock, Hash, Mail, MoreHorizontal, Phone, UserRound } from 'lucide-react';
import type { Teacher } from '../service/useGetTeachers';
import { getInitials } from './teacher-utils';

interface TeacherTableProps {
    teachers: Teacher[];
    page: number;
    limit: number;
    onMore: (t: Teacher) => void;
}

export const TeacherTable: React.FC<TeacherTableProps> = ({ teachers, page, limit, onMore }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-8 px-3 sm:px-4 bg-gray-50 py-3 sm:py-4 border-b border-gray-200 font-semibold text-sm text-gray-700">
                <div className="col-span-1 pr-5 flex items-center gap-2"><Hash size={14} /> №</div>
                <div className="col-span-1 pr-5 flex items-center gap-2"><Hash size={14} /> ID</div>
                <div className="col-span-1 pr-5 flex items-center gap-2"><UserRound size={14} /> Name</div>
                <div className="col-span-1 pr-5">Status</div>
                <div className="col-span-1 pr-5 flex items-center gap-2"><Mail size={14} /> Email</div>
                <div className="col-span-1 pr-5 flex items-center gap-2"><Phone size={14} /> Phone</div>
                <div className="col-span-1 pr-2 sm:pr-4 lg:pr-6 flex items-center gap-2"><CalendarClock size={14} /> Created</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {teachers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No teachers found</div>
            ) : (
                teachers.map((t, idx) => {
                    const isDeletedRow = !!t.isDeleted;
                    const createdAt = t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : '-';

                    return (
                        <div
                            key={t.id}
                            className={`grid grid-cols-8 px-3 sm:px-4 py-3 sm:py-4 border-b items-center transition-colors cursor-pointer ${isDeletedRow
                                ? 'bg-red-50 border-red-200'
                                : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => onMore(t)}
                        >
                            <div className="col-span-1 pr-5">
                                <span className="text-sm font-semibold text-gray-700">{((page - 1) * limit) + idx + 1}</span>
                            </div>

                            <div className="col-span-1 pr-5">
                                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{t.id}</span>
                            </div>

                            <div className="col-span-1 pr-5 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                                        {getInitials(t.fullname)}
                                    </div>
                                    <div className="leading-tight min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{t.fullname}</p>
                                        <p className="text-xs text-gray-500 truncate">{t.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 pr-5">
                                {isDeletedRow ? (
                                    <span className="inline-block px-3 py-1.5 rounded text-sm font-medium bg-red-700 text-white min-w-22 text-center">
                                        Deleted
                                    </span>
                                ) : t.isActive ? (
                                    <span className="inline-block px-3 py-1.5 rounded text-sm font-medium bg-green-600 text-white min-w-22 text-center">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-block px-3 py-1.5 rounded text-sm font-medium bg-red-600 text-white min-w-22 text-center">
                                        Blocked
                                    </span>
                                )}
                            </div>

                            <div className="col-span-1 pr-5 min-w-0">
                                <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                                    <Mail size={14} className="shrink-0" />
                                    <span className="flex-1 min-w-0 truncate">{t.email}</span>
                                </div>
                            </div>

                            <div className="col-span-1 pr-5 min-w-0">
                                <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                                    <Phone size={14} className="shrink-0" />
                                    <span className="flex-1 min-w-0 truncate">{t.phoneNumber}</span>
                                </div>
                            </div>

                            <div className="col-span-1 pr-2 sm:pr-4 lg:pr-6">
                                <span className="text-xs text-gray-700 font-medium">{createdAt}</span>
                            </div>

                            <div className="col-span-1 flex justify-end items-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMore(t);
                                    }}
                                    className="px-3 py-1.5 bg-sky-500 text-white rounded text-sm font-medium hover:bg-sky-600 transition-colors flex items-center gap-2"
                                >
                                    <MoreHorizontal size={12} />
                                    More
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};
