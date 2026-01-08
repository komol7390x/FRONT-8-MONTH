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

    const [selectedOffsets, setSelectedOffsets] = useState<number[]>([0, 1, 2, 3, 4]);
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

    const dateSlots = useMemo(() => {
        const months = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK'];
        const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

        const base = new Date();
        base.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(base);
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
        const defaults = [0, 1, 2, 3, 4].filter((x) => !disabledOffsets.has(x));
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

    const handleToggleOffset = (offset: number) => {
        if (disabledOffsets.has(offset)) return;
        setSelectedOffsets((prev) => (prev.includes(offset) ? prev.filter((d) => d !== offset) : [...prev, offset]));
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

            const start = new Date(slot.date);
            start.setHours(startHM.h, startHM.m, 0, 0);

            const finish = new Date(slot.date);
            finish.setHours(finishHM.h, finishHM.m, 0, 0);
            if (finish.getTime() <= start.getTime()) {
                finish.setDate(finish.getDate() + 1);
            }

            tasks.push({ startMs: start.getTime(), finishMs: finish.getTime() });
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
                                return (
                                    <button
                                        key={d.offset}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleToggleOffset(d.offset)}
                                        className={`relative h-12 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center leading-tight ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                    >
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Price</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700" />
                            <input
                                type="number"
                                value={form.lessonPrice}
                                onChange={(e) => setForm((p) => ({ ...p, lessonPrice: Number(e.target.value) }))}
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
