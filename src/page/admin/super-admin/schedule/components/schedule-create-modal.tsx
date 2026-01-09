import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, DollarSign, X } from 'lucide-react';
import { message } from 'antd';
import { useCreateSchedule } from '../service/useCreateSchedule';

interface ScheduleCreateModalProps {
    open: boolean;
    teacherId: number;
    existingSchedule?: any[];
    certificates?: any[];
    showTeacherIdInput?: boolean;
    onTeacherIdChange?: (id: number) => void;
    onClose: () => void;
    onCreated: () => void;
}

export const ScheduleCreateModal: React.FC<ScheduleCreateModalProps> = ({
    open,
    teacherId,
    existingSchedule = [],
    certificates = [],
    showTeacherIdInput = false,
    onTeacherIdChange,
    onClose,
    onCreated
}) => {
    const { mutateAsync: createSchedule } = useCreateSchedule();

    const [selectedOffsets, setSelectedOffsets] = useState<number[]>([0]);
    const [form, setForm] = useState({
        startTime: '09:00',
        finishTime: '10:00',
        lessonName: '',
        lessonPrice: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

    const formatHHmmFromMs = (ms: number): string => {
        const d = new Date(ms);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const dateSlots = useMemo(() => {
        const months = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK'];
        const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

        const base = new Date();
        base.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(base);
            // bugungi kundan boshlanadi
            d.setDate(d.getDate() + i);
            const dd = String(d.getDate()).padStart(2, '0');
            const label = days[d.getDay()];
            const dateLabel = `${dd}-${months[d.getMonth()]}`;
            return { offset: i, date: d, label, dateLabel };
        });
    }, []);

    const disabledOffsets = useMemo(() => {
        const disabled = new Set<number>();
        // Note: existingSchedule logic might need refinement based on exact data structure
        // For now, we won't disable days aggressively unless we have precise day-level blocking logic
        return disabled;
    }, [dateSlots, existingSchedule]);

    useEffect(() => {
        if (!open) return;
        const defaults = [0].filter((x) => !disabledOffsets.has(x));
        setSelectedOffsets(defaults);
        setForm(p => ({
            ...p,
            lessonName: lessonNameOptions[0] || '',
            lessonPrice: lessonNameOptions[0] ? getHourPriceByName(lessonNameOptions[0]) : 0,
        }));
        setIsSubmitting(false);
    }, [disabledOffsets, lessonNameOptions, open]);

    useEffect(() => {
        if (!open) return;
        if (!form.lessonName.trim()) return;
        setForm((p) => ({ ...p, lessonPrice: getHourPriceByName(p.lessonName) }));
    }, [open, form.lessonName]);

    const canSubmit = useMemo(() => {
        return !!teacherId && !!form.lessonName.trim() && !!form.startTime && !!form.finishTime && selectedOffsets.length > 0;
    }, [form.finishTime, form.lessonName, form.startTime, selectedOffsets.length, teacherId]);

    const scheduleCountByDayKey = useMemo(() => {
        const selectedName = String(form.lessonName || '').trim();
        const map = new Map<number, number>();
        for (const row of existingSchedule || []) {
            const rowName = String((row as any)?.lessonName ?? '').trim();
            if (selectedName && rowName !== selectedName) continue;
            const st = toMs((row as any)?.startTime);
            if (!st) continue;
            const k = keyOfDay(new Date(st));
            map.set(k, (map.get(k) ?? 0) + 1);
        }
        return map;
    }, [existingSchedule, form.lessonName]);

    const selectedDate = useMemo(() => {
        const offset = selectedOffsets[0];
        const slot = dateSlots.find((s) => s.offset === offset);
        return slot?.date ?? null;
    }, [dateSlots, selectedOffsets]);

    const schedulesForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const k = keyOfDay(selectedDate);
        const rows = (existingSchedule || [])
            .filter((row: any) => {
                const st = toMs(row?.startTime);
                if (!st) return false;
                return keyOfDay(new Date(st)) === k;
            })
            .slice();

        rows.sort((a: any, b: any) => (toMs(a?.startTime) ?? 0) - (toMs(b?.startTime) ?? 0));
        return rows;
    }, [existingSchedule, selectedDate]);

    const timePresets = useMemo(() => {
        const selectedName = String(form.lessonName || '').trim();
        if (!selectedName) return [];

        const set = new Set<string>();
        const out: Array<{ start: string; finish: string }> = [];

        for (const row of existingSchedule || []) {
            const rowName = String((row as any)?.lessonName ?? '').trim();
            if (rowName !== selectedName) continue;
            const st = toMs((row as any)?.startTime);
            const ft = toMs((row as any)?.finishTime ?? (row as any)?.endTime);
            if (!st || !ft) continue;
            const start = formatHHmmFromMs(st);
            const finish = formatHHmmFromMs(ft);
            const key = `${start}-${finish}`;
            if (set.has(key)) continue;
            set.add(key);
            out.push({ start, finish });
        }

        out.sort((a, b) => a.start.localeCompare(b.start));
        return out;
    }, [existingSchedule, form.lessonName]);

    const handleToggleOffset = (offset: number) => {
        if (disabledOffsets.has(offset)) return;
        setSelectedOffsets((prev) => (prev.includes(offset) ? [] : [offset]));
    };

    const handleCreateWeek = async () => {
        if (!teacherId) {
            message.error('Teacher ID not found');
            return;
        }
        if (!form.lessonName.trim()) {
            message.warning('Select lesson name');
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

        if (schedulesForSelectedDate.length > 0) {
            message.error('Bu kunga schedule allaqachon qo\'shilgan');
            return;
        }

        const parseTime = (t: string) => {
            const [h, m] = t.split(':').map((x) => Number(x));
            return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
        };
        const startHM = parseTime(form.startTime);
        const finishHM = parseTime(form.finishTime);

        const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
            return aStart < bEnd && aEnd > bStart;
        };

        const tasks: Array<{ startMs: number; finishMs: number }> = [];

        const sortedOffsets = [...selectedOffsets].sort((a, b) => a - b);
        for (const offset of sortedOffsets) {
            const slot = dateSlots.find((s) => s.offset === offset);
            if (!slot) continue;

            const start = new Date(slot.date);
            start.setHours(startHM.h, startHM.m, 0, 0);

            const finish = new Date(slot.date);
            finish.setHours(finishHM.h, finishHM.m, 0, 0);
            if (finish.getTime() <= start.getTime()) {
                finish.setDate(finish.getDate() + 1);
            }

            const startMs = start.getTime();
            const finishMs = finish.getTime();

            // overlap check against existing schedule
            for (const l of existingSchedule || []) {
                const es = toMs((l as any)?.startTime);
                const ef = toMs((l as any)?.finishTime ?? (l as any)?.endTime);
                if (!es || !ef) continue;
                if (overlap(startMs, finishMs, es, ef)) {
                    message.error(`Bu vaqtda dars bor: ${slot.label} ${slot.dateLabel}`);
                    return;
                }
            }

            tasks.push({ startMs, finishMs });
        }

        if (tasks.length === 0) {
            message.warning('No schedule to create for selected weekdays');
            return;
        }

        setIsSubmitting(true);
        try {
            for (const t of tasks) {
                await createSchedule({
                    teacherId,
                    lessonName: form.lessonName,
                    lessonPrice: Number(form.lessonPrice) || 0,
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
                        <h2 className="text-xl font-bold text-gray-900">Create Weekly Schedule</h2>
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
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Name</label>
                        <div className="relative">
                            <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" />
                            <select
                                value={form.lessonName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setForm((p) => ({ ...p, lessonName: value, lessonPrice: getHourPriceByName(value) }));
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

                    <div className="grid grid-cols-1 gap-3">
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Days (next 7 days)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {dateSlots.map((d) => {
                                const active = selectedOffsets.includes(d.offset);
                                const disabled = disabledOffsets.has(d.offset);
                                const count = scheduleCountByDayKey.get(keyOfDay(d.date)) ?? 0;
                                return (
                                    <button
                                        key={d.offset}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleToggleOffset(d.offset)}
                                        className={`relative h-12 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center leading-tight ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {count > 0 && (
                                            <span
                                                className={`absolute -top-2 -left-2 min-w-6 h-6 px-1 rounded-full text-[11px] font-bold flex items-center justify-center border ${active
                                                    ? 'bg-white text-emerald-700 border-emerald-200'
                                                    : 'bg-gray-900 text-white border-gray-700'
                                                    }`}
                                                title={`Bu kunda ${count} ta dars bor`}
                                            >
                                                {count}
                                            </span>
                                        )}
                                        {active && !disabled && (
                                            <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-emerald-700 bg-white rounded-full" />
                                        )}
                                        <span>{d.label}</span>
                                        <span className={disabled ? 'text-gray-400' : active ? 'text-white/90' : 'text-gray-500'}>{d.dateLabel}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {timePresets.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time presets</label>
                            <div className="flex flex-wrap gap-2">
                                {timePresets.map((t) => (
                                    <button
                                        key={`${t.start}-${t.finish}`}
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, startTime: t.start, finishTime: t.finish }))}
                                        className="h-9 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700"
                                    >
                                        {t.start} - {t.finish}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!!selectedDate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Existing lessons (selected day)</label>
                            <div className="space-y-2">
                                {schedulesForSelectedDate.length === 0 ? (
                                    <div className="text-xs text-gray-500">No lessons for selected day.</div>
                                ) : (
                                    schedulesForSelectedDate.map((l: any) => {
                                        const st = toMs(l?.startTime);
                                        const ft = toMs(l?.finishTime ?? l?.endTime);
                                        const name = String(l?.lessonName ?? 'Lesson');
                                        return (
                                            <div
                                                key={String(l?.id ?? `${name}-${l?.startTime}`)}
                                                className="w-full text-left px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-xs font-semibold text-gray-900 truncate">{name}</div>
                                                    <div className="text-[11px] font-semibold text-gray-600 shrink-0">
                                                        {st ? formatHHmmFromMs(st) : '-'} - {ft ? formatHHmmFromMs(ft) : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    <div>
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

                    <div className="flex gap-2">
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
