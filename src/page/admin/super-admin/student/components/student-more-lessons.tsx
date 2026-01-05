import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Copy, DollarSign, Hash, Link2, Clock } from 'lucide-react';
import type { Student } from '../service/useGetStudents';
import { useStudentLessons } from '../service/useStudentLessons';

interface StudentMoreLessonsProps {
    student: Student;
}

export const StudentMoreLessons: React.FC<StudentMoreLessonsProps> = ({ student }) => {
    const [lessonStatusFilter, setLessonStatusFilter] = useState<string>('');

    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const lessonsQuery = useStudentLessons(student?.id, { page, limit });
    const lessons: any[] = lessonsQuery.data?.data || [];

    const totalPages = lessonsQuery.data?.meta?.totalPages || 0;

    useEffect(() => {
        setPage(1);
    }, [lessonStatusFilter, limit]);

    const filteredLessons = useMemo(() => {
        if (!lessonStatusFilter) return lessons;
        return lessons.filter((l) => String((l as any).status || '').toLowerCase() === lessonStatusFilter);
    }, [lessons, lessonStatusFilter]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (lessonsQuery.isPending) {
        return (
            <div className="flex items-center gap-2 text-gray-600">
                <BookOpen size={14} />
                Loading lessons...
            </div>
        );
    }

    if (filteredLessons.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">No lessons</div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-700" />
                    <p className="text-sm font-semibold text-gray-900">Lessons</p>
                </div>

                <div className="relative w-44">
                    <select
                        value={lessonStatusFilter}
                        onChange={(e) => setLessonStatusFilter(e.target.value)}
                        className="w-full h-9 pl-3 pr-9 border border-gray-200 rounded-xl bg-white text-xs shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="">All statuses</option>
                        <option value="available">available</option>
                        <option value="booked">booked</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                        <option value="expired">expired</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {filteredLessons.map((l: any) => (
                <div key={l.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <BookOpen size={16} className="text-gray-700 shrink-0" />
                                <p className="text-sm font-semibold text-gray-900 truncate" title={String(l?.lessonName || 'Lesson')}>
                                    {String(l?.lessonName || 'Lesson')}
                                </p>
                            </div>
                            <div className="group flex items-center justify-between mt-1 gap-2">
                                <p className="text-xs text-gray-700 truncate" title={String(l?.googleEventId || '')}>
                                    {String(l?.googleEventId || '')}
                                </p>
                                {!!l?.googleEventId && (
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(String(l?.googleEventId))}
                                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        title="Copy googleEventId"
                                    >
                                        <Copy size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 shrink-0">
                            {String(l?.status || '-')}
                        </span>
                    </div>

                    <div className="mt-3 space-y-2">
                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <Hash size={14} className="text-sky-700 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                                <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String(l?.id ?? '')}</span>
                            </div>
                        </div>

                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <Clock size={14} className="text-emerald-700 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Start</span>
                                <span className="text-xs font-medium text-gray-900 flex-1 truncate">
                                    {l?.startTime ? new Date(l.startTime).toLocaleString() : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <Clock size={14} className="text-violet-700 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">End</span>
                                <span className="text-xs font-medium text-gray-900 flex-1 truncate">
                                    {l?.endTime ? new Date(l.endTime).toLocaleString() : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <DollarSign size={14} className="text-amber-700 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Price</span>
                                <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String(l?.price ?? '-')}</span>
                            </div>
                        </div>

                        <div className="group px-3 py-2 border rounded-lg bg-white border-gray-200">
                            <div className="flex items-center gap-2 min-w-0">
                                <Link2 size={14} className="text-rose-700 shrink-0" />
                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Meet</span>
                                <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={String(l?.meetLink || '')}>
                                    {String(l?.meetLink || '-')}
                                </span>
                                {!!l?.meetLink && (
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(String(l?.meetLink))}
                                        className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        title="Copy meet link"
                                    >
                                        <Copy size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {!!totalPages && totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page <= 1}
                            className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <ChevronLeft size={14} />
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => (totalPages ? Math.min(p + 1, totalPages) : p + 1))}
                            disabled={totalPages ? page >= totalPages : false}
                            className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                        <span className="text-xs text-gray-600">Page {page} / {totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Show</span>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="h-9 px-3 border border-gray-200 rounded-xl bg-white text-xs shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            {[5, 10, 20, 50].map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};
