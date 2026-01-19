import React, { useMemo, useState } from 'react';
import { Card, Tag, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Trash2 } from 'lucide-react';
import { type TeacherLessonTemplate } from '../service/useTeacherLessons';
import { PageLoader } from '../../../../components/page-loader';
import { request } from '../../../../config/request';
import { ConfirmModal } from '../../../../components/confirm-modal';
import { useScheduleLesson } from '../service/useScheduleLesson';

export const TeacherSchedulePage: React.FC = () => {
    const [dayFilter, setDayFilter] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const limit = 10;

    const rollingWeek = useMemo(() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const currentDayIndex = today.getDay();

        return Array.from({ length: 7 }).map((_, i) => {
            const dayIndex = (currentDayIndex + i) % 7;
            const dayName = days[dayIndex];
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);

            return {
                dayName,
                dateStr: targetDate.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })
            };
        });
    }, []);

    const statsQuery = useScheduleLesson({ page: 1, limit: 1000 });

    const lessonsQuery = useScheduleLesson({
        page,
        limit,
        day: dayFilter || undefined,
        active: true,
        teacherId: undefined
    });

    const qc = useQueryClient();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number>(0);

    const deleteScheduleMutation = useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            const res = await request.delete(`/schedule/delete/${id}`);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Schedule deleted');
            qc.invalidateQueries({ queryKey: ['teacher-lessons'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete schedule';
            message.error(errorMessage);
        },
    });

    const toMs = (value: unknown): number | null => {
        if (value == null) return null;
        const n = Number(value);
        if (Number.isFinite(n)) return n < 1_000_000_000_000 ? n * 1000 : n;
        const d = new Date(String(value));
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    };

    const formatTime = (ms: number | null): string => {
        if (!ms) return '-';
        const d = new Date(ms);
        return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDayHeader = (ms: number): string => {
        const d = new Date(ms);
        const weekday = d.toLocaleDateString('uz-UZ', { weekday: 'long' });
        const date = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: '2-digit' });
        return `${weekday} • ${date}`;
    };


    const dayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        if (statsQuery.data?.data) {
            statsQuery.data.data.forEach((item: any) => {
                const day = item.weekDays || item.weekday;
                if (day) counts[day] = (counts[day] || 0) + 1;
            });
        }
        return counts;
    }, [statsQuery.data]);

    React.useEffect(() => {
        if (dayFilter) return;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if ((dayCounts[today] || 0) > 0) {
            setDayFilter(today);
            setPage(1);
        }
    }, [dayCounts, dayFilter]);

    const grouped = useMemo(() => {
        const list = (lessonsQuery.data?.data || []) as TeacherLessonTemplate[];

        const dayKey = (ms: number) => {
            const d = new Date(ms);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        };

        const normalized = list
            .map((l) => {
                const startMs = toMs((l as any)?.startTime);
                const finishMs = toMs((l as any)?.finishTime ?? (l as any)?.endTime);
                return { lesson: l, startMs, finishMs };
            })
            .filter((x) => x.startMs != null)
            .sort((a, b) => (a.startMs ?? 0) - (b.startMs ?? 0));

        const map = new Map<number, Array<{ lesson: TeacherLessonTemplate; startMs: number; finishMs: number | null }>>();
        for (const item of normalized) {
            const k = dayKey(item.startMs as number);
            const prev = map.get(k) ?? [];
            prev.push({ lesson: item.lesson, startMs: item.startMs as number, finishMs: item.finishMs });
            map.set(k, prev);
        }

        const keys = Array.from(map.keys()).sort((a, b) => a - b);
        return keys.map((k) => ({
            dayMs: k,
            lessons: (map.get(k) ?? []).sort((a, b) => a.startMs - b.startMs),
        }));
    }, [lessonsQuery.data?.data]);

    if (lessonsQuery.isPending && !lessonsQuery.data) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    const activeDayCount = Object.values(dayCounts).reduce((a, b) => a + (Number(b) || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-screen-2xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={18} className="text-emerald-700" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Schedule</h1>
                        </div>
                        <div className="text-xs text-gray-600">
                            Total lessons: <span className="font-semibold text-gray-900">{activeDayCount}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {rollingWeek.map((dayData) => {
                            const day = dayData.dayName;
                            const count = dayCounts[day] || 0;
                            const dateStr = dayData.dateStr;
                            const isActiveDay = count > 0;

                            return (
                                <button
                                    key={day}
                                    onClick={() => {
                                        if (isActiveDay) {
                                            setDayFilter(day === dayFilter ? '' : day);
                                            setPage(1);
                                        }
                                    }}
                                    disabled={!isActiveDay}
                                    className={`py-3 px-2 rounded-2xl text-sm font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-1
                                        ${dayFilter === day
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                            : isActiveDay
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                                : 'bg-white text-gray-400 border border-gray-200 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="tracking-wide">{day.slice(0, 3)}</span>
                                    <span className="text-[11px] font-semibold opacity-80">{dateStr}</span>
                                    {isActiveDay && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs leading-none ${dayFilter === day ? 'bg-white/20' : 'bg-gray-900 text-white'}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {grouped.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
                        No schedules
                    </div>
                ) : (
                    grouped.map((g) => (
                        <Card
                            key={g.dayMs}
                            className="rounded-2xl"
                            title={<span className="font-bold">{formatDayHeader(g.dayMs)}</span>}
                        >
                            <div className="grid grid-cols-12 gap-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-bold text-gray-700">
                                <div className="col-span-5">Lesson</div>
                                <div className="col-span-3">Time</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1">Paid</div>
                                <div className="col-span-1 text-right">Actions</div>
                            </div>
                            <div className="space-y-3">
                                {g.lessons.map((x) => {
                                    const st = String((x.lesson as any)?.status ?? '').toLowerCase();
                                    const statusColor = st === 'booked' ? 'green' : st === 'available' ? 'blue' : st ? 'gold' : 'default';
                                    const isPaid = Boolean((x.lesson as any)?.isPaid);
                                    const id = Number((x.lesson as any)?.id);
                                    const createdAt = (x.lesson as any)?.createdAt;
                                    return (
                                        <div
                                            key={(x.lesson as any)?.id ?? `${g.dayMs}-${x.startMs}`}
                                            className="p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-5 min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 truncate">
                                                        {String((x.lesson as any)?.lessonName ?? '-')}
                                                    </div>
                                                    {!!(x.lesson as any)?.meetLink && (
                                                        <div className="mt-1 text-[11px] text-gray-500 truncate">
                                                            {String((x.lesson as any)?.meetLink)}
                                                        </div>
                                                    )}
                                                    {!!createdAt && (
                                                        <div className="mt-1 text-[11px] text-gray-400 truncate">
                                                            {String(createdAt)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-3 text-xs font-semibold text-gray-700">
                                                    {formatTime(x.startMs)} - {formatTime(x.finishMs)}
                                                </div>

                                                <div className="col-span-2">
                                                    <Tag className="m-0" color={statusColor as any}>
                                                        {String((x.lesson as any)?.status ?? '-')}
                                                    </Tag>
                                                </div>

                                                <div className="col-span-1">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-[11px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {isPaid ? 'Yes' : 'No'}
                                                    </span>
                                                </div>

                                                <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        disabled={!Number.isFinite(id) || id <= 0}
                                                        onClick={() => {
                                                            if (!Number.isFinite(id) || id <= 0) return;
                                                            setDeleteId(id);
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                        className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ))
                )}

                {lessonsQuery.data?.meta?.totalPages && lessonsQuery.data.meta.totalPages > 1 && (() => {
                    const totalPages = lessonsQuery.data.meta.totalPages;
                    return (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
                                disabled={page >= (totalPages || 1)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    );
                })()}
            </div>

            <ConfirmModal
                open={deleteConfirmOpen}
                variant="hard_delete"
                title="Delete schedule"
                message="Do you want to permanently delete this schedule?"
                note="This action cannot be undone."
                loading={deleteScheduleMutation.isPending}
                onCancel={() => {
                    if (deleteScheduleMutation.isPending) return;
                    setDeleteConfirmOpen(false);
                    setDeleteId(0);
                }}
                onConfirm={async () => {
                    if (deleteScheduleMutation.isPending) return;
                    const id = Number(deleteId);
                    if (!Number.isFinite(id) || id <= 0) {
                        setDeleteConfirmOpen(false);
                        return;
                    }
                    try {
                        await deleteScheduleMutation.mutateAsync({ id });
                        setDeleteConfirmOpen(false);
                        setDeleteId(0);
                    } catch {
                        // ignore   
                    }
                }}
            />
        </div>
    );
};
