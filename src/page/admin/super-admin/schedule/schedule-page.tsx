import React, { useState } from 'react';
import { CalendarClock, Clock, Loader2, Search } from 'lucide-react';
import { useTeacherSchedule, WeekDays } from '../teacher/service/useTeacherSchedule';
import { Pagination } from '../admin/components/pagantion';

export const SchedulePage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [activeFilter, setActiveFilter] = useState<string>('true');
    const [dayFilter, setDayFilter] = useState<string>('');
    const [search, setSearch] = useState('');

    const { data, isPending, isError, error } = useTeacherSchedule({
        page,
        limit,
        active: activeFilter === '' ? undefined : activeFilter === 'true',
        day: dayFilter || undefined,
        search: search || undefined,
    });

    const scheduleList = data?.data || [];
    const meta = data?.meta;
    const totalPages = meta?.totalPages || 1;
    const totalCount = meta?.totalItems || scheduleList.length;

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex items-center gap-2">
                    <CalendarClock size={24} className="text-blue-700" />
                    <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
                </div>

                {/* Week Day Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {Object.values(WeekDays).map((day) => (
                        <button
                            key={day}
                            onClick={() => {
                                setDayFilter(day === dayFilter ? '' : day);
                                setPage(1);
                            }}
                            className={`py-3 px-2 rounded-xl text-sm font-bold shadow-sm transition-all
                                ${dayFilter === day
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 transform scale-105'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search schedule..."
                                className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm shadow-sm"
                            />
                        </div>

                        <select
                            value={activeFilter}
                            onChange={(e) => {
                                setActiveFilter(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm shadow-sm"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                {isPending ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                    </div>
                ) : isError ? (
                    <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
                        Error loading schedule: {(error as any)?.message}
                    </div>
                ) : scheduleList.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-xl bg-white">
                        No schedule found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scheduleList.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="p-4 border rounded-xl bg-white border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
                                        {item.day || item.weekDay}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock size={16} className="text-gray-400" />
                                        <span className="font-medium">{item.startTime} - {item.endTime || item.finishTime}</span>
                                    </div>
                                    {item.teacherId && (
                                        <div className="text-xs text-gray-500">
                                            Teacher ID: {item.teacherId}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!!totalPages && (
                    <Pagination
                        page={page}
                        limit={limit}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        admins={scheduleList as any}
                        setPage={setPage}
                        handleLimitChange={handleLimitChange}
                    />
                )}
            </div>
        </div>
    );
};
