import React from 'react';
import { X, Hash, CalendarClock, DollarSign, CheckCircle2, Link2, Copy, Clock, BookOpen } from 'lucide-react';
import { Tag, message } from 'antd';
import type { TeacherLessonTemplate } from '../service/useTeacherLessons';

interface LessonDetailsModalProps {
    open: boolean;
    lesson: TeacherLessonTemplate | null;
    onClose: () => void;
}

export const LessonDetailsModal: React.FC<LessonDetailsModalProps> = ({
    open,
    lesson,
    onClose,
}) => {
    if (!open || !lesson) return null;

    const toDisplay = (value: unknown): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    };

    const formatDateTime = (value: unknown): string => {
        const raw = toDisplay(value);
        if (!raw || raw === '-') return '-';
        const asNumber = Number(raw);
        const d = Number.isFinite(asNumber)
            ? new Date(asNumber < 1_000_000_000_000 ? asNumber * 1000 : asNumber)
            : new Date(raw);
        if (Number.isNaN(d.getTime())) return raw;
        const day = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
        const date = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${day} ${date} ${time}`;
    };

    const copyToClipboard = async (text: string) => {
        if (!text || text === '-') return;
        try {
            await navigator.clipboard.writeText(text);
            message.success('Copied');
        } catch {
            message.error('Copy failed');
        }
    };

    const status = String((lesson as any)?.status ?? '').toLowerCase();
    const statusColor = status === 'booked' ? 'green' : status === 'available' ? 'blue' : status === 'completed' ? 'green' : status === 'cancelled' ? 'red' : status === 'expired' ? 'orange' : 'default';
    const isPaid = Boolean((lesson as any)?.isPaid);
    const meetLink = toDisplay((lesson as any)?.meetLink);
    const lessonName = toDisplay((lesson as any)?.lessonName);
    const lessonPrice = toDisplay((lesson as any)?.lessonPrice ?? (lesson as any)?.price);
    const weekday = toDisplay((lesson as any)?.weekday ?? (lesson as any)?.weekDays ?? (lesson as any)?.weekDay);
    const startTime = formatDateTime((lesson as any)?.startTime);
    const finishTime = formatDateTime((lesson as any)?.finishTime ?? (lesson as any)?.endTime);
    const lessonId = (lesson as any)?.id ?? '-';
    const teacherId = (lesson as any)?.teacherId ?? '-';
    const studentId = (lesson as any)?.studentId ?? '-';

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4 p-4 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Lesson Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {/* Lesson ID */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <Hash size={14} className="text-sky-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Lesson ID</span>
                            <span className="text-xs font-medium text-gray-900 flex-1 truncate">{lessonId}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(String(lessonId))}
                                className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                title="Copy"
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Lesson Name */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <BookOpen size={14} className="text-violet-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Lesson Name</span>
                            <span className="text-xs font-medium text-gray-900 flex-1 truncate">{lessonName}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(lessonName)}
                                className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                title="Copy"
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Status</span>
                            <Tag className="m-0" color={statusColor as any}>{String((lesson as any)?.status ?? '-')}</Tag>
                        </div>
                    </div>

                    {/* Is Paid */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <DollarSign size={14} className="text-amber-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Is Paid</span>
                            <span className={`text-xs font-semibold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {isPaid ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <DollarSign size={14} className="text-amber-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Price</span>
                            <span className="text-xs font-medium text-gray-900 flex-1 truncate">{lessonPrice} UZS</span>
                        </div>
                    </div>

                    {/* Weekday */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <CalendarClock size={14} className="text-blue-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Weekday</span>
                            <span className="text-xs font-medium text-gray-900 flex-1 truncate">{weekday}</span>
                        </div>
                    </div>

                    {/* Start Time */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <Clock size={14} className="text-indigo-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Start Time</span>
                            <span className="text-xs font-medium text-gray-900 flex-1 truncate">{startTime}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(startTime)}
                                className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                title="Copy"
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Finish Time */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <Clock size={14} className="text-indigo-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Finish Time</span>
                            <span className="text-xs font-medium text-gray-900 flex-1 truncate">{finishTime}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(finishTime)}
                                className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                title="Copy"
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Meet Link */}
                    {meetLink && meetLink !== '-' && (
                        <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <Link2 size={14} className="text-cyan-700 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Meet Link</span>
                                <a
                                    href={meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-blue-600 flex-1 truncate hover:underline"
                                >
                                    {meetLink}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(meetLink)}
                                    className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    title="Copy"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Teacher ID */}
                    <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                            <Hash size={14} className="text-purple-700 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Teacher ID</span>
                            <span className="text-xs font-medium text-gray-900 flex-1 truncate">{teacherId}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(String(teacherId))}
                                className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                title="Copy"
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Student ID */}
                    {studentId && studentId !== '-' && (
                        <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <Hash size={14} className="text-green-700 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 w-32 shrink-0">Student ID</span>
                                <span className="text-xs font-medium text-gray-900 flex-1 truncate">{studentId}</span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(String(studentId))}
                                    className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    title="Copy"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
