import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Select, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CalendarDays, CheckCircle2, DollarSign, Hash, Link2, Phone, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTeacherDetails } from '../service/useTeacherDetails';
import { useCreateLesson } from '../service/useCreateLesson';
import { useTeacherLessons } from '../service/useTeacherLessons';
import { request } from '../../../../config/request';
import { ConfirmModal } from '../../../../components/confirm-modal';

export const TeacherCreateLessonPage: React.FC = () => {
    const details = useTeacherDetails();
    const createLesson = useCreateLesson();
    const qc = useQueryClient();

    const teacherId = details.data?.id;
    const teacher = details.data as any;

    const certificates = (teacher?.certificates || []) as any[];

    const lessonsQuery = useTeacherLessons({ page: 1, limit: 1000 });

    const lessonNameOptions = useMemo(() => {
        const names = (certificates || [])
            .filter((c: any) => c?.isActive !== false)
            .map((c: any) => String(c?.specificationName || '').trim())
            .filter(Boolean);
        return Array.from(new Set(names));
    }, [certificates]);

    const getHourPriceByName = (name: string) => {
        const found = (certificates || []).find((c: any) => String(c?.specificationName || '').trim() === name);
        const price = Number(found?.hourPrice);
        return Number.isFinite(price) ? price : 0;
    };

    const initialValues = useMemo(() => {
        const firstName = lessonNameOptions[0] || '';
        return {
            lessonName: firstName,
            lessonPrice: firstName ? getHourPriceByName(firstName) : 50000,
            startTime: '',
            finishTime: '',
        };
    }, [lessonNameOptions.join('|')]);

    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [priceTouched, setPriceTouched] = useState(false);

    const [selectedOffsets, setSelectedOffsets] = useState<number[]>([0]);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteLessonId, setDeleteLessonId] = useState<number>(0);

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

    const keyOfDay = (d: Date): number => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x.getTime();
    };

    const formatHHmmFromMs = (ms: number): string => {
        const d = new Date(ms);
        return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const dateSlots = useMemo(() => {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

    const existingLessons = useMemo(() => {
        return (lessonsQuery.data?.data || []) as any[];
    }, [lessonsQuery.data?.data]);

    const scheduleCountByDayKey = useMemo(() => {
        const map = new Map<number, number>();
        for (const row of existingLessons || []) {
            const st = toMs((row as any)?.startTime);
            if (!st) continue;
            const k = keyOfDay(new Date(st));
            map.set(k, (map.get(k) ?? 0) + 1);
        }
        return map;
    }, [existingLessons]);

    const selectedDate = useMemo(() => {
        const offset = selectedOffsets[0];
        const slot = dateSlots.find((s) => s.offset === offset);
        return slot?.date ?? null;
    }, [dateSlots, selectedOffsets]);

    const schedulesForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const k = keyOfDay(selectedDate);
        const rows = (existingLessons || [])
            .filter((row: any) => {
                const st = toMs(row?.startTime);
                if (!st) return false;
                return keyOfDay(new Date(st)) === k;
            })
            .slice();
        rows.sort((a: any, b: any) => (toMs(a?.startTime) ?? 0) - (toMs(b?.startTime) ?? 0));
        return rows;
    }, [existingLessons, selectedDate]);

    const timePresets = useMemo(() => {
        const selectedName = String(form.getFieldValue('lessonName') || '').trim();
        if (!selectedName) return [];

        const set = new Set<string>();
        const out: Array<{ start: string; finish: string }> = [];
        for (const row of existingLessons || []) {
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
    }, [existingLessons, form]);

    useEffect(() => {
        setSelectedOffsets([0]);
    }, []);

    useEffect(() => {
        const current = String(form.getFieldValue('lessonName') || '').trim();
        if (!current) {
            if (lessonNameOptions[0]) {
                form.setFieldsValue({
                    lessonName: lessonNameOptions[0],
                    lessonPrice: getHourPriceByName(lessonNameOptions[0]),
                });
                setPriceTouched(false);
            }
            return;
        }
        if (!priceTouched) {
            const p = getHourPriceByName(current);
            if (p > 0) {
                form.setFieldsValue({ lessonPrice: p });
            }
        }
    }, [lessonNameOptions.join('|')]);

    const onFinish = async (values: any) => {
        if (!teacherId) {
            message.error('Teacher ID not found');
            return;
        }

        if (lessonNameOptions.length === 0) {
            message.warning('Certificates are required');
            return;
        }

        if (!values.startTime || !values.finishTime) {
            message.warning('Start time and finish time are required');
            return;
        }

        if (!selectedOffsets.length) {
            message.warning('Select days');
            return;
        }

        const parseTime = (t: string) => {
            const [h, m] = String(t).split(':').map((x) => Number(x));
            return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
        };

        const startHM = parseTime(values.startTime);
        const finishHM = parseTime(values.finishTime);

        const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
            return aStart < bEnd && aEnd > bStart;
        };

        if (schedulesForSelectedDate.length > 0) {
            message.error('Schedule already exists for the selected day');
            return;
        }

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

            for (const l of existingLessons) {
                const es = toMs((l as any)?.startTime);
                const ef = toMs((l as any)?.finishTime ?? (l as any)?.endTime);
                if (es == null || ef == null) continue;
                if (overlap(startMs, finishMs, es, ef)) {
                    message.error(`Overlapping lesson exists: ${slot.label} ${slot.dateLabel}`);
                    return;
                }
            }

            tasks.push({ startMs, finishMs });
        }

        if (!tasks.length) {
            message.warning('No schedule to create for selected days');
            return;
        }

        setSubmitting(true);
        try {
            for (const t of tasks) {
                const payload = {
                    startTime: t.startMs,
                    finishTime: t.finishMs,
                    lessonName: String(values.lessonName || '').trim(),
                    lessonPrice: Number(values.lessonPrice),
                    teacherId: Number(teacherId),
                };
                await createLesson.mutateAsync(payload as any);
            }
            message.success('Schedule created');
            form.resetFields();
            setSelectedOffsets([0]);
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Failed to create schedule');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-screen-2xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-emerald-700" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Schedule</h1>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-1 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {String(teacher?.fullname || 'T')
                                        .split(' ')
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((s: string) => s[0])
                                        .join('')
                                        .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">{String(teacher?.fullname || '-')}</div>
                                    <div className="text-xs text-gray-600 truncate">{String(teacher?.email || '-')}</div>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2">
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Hash size={14} className="text-sky-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{teacherId ?? '-'}</span>
                                    </div>
                                </div>
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Phone size={14} className="text-emerald-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Phone</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String(teacher?.phoneNumber || '-')}</span>
                                    </div>
                                </div>
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <UserRound size={14} className="text-violet-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Experience</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String(teacher?.expirence ?? '-')}</span>
                                    </div>
                                </div>
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Link2 size={14} className="text-rose-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Portfolio</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String(teacher?.portfolioLink || '-')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl" title={<span className="font-bold">Add schedule</span>}>
                                {lessonNameOptions.length === 0 && (
                                    <div className="mb-4 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                                        <div className="text-sm font-semibold text-gray-900">Certificates required</div>
                                        <div className="mt-1 text-xs text-gray-600">You must add at least one certificate before creating a schedule.</div>
                                        <Link
                                            to="/teacher-panel/certificates"
                                            className="inline-flex mt-3 h-10 px-4 items-center justify-center bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                                        >
                                            Go to Certificates
                                        </Link>
                                    </div>
                                )}

                                <Form layout="vertical" form={form} initialValues={initialValues} onFinish={onFinish}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Form.Item name="lessonName" label="Lesson name" rules={[{ required: true, message: 'Lesson name required' }]}>
                                            {lessonNameOptions.length ? (
                                                <Select
                                                    showSearch
                                                    options={lessonNameOptions.map((x) => ({ value: x, label: x }))}
                                                    onChange={(v) => {
                                                        if (!priceTouched) {
                                                            const p = getHourPriceByName(String(v));
                                                            if (p > 0) form.setFieldsValue({ lessonPrice: p });
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <Input placeholder="Lesson name" />
                                            )}
                                        </Form.Item>

                                        <Form.Item name="lessonPrice" label="Lesson price" rules={[{ required: true, message: 'Lesson price required' }]}>
                                            <InputNumber
                                                min={0}
                                                className="w-full"
                                                prefix={<DollarSign size={14} />}
                                                disabled
                                            />
                                        </Form.Item>

                                        <Form.Item name="startTime" label="Start time" rules={[{ required: true, message: 'Start time required' }]}>
                                            <input
                                                type="time"
                                                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                            />
                                        </Form.Item>

                                        <Form.Item name="finishTime" label="Finish time" rules={[{ required: true, message: 'Finish time required' }]}>
                                            <input
                                                type="time"
                                                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                            />
                                        </Form.Item>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CalendarDays size={16} className="text-emerald-700" />
                                            <div className="text-sm font-semibold text-gray-900">Days (next 7 days)</div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {dateSlots.map((d) => {
                                                const active = selectedOffsets.includes(d.offset);
                                                const dayCount = scheduleCountByDayKey.get(keyOfDay(d.date)) ?? 0;
                                                return (
                                                    <button
                                                        key={d.offset}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedOffsets((prev) => (prev.includes(d.offset) ? [] : [d.offset]));
                                                        }}
                                                        className={`relative h-12 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center leading-tight ${active
                                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {dayCount > 0 && (
                                                            <span
                                                                className={`absolute -top-2 -left-2 min-w-6 h-6 px-1 rounded-full text-[11px] font-bold flex items-center justify-center border ${active
                                                                    ? 'bg-white text-emerald-700 border-emerald-200'
                                                                    : 'bg-gray-900 text-white border-gray-700'
                                                                    }`}
                                                                title={`${dayCount} lessons on this day`}
                                                            >
                                                                {dayCount}
                                                            </span>
                                                        )}
                                                        {active && (
                                                            <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-emerald-700 bg-white rounded-full" />
                                                        )}
                                                        <span>{d.label}</span>
                                                        <span className={active ? 'text-white/90' : 'text-gray-500'}>{d.dateLabel}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {timePresets.length > 0 && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Time presets</label>
                                            <div className="flex flex-wrap gap-2">
                                                {timePresets.map((t) => (
                                                    <button
                                                        key={`${t.start}-${t.finish}`}
                                                        type="button"
                                                        onClick={() => {
                                                            form.setFieldsValue({ startTime: t.start, finishTime: t.finish });
                                                        }}
                                                        className="h-9 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700"
                                                    >
                                                        {t.start} - {t.finish}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!!selectedDate && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Existing lessons (selected day)</label>
                                            <div className="space-y-2">
                                                {schedulesForSelectedDate.length === 0 ? (
                                                    <div className="text-xs text-gray-500">No lessons for selected day.</div>
                                                ) : (
                                                    schedulesForSelectedDate.map((l: any) => {
                                                        const st = toMs(l?.startTime);
                                                        const ft = toMs(l?.finishTime ?? l?.endTime);
                                                        const name = String(l?.lessonName ?? 'Lesson');
                                                        const id = Number(l?.id);
                                                        return (
                                                            <div
                                                                key={String(l?.id ?? `${name}-${l?.startTime}`)}
                                                                className="w-full text-left px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="text-xs font-semibold text-gray-900 truncate">{name}</div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <div className="text-[11px] font-semibold text-gray-600">
                                                                            {st ? formatHHmmFromMs(st) : '-'} - {ft ? formatHHmmFromMs(ft) : '-'}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            disabled={!Number.isFinite(id) || id <= 0}
                                                                            onClick={() => {
                                                                                if (!Number.isFinite(id) || id <= 0) return;
                                                                                setDeleteLessonId(id);
                                                                                setDeleteConfirmOpen(true);
                                                                            }}
                                                                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitting || createLesson.isPending}
                                        disabled={details.isPending || lessonNameOptions.length === 0 || lessonsQuery.isPending}
                                        className="h-11"
                                        block
                                    >
                                        Create Schedule
                                    </Button>
                                </Form>
                            </Card>
                        </div>
                    </div>
                </div>
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
                    setDeleteLessonId(0);
                }}
                onConfirm={async () => {
                    if (deleteScheduleMutation.isPending) return;
                    const id = Number(deleteLessonId);
                    if (!Number.isFinite(id) || id <= 0) {
                        setDeleteConfirmOpen(false);
                        return;
                    }
                    try {
                        await deleteScheduleMutation.mutateAsync({ id });
                        setDeleteConfirmOpen(false);
                        setDeleteLessonId(0);
                    } catch {
                        // ignore
                    }
                }}
            />
        </div>
    );
};
