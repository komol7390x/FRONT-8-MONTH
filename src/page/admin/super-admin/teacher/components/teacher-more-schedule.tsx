import React, { useState, useMemo } from 'react';
import { CalendarClock, Clock, Loader2, Plus, Search } from 'lucide-react';
import { useTeacherSchedule } from '../service/useTeacherSchedule';
import type { Teacher } from '../service/useGetTeachers';
import { ScheduleCreateModal } from '../../schedule/components/schedule-create-modal';
import { Pagination } from '../../admin/components/pagantion';

interface TeacherMoreScheduleProps {
    teacher: Teacher;
}

export const TeacherMoreSchedule: React.FC<TeacherMoreScheduleProps> = ({ teacher }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [activeFilter, setActiveFilter] = useState<string>('true');
    const [dayFilter, setDayFilter] = useState<string>('');
    const [search, setSearch] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Fetch stats (all items to count days)
    const statsQuery = useTeacherSchedule({
        teacherId: teacher.id,
        limit: 1000, // Fetch enough to count
        active: true
    });

    const { data, isPending, isError, error, refetch } = useTeacherSchedule({
        teacherId: teacher.id,
        page,
        limit,
        active: activeFilter === '' ? undefined : activeFilter === 'true',
        weekday: dayFilter || undefined,
        search: search || undefined,
    });

    const scheduleList = data?.data || [];
    const meta = data?.meta;

    const totalPages = meta?.totalPages || 1;
    const totalCount = meta?.totalItems || 0;

    // Calculate day counts
    const dayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        if (statsQuery.data?.data) {
            statsQuery.data.data.forEach((item: any) => {
                const d = item.weekDays || item.day;
                if (d) counts[d] = (counts[d] || 0) + 1;
            });
        }
        return counts;
    }, [statsQuery.data]);

    const rollingDays = useMemo(() => {
        const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const base = new Date();
        base.setHours(0, 0, 0, 0);
        return Array.from({ length: 12 }).map((_, i) => {
            const d = new Date(base);
            d.setDate(d.getDate() + i);
            const weekday = order[d.getDay()] || '';
            const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
            return { weekday, dateStr };
        });
    }, []);

    const hasActiveCertificate = useMemo(() => {
        return teacher.certificates?.some((c: any) => c.isActive);
    }, [teacher.certificates]);

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <CalendarClock size={16} className="text-blue-700" />
                    <p className="text-sm font-semibold text-gray-900">Schedule</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    disabled={!hasActiveCertificate}
                    title={!hasActiveCertificate ? "Certificate inactive or missing" : "Add Schedule"}
                    className={`px-3 py-1.5 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors
                        ${hasActiveCertificate
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    <Plus size={12} />
                    Add
                </button>
            </div>

            <div className="space-y-3">
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

                <div className="grid grid-cols-4 gap-2">
                    {rollingDays.map((slot, idx) => {
                        const day = slot.weekday as any;
                        const count = dayCounts[day] || 0;
                        const isActiveDay = count > 0;
                        const isSelected = dayFilter === day;

                        return (
                            <button
                                key={`${slot.weekday}-${slot.dateStr}-${idx}`}
                                onClick={() => {
                                    if (!isActiveDay) return;
                                    setDayFilter(isSelected ? '' : String(day));
                                    setPage(1);
                                }}
                                disabled={!isActiveDay}
                                className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center min-h-[3.25rem]
                                    ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : isActiveDay
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                                            : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                <span>{String(day).slice(0, 3)}</span>
                                <span className="text-[10px] font-normal opacity-80">{slot.dateStr}</span>
                                {isActiveDay && (
                                    <span className="mt-0.5 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] leading-none">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

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
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">{item.day || item.weekDays}</span>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.lessonName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                        <Clock size={14} />
                                        <span className="font-medium">{formatTime(item.startTime)} - {formatTime(item.endTime || item.finishTime)}</span>
                                    </div>
                                    {item.price && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {Number(item.price).toLocaleString()} UZS
                                        </div>
                                    )}
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </div>
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

            <ScheduleCreateModal
                open={isCreateOpen}
                teacherId={teacher.id}
                certificates={teacher.certificates}
                onClose={() => setIsCreateOpen(false)}
                onCreated={() => {
                    refetch();
                    statsQuery.refetch();
                }}
            />
        </div>
    );
};
