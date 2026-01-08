import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tag, Select } from 'antd';
import { CalendarDays, Clock, DollarSign, Link2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useStudentLessons } from './service/useStudentLessons';
import { PageLoader } from '../../components/page-loader';
import { WeekDays } from '../../config/weekdays';

export const StudentLessonsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const initialDay = searchParams.get('weekday') || '';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialLimit = Number(searchParams.get('limit')) || 10;
    const initialSearch = searchParams.get('search') || '';
    const initialStatus = searchParams.get('status') || 'booked';

    const [dayFilter, setDayFilter] = useState<string>(initialDay);
    const [page, setPage] = useState<number>(initialPage);
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus);

    const { data: lessonsData, isPending } = useStudentLessons({
        status: statusFilter,
        weekday: dayFilter || undefined,
        search: initialSearch,
        page,
        limit: initialLimit,
    });

    useEffect(() => {
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        if (dayFilter) params.weekday = dayFilter;
        if (page > 1) params.page = String(page);
        if (initialLimit !== 10) params.limit = String(initialLimit);
        if (initialSearch) params.search = initialSearch;
        
        setSearchParams(params);
    }, [statusFilter, dayFilter, page, initialLimit, initialSearch, setSearchParams]);

    const getCurrentWeekDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const currentDayIndex = now.getDay();
        const targetDayIndex = days.indexOf(dayName);
        
        if (targetDayIndex === -1) return '';

        const diff = targetDayIndex - currentDayIndex;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + diff);

        return targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    };

    const formatTime = (ms: number | null): string => {
        if (!ms) return '-';
        const d = new Date(ms);
        return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const toMs = (value: unknown): number | null => {
        if (value == null) return null;
        const n = Number(value);
        if (Number.isFinite(n)) return n < 1_000_000_000_000 ? n * 1000 : n;
        const d = new Date(String(value));
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    };

    const dayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        if (lessonsData?.data) {
            lessonsData.data.forEach((item: any) => {
                const d = item.weekday || item.weekDays || item.day;
                if (d) counts[d] = (counts[d] || 0) + 1;
            });
        }
        return counts;
    }, [lessonsData?.data]);

    if (isPending && !lessonsData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
            <div className="max-w-md mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={20} className="text-blue-600" />
                        <h1 className="text-lg font-bold text-gray-900">My Lessons</h1>
                    </div>

                    {/* Status Filter */}
                    <div className="mb-4">
                        <Select
                            placeholder="Filter by Status"
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setPage(1);
                            }}
                            className="w-full"
                            options={[
                                { value: 'booked', label: 'Booked' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' },
                                { value: 'expired', label: 'Expired' },
                            ]}
                        />
                    </div>

                    {/* Day Filters */}
                    <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                        {Object.values(WeekDays).map((day) => {
                            const dateStr = getCurrentWeekDate(day);
                            const isActive = dayFilter === day;
                            const count = dayCounts[day] || 0;

                            return (
                                <button
                                    key={day}
                                    onClick={() => {
                                        setDayFilter(day === dayFilter ? '' : day);
                                        setPage(1);
                                    }}
                                    className={`flex-shrink-0 py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 min-w-[60px]
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : count > 0
                                                ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 border border-gray-200 opacity-60'
                                        }`}
                                >
                                    <span>{day.slice(0, 3)}</span>
                                    <span className={`text-[10px] font-normal ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{dateStr}</span>
                                    {count > 0 && !isActive && (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px] leading-none">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    {lessonsData?.data?.map((lesson: any) => {
                        const startMs = toMs(lesson.startTime);
                        const finishMs = toMs(lesson.finishTime || lesson.endTime);
                        const status = String(lesson.status || '').toLowerCase();
                        const statusColor = status === 'booked' ? 'blue' : status === 'completed' ? 'green' : status === 'cancelled' ? 'red' : 'default';
                        
                        return (
                            <Card key={lesson.id} className="rounded-2xl shadow-sm border-gray-200 overflow-hidden" bodyStyle={{ padding: '16px' }}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base">{lesson.lessonName || 'Lesson'}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Clock size={12} />
                                            <span>{formatTime(startMs)} - {formatTime(finishMs)}</span>
                                        </div>
                                    </div>
                                    <Tag color={statusColor as any}>{lesson.status || 'Unknown'}</Tag>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                                        <DollarSign size={16} />
                                        <span>{Number(lesson.lessonPrice || 0).toLocaleString()} UZS</span>
                                    </div>
                                    
                                    {lesson.meetLink && (
                                        <a
                                            href={lesson.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            <Link2 size={14} />
                                            Join Meeting
                                        </a>
                                    )}
                                </div>
                            </Card>
                        );
                    })}

                    {(!lessonsData?.data || lessonsData.data.length === 0) && (
                        <div className="text-center py-10 text-gray-500">
                            No lessons found for this filter.
                        </div>
                    )}
                </div>

                {lessonsData?.meta?.totalPages && lessonsData.meta.totalPages > 1 && (
                    <div className="flex justify-center pb-6 gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">
                            Page {page} of {lessonsData.meta?.totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(lessonsData.meta?.totalPages || 1, page + 1))}
                            disabled={page >= (lessonsData.meta?.totalPages || 1)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
