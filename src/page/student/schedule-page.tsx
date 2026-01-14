import React, { useState, useEffect, useMemo } from 'react';
import { Button, Select, message } from 'antd';
import { CalendarDays } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentSchedule } from './service/useStudentSchedule';
import { PageLoader } from '../../components/page-loader';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentSchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial params from URL
    const initialDay = searchParams.get('day') || '';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialLimit = Number(searchParams.get('limit')) || 10;
    const initialSelectedNamesRaw = searchParams.get('lessonNames') || '';

    const [dayFilter, setDayFilter] = useState<string>(initialDay);
    const [page, setPage] = useState<number>(initialPage);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [selectedLessonNames, setSelectedLessonNames] = useState<string[]>(
        initialSelectedNamesRaw
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
    );

    const [studentIdResolved, setStudentIdResolved] = useState<number>(0);

    useEffect(() => {
        const handler = (e: any) => {
            const id = Number(e?.detail?.studentId);
            if (Number.isFinite(id) && id > 0) {
                setStudentIdResolved(id);
            }
        };
        window.addEventListener('telegram-student-id-updated', handler as any);
        return () => window.removeEventListener('telegram-student-id-updated', handler as any);
    }, []);

    const studentIdFromQuery = useMemo(() => {
        const id = Number(searchParams.get('userId') || searchParams.get('studentId'));
        return Number.isFinite(id) && id > 0 ? id : 0;
    }, [searchParams]);

    const studentIdFromStorage = useMemo(() => {
        try {
            const v = localStorage.getItem('telegram_student_id');
            const n = Number(v);
            return Number.isFinite(n) && n > 0 ? n : 0;
        } catch {
            return 0;
        }
    }, [searchParams]);

    const studentId = studentIdFromQuery || studentIdResolved || studentIdFromStorage;

    const isBooking = false;

    const statsQuery = useStudentSchedule({
        active: true,
        page: 1,
        limit: 1000,
    });

    const { data: scheduleData, isPending } = useStudentSchedule({
        active: true,
        day: dayFilter || undefined,
        page: 1,
        limit: 1000,
    });

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (params.has('token')) {
            params.delete('token');
            setSearchParams(params, { replace: true } as any);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (initialDay) return;
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[now.getDay()] || '';
        if (today) {
            setDayFilter(today);
        }
    }, [initialDay]);

    // Update URL when filters change
    useEffect(() => {
        const params: any = {};
        if (dayFilter) params.day = dayFilter;
        if (page > 1) params.page = String(page);
        if (initialLimit !== 10) params.limit = String(initialLimit);
        if (selectedLessonNames.length) params.lessonNames = selectedLessonNames.join(',');
        params.active = 'true';

        setSearchParams(params);
    }, [dayFilter, page, initialLimit, selectedLessonNames, setSearchParams]);

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

    const allLessonsForCounts = useMemo(() => {
        return statsQuery.data?.data || [];
    }, [statsQuery.data?.data]);

    const weekdayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allLessonsForCounts.forEach((lesson: any) => {
            const d = String(lesson?.weekDays ?? lesson?.weekday ?? lesson?.day ?? '');
            if (!d) return;
            counts[d] = (counts[d] || 0) + 1;
        });
        return counts;
    }, [allLessonsForCounts]);

    const toMs = (value: unknown): number | null => {
        if (value == null) return null;
        const n = Number(value);
        if (Number.isFinite(n)) return n < 1_000_000_000_000 ? n * 1000 : n;
        const d = new Date(String(value));
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    };

    const lessonsForSelectedDay = useMemo(() => {
        if (!dayFilter) return [];
        const selected = selectedLessonNames.map((x) => x.toLowerCase());
        const rows = allLessons
            .filter((lesson: any) => {
                const d = String(lesson?.weekDays ?? lesson?.weekday ?? lesson?.day ?? '');
                return d === dayFilter;
            })
            .filter((lesson: any) => {
                if (!selected.length) return true;
                const ln = String(lesson?.lessonName ?? '').toLowerCase();
                return selected.includes(ln);
            })
            .slice();
        rows.sort((a: any, b: any) => {
            const aMs = toMs(a?.startTime) ?? 0;
            const bMs = toMs(b?.startTime) ?? 0;
            return aMs - bMs;
        });
        return rows;
    }, [allLessons, dayFilter, selectedLessonNames]);

    const lessonNameOptions = useMemo(() => {
        const rows = allLessonsForCounts || [];
        const names = rows
            .map((r: any) => String(r?.lessonName ?? '').trim())
            .filter(Boolean);
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    }, [allLessonsForCounts]);

    const handleBook = (lesson: any) => {
        if (!studentId) {
            message.error('Student not found');
            return;
        }
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
                        <CalendarDays size={20} className="text-green-600" />
                        <h1 className="text-lg font-bold text-gray-900">Available Lessons</h1>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Filter Lesson Name</label>
                        <Select
                            mode="multiple"
                            allowClear
                            value={selectedLessonNames}
                            onChange={(v) => {
                                setSelectedLessonNames((v as any[]).map((x) => String(x)));
                                setSelectedLesson(null);
                                setPage(1);
                            }}
                            placeholder="Select lesson name"
                            className="w-full"
                            options={lessonNameOptions.map((n) => ({ value: n, label: n }))}
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

                    {dayFilter && (
                        <div className="mt-4">
                            <div className="text-xs font-bold text-gray-700">{dayFilter} lessons</div>
                            <div className="mt-2 space-y-2">
                                {lessonsForSelectedDay.length === 0 ? (
                                    <div className="text-xs text-gray-500">No lessons for selected day.</div>
                                ) : (
                                    lessonsForSelectedDay.map((l: any) => {
                                        const st = formatTime(toMs(l?.startTime));
                                        const ft = formatTime(toMs(l?.finishTime ?? l?.endTime));
                                        const price = Number(l?.price ?? l?.lessonPrice ?? 0);
                                        return (
                                            <button
                                                key={String(l?.id ?? `${l?.lessonName}-${l?.startTime}`)}
                                                type="button"
                                                onClick={() => setSelectedLesson(l)}
                                                className={`w-full text-left px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 ${selectedLesson?.id === l?.id ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'}`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-xs font-semibold text-gray-900 truncate">{String(l?.lessonName ?? 'Lesson')}</div>
                                                    <div className="text-[11px] font-semibold text-gray-600 shrink-0">{st} - {ft}</div>
                                                </div>
                                                <div className="mt-1 text-[11px] font-semibold text-amber-700">{Number.isFinite(price) ? `${price.toLocaleString()} UZS` : '-'}</div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {isPending && (
                    <div className="flex justify-center py-8">
                        <PageLoader />
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
                                <div className="text-xs font-bold text-amber-700 mt-1">
                                    {Number(selectedLesson.price ?? selectedLesson.lessonPrice ?? 0).toLocaleString()} UZS
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
