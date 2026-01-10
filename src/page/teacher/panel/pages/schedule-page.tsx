import React, { useMemo, useState } from 'react';
import { Card, Tag, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Trash2 } from 'lucide-react';
import { useTeacherLessons, type TeacherLessonTemplate } from '../service/useTeacherLessons';
import { PageLoader } from '../../../../components/page-loader';
import { request } from '../../../../config/request';
import { ConfirmModal } from '../../../../components/confirm-modal';
import { useScheduleLesson } from '../service/useScheduleLesson';

export const TeacherSchedulePage: React.FC = () => {
    const [dayFilter, setDayFilter] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const limit = 10;

    const rollingWeek = useMemo(() => {
        const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayIdx = new Date().getDay();
        return Array.from({ length: 7 }).map((_, i) => {
            const idx = (todayIdx + i) % 7;
            return order[idx] || '';
        });
    }, []);

    // Fetch stats to calculate counts
    const statsQuery = useScheduleLesson({ page: 1, limit: 1000 });

    // Fetch filtered data
    const lessonsQuery = useTeacherLessons({
        page,
        limit,
        day: dayFilter || undefined,
        active: true
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
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDayHeader = (ms: number): string => {
        const d = new Date(ms);
        const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
        const date = d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' });
        return `${weekday} • ${date}`;
    };

    const getCurrentWeekDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const currentDayIndex = now.getDay(); // 0-6
        const targetDayIndex = days.indexOf(dayName);

        if (targetDayIndex === -1) return '';

        const diff = targetDayIndex - currentDayIndex;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + diff);

        return targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    };

    const dayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        if (statsQuery.data?.data) {
            statsQuery.data.data.forEach((item: any) => {
                const d = item.weekDays || item.day || item.weekday;
                if (d) counts[d] = (counts[d] || 0) + 1;
            });
        }
        return counts;
    }, [statsQuery.data]);

    React.useEffect(() => {
        if (dayFilter) return;
        const today = rollingWeek[0];
        if (!today) return;
        if ((dayCounts[today] || 0) > 0) {
            setDayFilter(today);
            setPage(1);
        }
    }, [dayCounts, dayFilter, rollingWeek]);

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

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={18} className="text-emerald-700" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Schedule</h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {rollingWeek.map((day) => {
                            const count = dayCounts[day] || 0;
                            const dateStr = getCurrentWeekDate(day);
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
                                    className={`py-3 px-2 rounded-xl text-sm font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-1
                                        ${dayFilter === day
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-300 transform scale-105'
                                            : isActiveDay
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                                : 'bg-white text-gray-400 border border-gray-200 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <span>{day.slice(0, 3)}</span>
                                    <span className="text-xs font-normal opacity-80">{dateStr}</span>
                                    {isActiveDay && (
                                        <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs leading-none">
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
                            <div className="space-y-3">
                                {g.lessons.map((x) => {
                                    const st = String((x.lesson as any)?.status ?? '').toLowerCase();
                                    const statusColor = st === 'booked' ? 'green' : st === 'available' ? 'blue' : st ? 'gold' : 'default';
                                    const isPaid = Boolean((x.lesson as any)?.isPaid);
                                    const id = Number((x.lesson as any)?.id);
                                    return (
                                        <div
                                            key={(x.lesson as any)?.id ?? `${g.dayMs}-${x.startMs}`}
                                            className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 truncate">
                                                        {String((x.lesson as any)?.lessonName ?? '-')}
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-600">
                                                        {formatTime(x.startMs)} - {formatTime(x.finishMs)}
                                                    </div>
                                                    {!!(x.lesson as any)?.meetLink && (
                                                        <div className="mt-1 text-[11px] text-gray-500 truncate">
                                                            {String((x.lesson as any)?.meetLink)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Tag className="m-0" color={statusColor as any}>
                                                        {String((x.lesson as any)?.status ?? '-')}
                                                    </Tag>
                                                    <Tag className="m-0" color={isPaid ? 'green' : 'red'}>
                                                        {isPaid ? 'Paid' : 'Unpaid'}
                                                    </Tag>
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
                        // handled in mutation
                    }
                }}
            />
        </div>
    );
};
