import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tag, Button, Select, message } from 'antd';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentSchedule } from './service/useStudentSchedule';
import { PageLoader } from '../../components/page-loader';
import { useGetTeachers } from '../../page/admin/super-admin/teacher/service/useGetTeachers';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentSchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial params from URL
    const initialTeacherId = Number(searchParams.get('teacherId')) || undefined;
    const initialDay = searchParams.get('day') || '';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialLimit = Number(searchParams.get('limit')) || 10;
    const initialLessonName = searchParams.get('lessonName') || '';
    const initialMinPrice = searchParams.get('minPrice') || '';
    const initialMaxPrice = searchParams.get('maxPrice') || '';

    const [dayFilter, setDayFilter] = useState<string>(initialDay);
    const [page, setPage] = useState<number>(initialPage);
    const [teacherId, setTeacherId] = useState<number | undefined>(initialTeacherId);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [lessonName, setLessonName] = useState<string>(initialLessonName);
    const [minPrice, setMinPrice] = useState<string>(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice);

    // Get teachers list for filter
    const { data: teachersData } = useGetTeachers({ page: 1, limit: 100, status: true });
    const teachers = teachersData?.data || [];

    // For now, hardcode studentId or get from somewhere. 
    // In a real Telegram Web App, this would come from initData.
    // The user example had 1.
    const studentId = 1;

    const isBooking = false;

    const { data: scheduleData, isPending } = useStudentSchedule({
        teacherId,
        active: true,
        page: 1,
        limit: 1000,
    });

    useEffect(() => {
        if (initialDay) return;
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[now.getDay()] || '';
        if (today) setDayFilter(today);
    }, [initialDay]);

    // Update URL when filters change
    useEffect(() => {
        const params: any = {};
        if (teacherId) params.teacherId = String(teacherId);
        if (dayFilter) params.day = dayFilter;
        if (page > 1) params.page = String(page);
        if (initialLimit !== 10) params.limit = String(initialLimit);
        if (lessonName) params.lessonName = lessonName;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        params.active = 'true';

        setSearchParams(params);
    }, [teacherId, dayFilter, page, initialLimit, lessonName, minPrice, maxPrice, setSearchParams]);

    const rollingWeek = useMemo(() => {
        const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayIdx = new Date().getDay();
        const res: Array<{ day: string; dateStr: string }> = [];
        for (let i = 0; i < 7; i++) {
            const idx = (todayIdx + i) % 7;
            const day = order[idx];
            const d = new Date();
            d.setDate(d.getDate() + i);
            res.push({
                day,
                dateStr: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            });
        }
        return res;
    }, []);

    const formatTime = (ms: number | null): string => {
        if (!ms) return '-';
        const d = new Date(ms);
        return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const allLessons = useMemo(() => {
        return scheduleData?.data || [];
    }, [scheduleData?.data]);

    const weekdayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allLessons.forEach((lesson: any) => {
            const d = String(lesson?.weekDays ?? lesson?.weekday ?? lesson?.day ?? '');
            if (!d) return;
            counts[d] = (counts[d] || 0) + 1;
        });
        return counts;
    }, [allLessons]);

    const filteredLessons = useMemo(() => {
        const name = lessonName.trim().toLowerCase();
        const min = minPrice.trim() ? Number(minPrice) : undefined;
        const max = maxPrice.trim() ? Number(maxPrice) : undefined;

        return allLessons
            .filter((lesson: any) => {
                const d = String(lesson?.weekDays ?? lesson?.weekday ?? lesson?.day ?? '');
                return !dayFilter || d === dayFilter;
            })
            .filter((lesson: any) => {
                if (!name) return true;
                return String(lesson?.lessonName ?? '').toLowerCase().includes(name);
            })
            .filter((lesson: any) => {
                const p = Number(lesson?.price ?? lesson?.lessonPrice ?? 0);
                if (min != null && Number.isFinite(min) && p < min) return false;
                if (max != null && Number.isFinite(max) && p > max) return false;
                return true;
            });
    }, [allLessons, dayFilter, lessonName, minPrice, maxPrice]);

    const toMs = (value: unknown): number | null => {
        if (value == null) return null;
        const n = Number(value);
        if (Number.isFinite(n)) return n < 1_000_000_000_000 ? n * 1000 : n;
        const d = new Date(String(value));
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    };

    const handleBook = (lesson: any) => {
        const startMs = toMs(lesson?.startTime);
        const finishMs = toMs(lesson?.finishTime ?? lesson?.endTime);

        if (!startMs || !finishMs) {
            message.error('Lesson time information is missing');
            return;
        }

        if (finishMs <= startMs) {
            message.error('Lesson time range is invalid');
            return;
        }

        const qp = new URLSearchParams();
        qp.set('studentId', String(studentId));
        qp.set('lessonId', String(lesson.id));
        qp.set('lessonName', String(lesson.lessonName ?? 'Lesson'));
        qp.set('teacherId', String(lesson.teacherId ?? ''));
        qp.set('startTime', String(startMs));
        qp.set('endTime', String(finishMs));

        navigate(`/telegram/student-book-confirm?${qp.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={20} className="text-blue-600" />
                        <h1 className="text-lg font-bold text-gray-900">Available Lessons</h1>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-2">
                        <input
                            type="text"
                            value={lessonName}
                            onChange={(e) => {
                                setLessonName(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Lesson name"
                            className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-200 text-sm shadow-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => {
                                    setMinPrice(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Min price"
                                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-200 text-sm shadow-sm"
                            />
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => {
                                    setMaxPrice(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Max price"
                                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-200 text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Teacher Filter */}
                    <div className="mb-4">
                        <Select
                            placeholder="Filter by Teacher"
                            allowClear
                            value={teacherId}
                            onChange={(value) => {
                                setTeacherId(value || undefined);
                                setPage(1);
                            }}
                            className="w-full"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={teachers.map((t: any) => ({
                                value: t.id,
                                label: `${t.fullname || 'Unknown'} (ID: ${t.id})`,
                            }))}
                        />
                    </div>

                    {/* Day Filters */}
                    <div className="grid grid-cols-4 gap-2">
                        {rollingWeek.map(({ day, dateStr }) => {
                            const isActive = dayFilter === day;
                            const count = weekdayCounts[day] || 0;
                            const disabled = count === 0;

                            return (
                                <button
                                    key={day}
                                    onClick={() => {
                                        if (disabled) return;
                                        setSelectedLesson(null);
                                        setDayFilter(day);
                                        setPage(1);
                                    }}
                                    disabled={disabled}
                                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5
                                        ${isActive
                                            ? 'bg-green-600 text-white shadow-md'
                                            : disabled
                                                ? 'bg-gray-100 text-gray-400 border border-gray-200 opacity-60'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{day.slice(0, 3)}</span>
                                    <span className={`text-[10px] font-normal ${isActive ? 'text-green-100' : 'text-gray-400'}`}>{dateStr}</span>
                                    {count > 0 && !isActive && (
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] leading-none">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    {isPending && (
                        <div className="flex justify-center py-8">
                            <PageLoader />
                        </div>
                    )}

                    {filteredLessons.slice((page - 1) * initialLimit, page * initialLimit).map((lesson: any) => {
                        const startMs = toMs(lesson.startTime);
                        const finishMs = toMs(lesson.finishTime ?? lesson.endTime);
                        const isBooked = String(lesson.status || '').toLowerCase() === 'booked';
                        const lessonPrice = Number(lesson.price ?? lesson.lessonPrice ?? 0);

                        return (
                            <Card
                                key={lesson.id}
                                className={`rounded-2xl shadow-sm border-gray-200 overflow-hidden ${selectedLesson?.id === lesson.id ? 'ring-2 ring-green-500' : ''}`}
                                bodyStyle={{ padding: '16px' }}
                                onClick={() => setSelectedLesson(lesson)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base">{lesson.lessonName || 'Lesson'}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Clock size={12} />
                                            <span>{formatTime(startMs)} - {formatTime(finishMs)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {(lesson.weekDays || lesson.weekday || lesson.day) ? String(lesson.weekDays || lesson.weekday || lesson.day) : ''}
                                        </div>
                                    </div>
                                    <Tag color={isBooked ? 'red' : 'green'}>{lesson.status || (isBooked ? 'Booked' : 'Available')}</Tag>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                                        <DollarSign size={16} />
                                        <span>{lessonPrice.toLocaleString()} UZS</span>
                                    </div>

                                    <Button
                                        type="primary"
                                        shape="round"
                                        size="small"
                                        disabled={isBooked || isBooking}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBook(lesson);
                                        }}
                                        className={isBooked ? '' : 'bg-green-600'}
                                    >
                                        {isBooked ? 'Booked' : 'Book Now'}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}

                    {!isPending && filteredLessons.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No lessons found for this filter.
                        </div>
                    )}
                </div>

                {Math.ceil(filteredLessons.length / initialLimit) > 1 && (
                    <div className="flex justify-center pb-6 gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">
                            Page {page} of {Math.max(1, Math.ceil(filteredLessons.length / initialLimit))}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(Math.ceil(filteredLessons.length / initialLimit), page + 1))}
                            disabled={page >= Math.ceil(filteredLessons.length / initialLimit)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {selectedLesson && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-gray-900">{selectedLesson.lessonName || 'Lesson'}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {formatTime(toMs(selectedLesson.startTime))} - {formatTime(toMs(selectedLesson.finishTime ?? selectedLesson.endTime))}
                                </div>
                            </div>
                            <Button
                                type="primary"
                                shape="round"
                                disabled={isBooking}
                                onClick={() => handleBook(selectedLesson)}
                                className="bg-green-600"
                            >
                                Book
                            </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Teacher ID: {selectedLesson.teacherId ?? '-'}
                        </div>
                    </div>
                )}
            </div>

            <TelegramStudentBottomNav studentId={studentId} />
        </div>
    );
};
