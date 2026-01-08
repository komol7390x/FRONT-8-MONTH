import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Clock, Copy, DollarSign, Edit, Hash, Link2 } from 'lucide-react';
import type { Teacher } from '../service/useGetTeachers';
import { useTeacherLessons, type LessonTemplateItem } from '../service/useTeacherLessons';
import { Pagination } from '../../admin/components/pagantion';
import { copyToClipboard, formatDateTime, formatNumber, toDisplay } from './teacher-utils';
import { LessonTemplateEditModal } from './lesson-template-edit-modal';
import { LessonTemplateCreateModal } from './lesson-template-create-modal';

interface TeacherMoreLessonsProps {
    teacher: Teacher;
    onUpdated: () => void;
    focusLessonId?: number;
}

export const TeacherMoreLessons: React.FC<TeacherMoreLessonsProps> = ({ teacher, onUpdated, focusLessonId }) => {
    const [lessonStatusFilter, setLessonStatusFilter] = useState<string>('');
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(2);

    const [highlightLessonId, setHighlightLessonId] = useState<number | undefined>(undefined);
    const lessonRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const lessonsQuery = useTeacherLessons(teacher?.id, {
        page,
        limit,
        status: lessonStatusFilter ? (lessonStatusFilter as any) : undefined,
    });
    const lessons: LessonTemplateItem[] = lessonsQuery.data?.data || [];

    const totalPages = lessonsQuery.data?.meta?.totalPages || 0;
    const totalCount = lessonsQuery.data?.meta?.totalItems || lessons.length;

    useEffect(() => {
        setPage(1);
    }, [lessonStatusFilter, limit]);

    useEffect(() => {
        if (!focusLessonId) return;
        setHighlightLessonId(focusLessonId);
    }, [focusLessonId]);

    useEffect(() => {
        if (!highlightLessonId) return;
        const el = lessonRefs.current[highlightLessonId];
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [highlightLessonId, lessons]);

    const filteredLessons = useMemo(() => lessons, [lessons]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-700" />
                    <p className="text-sm font-semibold text-gray-900">Lessons</p>
                </div>

                <div className="flex items-center gap-2">
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
            </div>

            {lessonsQuery.isPending ? (
                <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen size={14} />
                    Loading lessons...
                </div>
            ) : filteredLessons.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">No lessons</div>
            ) : (
                filteredLessons.map((l: any) => (
                    <div
                        key={l.id}
                        ref={(el) => {
                            if (l?.id != null) lessonRefs.current[Number(l.id)] = el;
                        }}
                        className={`p-3 border rounded-lg transition-colors ${Number(l?.id) === Number(highlightLessonId)
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300 animate-pulse'
                            : 'border-gray-200 bg-gray-50'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <BookOpen size={16} className="text-gray-700 shrink-0" />
                                    <p className="text-sm font-semibold text-gray-900 truncate" title={toDisplay(l?.lessonName || 'Lesson')}>
                                        {toDisplay(l?.lessonName || 'Lesson')}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-700 mt-1 truncate" title={toDisplay(l?.googleEventId)}>
                                    {toDisplay(l?.googleEventId)}
                                </p>
                            </div>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 shrink-0">
                                {toDisplay(l?.status)}
                            </span>
                        </div>

                        <div className="mt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedLesson(l);
                                    setIsEditOpen(true);
                                }}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50 flex items-center gap-1"
                            >
                                <Edit size={12} />
                                Edit
                            </button>
                        </div>

                        <div className="mt-3 space-y-2">
                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Hash size={14} className="text-sky-700 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay(l?.id)}>{toDisplay(l?.id)}</span>
                                </div>
                            </div>

                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Clock size={14} className="text-emerald-700 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Start</span>
                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime(l?.startTime)}>{formatDateTime(l?.startTime)}</span>
                                </div>
                            </div>

                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Clock size={14} className="text-violet-700 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">End</span>
                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime(l?.endTime)}>{formatDateTime(l?.endTime)}</span>
                                </div>
                            </div>

                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <DollarSign size={14} className="text-amber-700 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Price</span>
                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatNumber(l?.price)}>{formatNumber(l?.price)}</span>
                                </div>
                            </div>

                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Link2 size={14} className="text-rose-700 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Meet</span>
                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay(l?.meetLink)}>
                                        {toDisplay(l?.meetLink)}
                                    </span>
                                    {!!toDisplay(l?.meetLink) && (
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(l?.meetLink)}
                                            className="shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                            title="Copy meet link"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {!!totalPages && (
                <Pagination
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    admins={filteredLessons as any}
                    setPage={setPage}
                    handleLimitChange={(newLimit: string | number) => setLimit(Number(newLimit))}
                />
            )}

            <LessonTemplateEditModal
                open={isEditOpen}
                lesson={selectedLesson}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedLesson(null);
                }}
                onUpdated={() => {
                    setIsEditOpen(false);
                    setSelectedLesson(null);
                    onUpdated();
                }}
            />

            <LessonTemplateCreateModal
                open={isCreateOpen}
                teacherId={teacher?.id}
                existingLessons={lessons}
                certificates={teacher?.certificates || []}
                onClose={() => setIsCreateOpen(false)}
                onCreated={() => {
                    setIsCreateOpen(false);
                    onUpdated();
                }}
            />
        </div>
    );
};
