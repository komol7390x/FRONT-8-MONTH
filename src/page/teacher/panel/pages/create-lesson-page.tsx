import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Select, message } from 'antd';
import { BookOpen, CalendarDays, CheckCircle2, DollarSign, Hash, Link2, Phone, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTeacherDetails } from '../service/useTeacherDetails';
import { useCreateLesson } from '../service/useCreateLesson';
import { useTeacherLessons } from '../service/useTeacherLessons';

export const TeacherCreateLessonPage: React.FC = () => {
    const details = useTeacherDetails();
    const createLesson = useCreateLesson();

    const teacherId = details.data?.id;
    const teacher = details.data as any;

    const certificates = (teacher?.certificates || []) as any[];

    const lessonsQuery = useTeacherLessons({ page: 1, limit: 1000 });

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

    const initialValues = useMemo(() => {
        const firstName = lessonNameOptions[0] || '';
        return {
            lessonName: firstName,
            lessonPrice: firstName ? getHourPriceByName(firstName) : 50000,
            startTime: '',
            finishTime: '',
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonNameOptions.join('|')]);

    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const [selectedOffsets, setSelectedOffsets] = useState<number[]>([0]);

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

    const existingLessons = useMemo(() => {
        return (lessonsQuery.data?.data || []) as any[];
    }, [lessonsQuery.data?.data]);

    const disabledOffsets = useMemo(() => {
        const toDate = (v: any) => {
            if (v == null) return null;
            if (typeof v === 'number') {
                const ms = v < 1_000_000_000_000 ? v * 1000 : v;
                const d = new Date(ms);
                return Number.isNaN(d.getTime()) ? null : d;
            }
            const asNumber = Number(v);
            if (Number.isFinite(asNumber) && String(v).trim() !== '') {
                const ms = asNumber < 1_000_000_000_000 ? asNumber * 1000 : asNumber;
                const d = new Date(ms);
                return Number.isNaN(d.getTime()) ? null : d;
            }
            const d = new Date(String(v));
            return Number.isNaN(d.getTime()) ? null : d;
        };

        const slotMap = new Map<string, number>();
        for (const s of dateSlots) {
            slotMap.set(s.date.toDateString(), s.offset);
        }

        const disabled = new Set<number>();
        for (const l of existingLessons || []) {
            const d = toDate((l as any)?.startTime ?? (l as any)?.start ?? (l as any)?.date);
            if (!d) continue;
            const offset = slotMap.get(d.toDateString());
            if (typeof offset === 'number') disabled.add(offset);
        }
        return disabled;
    }, [dateSlots, existingLessons]);

    useEffect(() => {
        setSelectedOffsets((prev) => {
            const cleaned = prev.filter((x) => !disabledOffsets.has(x));
            return cleaned.length ? cleaned : [0].filter((x) => !disabledOffsets.has(x));
        });
    }, [disabledOffsets]);

    useEffect(() => {
        const current = String(form.getFieldValue('lessonName') || '').trim();
        if (!current) {
            if (lessonNameOptions[0]) {
                form.setFieldsValue({
                    lessonName: lessonNameOptions[0],
                    lessonPrice: getHourPriceByName(lessonNameOptions[0]),
                });
            }
            return;
        }
        const p = getHourPriceByName(current);
        if (p > 0) {
            form.setFieldsValue({ lessonPrice: p });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonNameOptions.join('|')]);

    const onFinish = async (values: any) => {
        if (!teacherId) {
            message.error('Teacher ID topilmadi');
            return;
        }

        if (lessonNameOptions.length === 0) {
            message.warning('Avval certificate qo\'shing');
            return;
        }

        if (!values.startTime || !values.finishTime) {
            message.warning('startTime va finishTime kiriting');
            return;
        }

        if (!selectedOffsets.length) {
            message.warning('Kun tanlang');
            return;
        }

        const parseTime = (t: string) => {
            const [h, m] = String(t).split(':').map((x) => Number(x));
            return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
        };

        const startHM = parseTime(values.startTime);
        const finishHM = parseTime(values.finishTime);

        const normalizeSeconds = (v: any) => {
            if (v == null) return null;
            const n = Number(v);
            if (Number.isFinite(n)) return n;
            const d = new Date(String(v));
            return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
        };

        const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
            return aStart < bEnd && aEnd > bStart;
        };

        const tasks: Array<{ startSeconds: number; finishSeconds: number }> = [];
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

            const startSeconds = Math.floor(start.getTime() / 1000);
            const finishSeconds = Math.floor(finish.getTime() / 1000);

            for (const l of existingLessons) {
                const es = normalizeSeconds((l as any)?.startTime);
                const ef = normalizeSeconds((l as any)?.finishTime ?? (l as any)?.endTime);
                if (es == null || ef == null) continue;
                if (overlap(startSeconds, finishSeconds, es, ef)) {
                    message.error(`Bu vaqtda dars bor: ${slot.label} ${slot.dateLabel}`);
                    return;
                }
            }

            tasks.push({ startSeconds, finishSeconds });
        }

        if (!tasks.length) {
            message.warning('Tanlangan kunlarda create qilib bo\'lmadi');
            return;
        }

        setSubmitting(true);
        try {
            for (const t of tasks) {
                const payload = {
                    startTime: t.startSeconds,
                    finishTime: t.finishSeconds,
                    lessonName: String(values.lessonName || '').trim(),
                    lessonPrice: Number(values.lessonPrice),
                    teacherId: Number(teacherId),
                };
                await createLesson.mutateAsync(payload as any);
            }
            message.success('Lesson created');
            form.resetFields();
            setSelectedOffsets([0]);
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Create lesson error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-emerald-700" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Teacher details</h1>
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
                            <Card className="rounded-2xl" title={<span className="font-bold">Add lesson</span>}>
                                {lessonNameOptions.length === 0 && (
                                    <div className="mb-4 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                                        <div className="text-sm font-semibold text-gray-900">Certificates required</div>
                                        <div className="mt-1 text-xs text-gray-600">Certificate bo'lmasa lesson create qilib bo'lmaydi.</div>
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
                                                        const p = getHourPriceByName(String(v));
                                                        if (p > 0) form.setFieldsValue({ lessonPrice: p });
                                                    }}
                                                />
                                            ) : (
                                                <Input placeholder="Lesson name" />
                                            )}
                                        </Form.Item>

                                        <Form.Item name="lessonPrice" label="Lesson price" rules={[{ required: true, message: 'Lesson price required' }]}>
                                            <InputNumber min={0} className="w-full" prefix={<DollarSign size={14} />} />
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
                                                const disabled = disabledOffsets.has(d.offset);
                                                return (
                                                    <button
                                                        key={d.offset}
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() => {
                                                            if (disabled) return;
                                                            setSelectedOffsets((prev) =>
                                                                prev.includes(d.offset)
                                                                    ? prev.filter((x) => x !== d.offset)
                                                                    : [...prev, d.offset],
                                                            );
                                                        }}
                                                        className={`relative h-12 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center leading-tight ${disabled
                                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : active
                                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                            }`}
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

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitting || createLesson.isPending}
                                        disabled={details.isPending || lessonNameOptions.length === 0 || lessonsQuery.isPending}
                                        className="h-11"
                                        block
                                    >
                                        Create
                                    </Button>
                                </Form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
