import React, { useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Clock, Loader2, Search } from 'lucide-react';
import { useTeacherSchedule, WeekDays } from '../service/useTeacherSchedule';
import type { Teacher } from '../service/useGetTeachers';

interface TeacherMoreScheduleProps {
    teacher: Teacher;
}

export const TeacherMoreSchedule: React.FC<TeacherMoreScheduleProps> = ({ teacher }) => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [activeFilter, setActiveFilter] = useState<string>('true');
    const [dayFilter, setDayFilter] = useState<string>('');
    const [search, setSearch] = useState('');

    const { data, isPending, isError, error } = useTeacherSchedule({
        teacherId: teacher.id,
        page,
        limit,
        active: activeFilter === '' ? undefined : activeFilter === 'true',
        day: dayFilter || undefined,
        search: search || undefined,
    });

    const scheduleList = data?.data || [];
    const meta = data?.meta;

    const totalPages = meta?.totalPages || 1;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-blue-700" />
                <p className="text-sm font-semibold text-gray-900">Schedule</p>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search schedule..."
                        className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                        value={dayFilter}
                        onChange={(e) => {
                            setDayFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    >
                        <option value="">All Days</option>
                        {Object.values(WeekDays).map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>

                    <select
                        value={activeFilter}
                        onChange={(e) => {
                            setActiveFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            {isPending ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    Loading schedule...
                </div>
            ) : isError ? (
                <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
                    Error loading schedule: {(error as any)?.message}
                </div>
            ) : scheduleList.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                    No schedule found
                </div>
            ) : (
                <div className="space-y-2">
                    {scheduleList.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="p-3 border rounded-lg bg-white border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-gray-900">{item.day || item.weekDay}</div>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                        <Clock size={14} />
                                        <span>{item.startTime} - {item.endTime || item.finishTime}</span>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {scheduleList.length > 0 && (
                <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page <= 1}
                            className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <ChevronLeft size={14} />
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page >= totalPages}
                            className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                        <span className="text-xs text-gray-600">
                            Page {page} / {totalPages}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
