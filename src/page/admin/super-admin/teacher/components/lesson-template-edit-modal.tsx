import React, { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { message } from 'antd';
import { useUpdateLessonTemplate } from '../service/useUpdateLessonTemplate';

interface LessonTemplateEditModalProps {
    open: boolean;
    lesson: any | null;
    onClose: () => void;
    onUpdated: () => void;
}

export const LessonTemplateEditModal: React.FC<LessonTemplateEditModalProps> = ({ open, lesson, onClose, onUpdated }) => {
    const { mutate: updateLesson, isPending } = useUpdateLessonTemplate();

    const toDateTimeLocal = (value: unknown) => {
        if (value == null) return '';

        if (typeof value === 'number') {
            const ms = value < 1_000_000_000_000 ? value * 1000 : value;
            const d = new Date(ms);
            if (Number.isNaN(d.getTime())) return '';
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }

        const asNumber = Number(value);
        if (Number.isFinite(asNumber) && String(value).trim() !== '') {
            const ms = asNumber < 1_000_000_000_000 ? asNumber * 1000 : asNumber;
            const d = new Date(ms);
            if (!Number.isNaN(d.getTime())) {
                const pad = (n: number) => String(n).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
        }

        const d = new Date(String(value));
        if (Number.isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const toUnixSeconds = (datetimeLocal: string) => {
        if (!datetimeLocal) return 0;
        const ms = new Date(datetimeLocal).getTime();
        if (Number.isNaN(ms)) return 0;
        return Math.floor(ms / 1000);
    };

    const [form, setForm] = useState({
        startTime: '',
        finishTime: '',
        lessonName: '',
        lessonPrice: 0,
    });

    useEffect(() => {
        if (!open || !lesson) return;
        const startRaw = (lesson as any)?.startTime;
        const endRaw = (lesson as any)?.endTime ?? (lesson as any)?.finishTime;
        const price = Number(lesson?.price ?? lesson?.lessonPrice);

        setForm({
            startTime: toDateTimeLocal(startRaw),
            finishTime: toDateTimeLocal(endRaw),
            lessonName: String(lesson?.lessonName || ''),
            lessonPrice: Number.isFinite(price) ? price : 0,
        });
    }, [open, lesson]);

    const handleSave = () => {
        if (!lesson?.id) {
            message.error('Lesson ID not found');
            return;
        }
        if (!form.lessonName.trim()) {
            message.warning('lessonName is required');
            return;
        }
        if (!form.startTime || !form.finishTime) {
            message.warning('startTime and finishTime are required');
            return;
        }
        const startSeconds = toUnixSeconds(form.startTime);
        const finishSeconds = toUnixSeconds(form.finishTime);
        if (!startSeconds || !finishSeconds) {
            message.warning('Invalid date/time');
            return;
        }
        updateLesson(
            {
                id: Number(lesson.id),
                startTime: startSeconds,
                finishTime: finishSeconds,
                lessonName: form.lessonName,
                lessonPrice: Number(form.lessonPrice) || 0,
            } as any,
            {
                onSuccess: () => {
                    onClose();
                    onUpdated();
                },
            } as any,
        );
    };

    if (!open || !lesson) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-emerald-700" />
                        <h2 className="text-xl font-bold text-gray-900">Edit Lesson</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Name</label>
                        <input
                            value={form.lessonName}
                            onChange={(e) => setForm((p) => ({ ...p, lessonName: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                            type="datetime-local"
                            value={form.startTime}
                            onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Finish Time</label>
                        <input
                            type="datetime-local"
                            value={form.finishTime}
                            onChange={(e) => setForm((p) => ({ ...p, finishTime: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Price</label>
                        <input
                            type="number"
                            value={form.lessonPrice}
                            onChange={(e) => setForm((p) => ({ ...p, lessonPrice: Number(e.target.value) }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
