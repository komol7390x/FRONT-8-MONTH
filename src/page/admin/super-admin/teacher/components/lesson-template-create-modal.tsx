import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, DollarSign, X } from 'lucide-react';
import { message } from 'antd';

import { useCreateLessonTemplate } from '../service/useCreateLessonTemplate';
import { useGetTeacherById } from '../service/useGetTeacherById';
import { useGetStudentById } from '../../student/service/useGetStudentById';
import { useTeacherSchedule } from '../service/useTeacherSchedule';

interface LessonTemplateCreateModalProps {
    open: boolean;
    teacherId: number;
    studentId?: number;
    existingLessons?: any[];
    certificates?: any[];
    showTeacherIdInput?: boolean;
    onTeacherIdChange?: (id: number) => void;
    showStudentIdInput?: boolean;
    onStudentIdChange?: (id: number) => void;
    onClose: () => void;
    onCreated: () => void;
}

export const LessonTemplateCreateModal: React.FC<LessonTemplateCreateModalProps> = ({ open, teacherId, studentId, existingLessons = [], certificates = [], showTeacherIdInput = false, onTeacherIdChange, showStudentIdInput = false, onStudentIdChange, onClose, onCreated }) => {
    const { mutateAsync: createLesson } = useCreateLessonTemplate() as any;

    const {
        data: teacherById,
        isFetching: isTeacherFetching,
        isError: isTeacherError,
    } = useGetTeacherById(showTeacherIdInput ? teacherId : undefined) as any;

    const {
        data: studentById,
        isFetching: isStudentFetching,
        isError: isStudentError,
    } = useGetStudentById(showStudentIdInput ? studentId : undefined) as any;

    const [selectedOffsets, setSelectedOffsets] = useState<number[]>([0]);
    const [form, setForm] = useState({
        startTime: '',
        finishTime: '',
        lessonName: '',
        lessonPrice: 0,
        lessonId: null,
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const scheduleStatsQuery = useTeacherSchedule({
        teacherId: teacherId || undefined,
        active: true,
        search: form.lessonName || undefined,
        page: 1,
        limit: 1000,
        id: form.lessonId,
    } as any);

    const lessonNameOptions = useMemo(() => {
        const names = (certificates || [])
            .map((c: any) => String(c?.specificationName || '').trim())
            .filter(Boolean);
        return Array.from(new Set(names));
    }, [certificates]);

    const getHourPriceByName = (name: string) => {
        const found = (certificates || []).find((c: any) => String(c?.specificationName || '').trim() === name);
        const price = Number(found?.hourPrice);
        return Number.isFinite(price) ? price : 0;
    };

    // Lesson ID ni topish uchun yordamchi funksiya
    const getLessonIdByName = (name: string) => {
        const found = (certificates || []).find((c: any) => String(c?.specificationName || '').trim() === name);
        return found?.id || found?.lessonId;
    };

    const toMs = (value: unknown): number | null => {
        if (value == null) return null;
        const n = Number(value);
        if (Number.isFinite(n)) return n < 1_000_000_000_000 ? n * 1000 : n;
        const d = new Date(String(value));
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    };

    const keyOfDay = (d: Date): number => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x.getTime();
    };

    const dateSlots = useMemo(() => {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const base = new Date();
        base.setHours(0, 0, 0, 0);
        base.setDate(base.getDate() + 1);

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(base);
            d.setDate(d.getDate() + i);
            const dd = String(d.getDate()).padStart(2, '0');
            const label = days[d.getDay()];
            const dateLabel = `${dd}-${months[d.getMonth()]}`;
            return { offset: i, date: d, label, dateLabel };
        });
    }, []);

    const lessonsSource = useMemo(() => {
        const apiRows = (scheduleStatsQuery.data as any)?.data;
        if (Array.isArray(apiRows)) return apiRows;
        return existingLessons || [];
    }, [existingLessons, scheduleStatsQuery.data]);

    const lessonCountByDayKey = useMemo(() => {
        const map = new Map<number, number>();
        for (const row of lessonsSource || []) {
            const st = toMs((row as any)?.startTime ?? (row as any)?.start ?? (row as any)?.date);
            if (!st) continue;
            const k = keyOfDay(new Date(st));
            map.set(k, (map.get(k) ?? 0) + 1);
        }
        return map;
    }, [lessonsSource]);

    const disabledOffsets = useMemo(() => {
        const disabled = new Set<number>();
        for (const slot of dateSlots) {
            const count = lessonCountByDayKey.get(keyOfDay(slot.date)) ?? 0;
            if (count <= 0) disabled.add(slot.offset);
        }
        return disabled;
    }, [dateSlots, lessonCountByDayKey]);

    useEffect(() => {
        if (!open) return;

        const firstAvailable = dateSlots.find((s) => (lessonCountByDayKey.get(keyOfDay(s.date)) ?? 0) > 0)?.offset;
        const initial = firstAvailable ?? 0;
        const defaults = [initial].filter((x) => !disabledOffsets.has(x));
        setSelectedOffsets(defaults.length ? defaults : []);
        setForm({
            startTime: '',
            finishTime: '',
            lessonName: lessonNameOptions[0] || '',
            lessonPrice: lessonNameOptions[0] ? getHourPriceByName(lessonNameOptions[0]) : 0,
            lessonId: lessonNameOptions[0] ? getLessonIdByName(lessonNameOptions[0]) : null,
        });
        setIsSubmitting(false);
    }, [dateSlots, disabledOffsets, lessonCountByDayKey, lessonNameOptions, open]);

    useEffect(() => {
        if (!open) return;
        if (!form.lessonName.trim()) return;
        setForm((p) => ({ ...p, lessonPrice: getHourPriceByName(p.lessonName) }));
    }, [open, form.lessonName]);

    const hasLessonName = useMemo(() => {
        return !!form.lessonName.trim();
    }, [form.lessonName]);

    const isTeacherValid = useMemo(() => {
        if (!showTeacherIdInput) return true;
        if (!(typeof teacherId === 'number' && teacherId > 0)) return false;
        if (isTeacherFetching) return false;
        if (isTeacherError) return false;
        return !!teacherById;
    }, [isTeacherError, isTeacherFetching, showTeacherIdInput, teacherById, teacherId]);

    const isStudentValid = useMemo(() => {
        if (!showStudentIdInput) return true;
        if (!studentId) return true;
        if (!(typeof studentId === 'number' && studentId > 0)) return false;
        if (isStudentFetching) return false;
        if (isStudentError) return false;
        return !!studentById;
    }, [isStudentError, isStudentFetching, showStudentIdInput, studentById, studentId]);

    const canEnterStudentId = useMemo(() => {
        if (!showTeacherIdInput) return true;
        return isTeacherValid;
    }, [isTeacherValid, showTeacherIdInput]);

    const canSelectLessonName = useMemo(() => {
        if (!showStudentIdInput) return canEnterStudentId;
        return canEnterStudentId && isStudentValid;
    }, [canEnterStudentId, isStudentValid, showStudentIdInput]);

    const canSelectDay = useMemo(() => {
        return canSelectLessonName && hasLessonName;
    }, [canSelectLessonName, hasLessonName]);

    const handleToggleOffset = (offset: number) => {
        if (disabledOffsets.has(offset)) return;
        setSelectedOffsets((prev) => (prev.includes(offset) ? [] : [offset]));
    };

    const selectedDate = useMemo(() => {
        const offset = selectedOffsets[0];
        const slot = dateSlots.find((s) => s.offset === offset);
        return slot?.date ?? null;
    }, [dateSlots, selectedOffsets]);

    const selectedDateLabel = useMemo(() => {
        if (!selectedDate) return '';
        const months = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK'];
        const days = ['S', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const label = days[selectedDate.getDay()] || '';
        const dateLabel = `${dd}-${months[selectedDate.getMonth()]}`;
        return `${label} ${dateLabel}`.trim();
    }, [selectedDate]);

    const selectedDayCount = useMemo(() => {
        if (!selectedDate) return 0;
        return lessonCountByDayKey.get(keyOfDay(selectedDate)) ?? 0;
    }, [lessonCountByDayKey, selectedDate]);

    const canEnterTime = useMemo(() => {
        return canSelectDay && selectedOffsets.length > 0 && selectedDayCount > 0;
    }, [canSelectDay, selectedDayCount, selectedOffsets.length]);

    const canSubmit = useMemo(() => {
        return isTeacherValid && isStudentValid && !!teacherId && hasLessonName && !!form.startTime && !!form.finishTime && selectedOffsets.length > 0 && selectedDayCount > 0;
    }, [form.finishTime, form.startTime, hasLessonName, isStudentValid, isTeacherValid, selectedDayCount, selectedOffsets.length, teacherId]);

    const lessonsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const key = selectedDate.toDateString();
        const rows = (lessonsSource || [])
            .filter((l: any) => {
                const ms = toMs(l?.startTime ?? l?.start ?? l?.date);
                if (!ms) return false;
                return new Date(ms).toDateString() === key;
            })
            .slice();

        rows.sort((a: any, b: any) => (toMs(a?.startTime) ?? 0) - (toMs(b?.startTime) ?? 0));
        return rows;
    }, [lessonsSource, selectedDate]);

    const handleCreateWeek = async () => {
        if (!teacherId || !isTeacherValid) {
            message.error('Teacher ID not found');
            return;
        }
        if (!hasLessonName) {
            message.warning('Select lesson name');
            return;
        }
        if (!isStudentValid) {
            message.error('Student ID not found');
            return;
        }
        if (!form.startTime || !form.finishTime) {
            message.warning('startTime and finishTime are required');
            return;
        }
        if (selectedOffsets.length === 0) {
            message.warning('Select days');
            return;
        }

        const currentLessonId = getLessonIdByName(form.lessonName);

        const parseTime = (t: string) => {
            const [h, m] = t.split(':').map((x) => Number(x));
            return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
        };
        const startHM = parseTime(form.startTime);
        const finishHM = parseTime(form.finishTime);

        const tasks: Array<{ startMs: number; finishMs: number }> = [];

        const sortedOffsets = [...selectedOffsets].sort((a, b) => a - b);
        for (const offset of sortedOffsets) {
            const slot = dateSlots.find((s) => s.offset === offset);
            if (!slot) continue;
            if (disabledOffsets.has(offset)) continue;

            const start = new Date(slot.date);
            start.setHours(startHM.h, startHM.m, 0, 0);

            const finish = new Date(slot.date);
            finish.setHours(finishHM.h, finishHM.m, 0, 0);
            if (finish.getTime() <= start.getTime()) {
                finish.setDate(finish.getDate() + 1);
            }

            tasks.push({ startMs: Math.floor(start.getTime() / 1000), finishMs: Math.floor(finish.getTime() / 1000) });
        }

        if (tasks.length === 0) {
            message.warning('No lessons to create for selected weekdays');
            return;
        }

        setIsSubmitting(true);
        try {
            for (const t of tasks) {
                await createLesson({
                    teacherId,
                    studentId,
                    lessonId: currentLessonId,
                    startTime: t.startMs,
                    finishTime: t.finishMs,
                });
            }
            onClose();
            onCreated();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={18} className="text-emerald-700" />
                        <h2 className="text-xl font-bold text-gray-900">Create Weekly Lessons</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="space-y-4">
                    {showTeacherIdInput && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID</label>
                            <input
                                type="number"
                                value={teacherId || ''}
                                onChange={(e) => {
                                    const n = Number(e.target.value);
                                    onTeacherIdChange?.(Number.isFinite(n) && n > 0 ? n : 0);
                                }}
                                className="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                placeholder="Enter teacher id"
                                min={1}
                            />
                            {teacherId > 0 && (
                                <div className={`mt-1 text-xs ${isTeacherValid ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {isTeacherFetching ? 'Checking teacher...' : isTeacherValid ? 'Teacher found' : 'Teacher not found'}
                                </div>
                            )}
                        </div>
                    )}

                    {showStudentIdInput && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                            <input
                                type="number"
                                value={studentId || ''}
                                onChange={(e) => {
                                    const n = Number(e.target.value);
                                    onStudentIdChange?.(Number.isFinite(n) && n > 0 ? n : 0);
                                }}
                                disabled={!canEnterStudentId}
                                className="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm disabled:opacity-60"
                                placeholder="Enter student id"
                                min={1}
                            />
                            {!!studentId && studentId > 0 && (
                                <div className={`mt-1 text-xs ${isStudentValid ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {isStudentFetching ? 'Checking student...' : isStudentValid ? 'Student found' : 'Student not found'}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={canSelectLessonName ? '' : 'opacity-50 pointer-events-none'}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Name</label>
                        <div className="relative">
                            <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" />
                            <select
                                value={form.lessonId ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setForm((p) => ({
                                        ...p,
                                        lessonName: value,
                                        lessonPrice: getHourPriceByName(value),
                                        lessonId: getLessonIdByName(value),
                                    }));
                                }}
                                className="w-full h-11 pl-10 pr-10 bg-linear-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            >
                                {lessonNameOptions.length === 0 ? (
                                    <option value="">No certificates</option>
                                ) : (
                                    lessonNameOptions.map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 gap-3 ${canEnterTime ? '' : 'opacity-50 pointer-events-none'}`}>
                        {selectedDateLabel && (
                            <div className="text-xs font-semibold text-gray-700">
                                Selected day: <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{selectedDateLabel}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={form.startTime}
                                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                                className="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Finish Time</label>
                            <input
                                type="time"
                                value={form.finishTime}
                                onChange={(e) => setForm((p) => ({ ...p, finishTime: e.target.value }))}
                                className="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                            />
                        </div>
                    </div>

                    <div className={canSelectDay ? '' : 'opacity-50 pointer-events-none'}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                        <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-2">
                                {dateSlots.slice(0, 4).map((d) => {
                                    const active = selectedOffsets.includes(d.offset);
                                    const disabled = disabledOffsets.has(d.offset);
                                    const count = lessonCountByDayKey.get(keyOfDay(d.date)) ?? 0;
                                    const isDayDisabled = disabled || count === 0;
                                    return (
                                        <button
                                            key={d.offset}
                                            type="button"
                                            disabled={isDayDisabled}
                                            onClick={() => handleToggleOffset(d.offset)}
                                            className={`relative h-12 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center leading-tight ${isDayDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {active && !disabled && (
                                                <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-emerald-700 bg-white rounded-full" />
                                            )}
                                            {count > 0 && (
                                                <span className={`absolute -top-2 -left-2 min-w-6 h-6 px-1 rounded-full text-[11px] font-bold flex items-center justify-center border ${active
                                                    ? 'bg-white text-emerald-700 border-emerald-200'
                                                    : 'bg-gray-900 text-white border-gray-700'
                                                    }`}>
                                                    {count}
                                                </span>
                                            )}
                                            <span>{d.label}</span>
                                            <span className={isDayDisabled ? 'text-gray-400' : active ? 'text-white/90' : 'text-gray-500'}>{d.dateLabel}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {dateSlots.slice(4, 7).map((d) => {
                                    const active = selectedOffsets.includes(d.offset);
                                    const disabled = disabledOffsets.has(d.offset);
                                    const count = lessonCountByDayKey.get(keyOfDay(d.date)) ?? 0;
                                    const isDayDisabled = disabled || count === 0;
                                    return (
                                        <button
                                            key={d.offset}
                                            type="button"
                                            disabled={isDayDisabled}
                                            onClick={() => handleToggleOffset(d.offset)}
                                            className={`relative h-12 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center leading-tight ${isDayDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {active && !disabled && (
                                                <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-emerald-700 bg-white rounded-full" />
                                            )}
                                            {count > 0 && (
                                                <span className={`absolute -top-2 -left-2 min-w-6 h-6 px-1 rounded-full text-[11px] font-bold flex items-center justify-center border ${active
                                                    ? 'bg-white text-emerald-700 border-emerald-200'
                                                    : 'bg-gray-900 text-white border-gray-700'
                                                    }`}>
                                                    {count}
                                                </span>
                                            )}
                                            <span>{d.label}</span>
                                            <span className={isDayDisabled ? 'text-gray-400' : active ? 'text-white/90' : 'text-gray-500'}>{d.dateLabel}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-700">Lessons for selected day</div>
                            <div className="mt-2 space-y-2">
                                {lessonsForSelectedDate.length === 0 ? (
                                    <div className="text-xs text-gray-500">No lessons for this day.</div>
                                ) : (
                                    lessonsForSelectedDate.map((l: any, idx: number) => {
                                        const st = toMs(l?.startTime);
                                        const ft = toMs(l?.finishTime ?? l?.endTime);
                                        const stStr = st ? new Date(st).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';
                                        const ftStr = ft ? new Date(ft).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';
                                        const price = Number(l?.price ?? l?.lessonPrice ?? 0);

                                        // Tanlangan dars nomi bilan mos kelsa, yashil fon berish
                                        const isCurrentLesson = String(l?.lessonName || '').trim() === form.lessonName.trim();

                                        return (
                                            <div key={String(l?.id ?? idx)} className={`px-3 py-2 rounded-xl border border-gray-200 transition-colors ${isCurrentLesson ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-xs font-semibold text-gray-900 truncate">{String(l?.lessonName ?? 'Lesson')}</div>
                                                    <div className="text-[11px] font-semibold text-gray-600 shrink-0">{stStr} - {ftStr}</div>
                                                </div>
                                                <div className="mt-1 text-[11px] font-semibold text-amber-700">{Number.isFinite(price) ? `${price.toLocaleString()} UZS` : '-'}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={canSelectDay ? '' : 'opacity-50 pointer-events-none'}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Price</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700" />
                            <input
                                type="number"
                                value={form.lessonPrice}
                                readOnly
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                        </div>
                    </div>

                    <div className={`flex gap-2 ${canSelectDay ? '' : 'opacity-50 pointer-events-none'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateWeek}
                            disabled={!canSubmit || isSubmitting}
                            className="flex-1 h-11 px-4 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:bg-emerald-300"
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};