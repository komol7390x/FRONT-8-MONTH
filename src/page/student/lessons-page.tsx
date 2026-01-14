import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, Modal, Tag, Input } from 'antd';
import { CalendarDays, Clock, DollarSign, Link2, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useStudentLessons } from './service/useStudentLessons';
import { PageLoader } from '../../components/page-loader';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';
import { useUpdateLessonTemplate } from '../admin/super-admin/teacher/service/useUpdateLessonTemplate';

export const StudentLessonsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Markazlashgan ID
    const studentId = Number(localStorage.getItem('telegram_student_id') || 0);

    // 2. Filterlar
    const [dayFilter, setDayFilter] = useState<string>(searchParams.get('weekday') || '');
    const [statusFilter] = useState<string>(searchParams.get('status') || '');
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');
    const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
    const limit = 10;

    // 3. API Ma'lumotlari
    const { data: lessonsData, isPending } = useStudentLessons(studentId || undefined, {
        status: statusFilter || undefined,
        search: search || undefined,
        page: 1, // Client-side pagination ishlatilgani uchun hammasini olamiz
        limit: 1000,
    });

    const { mutate: updateLesson, isPending: isUpdating } = useUpdateLessonTemplate();

    // 4. Modal holatlari
    const [editOpen, setEditOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [timeRange, setTimeRange] = useState({ start: '', end: '' });

    // 5. Haftalik kunlar mantiqi
    const rollingWeek = useMemo(() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayName = days[date.getDay()];
            return { dayName, dateLabel: date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }) };
        });
    }, []);

    // 6. Filtrlash va Pagination
    const filteredLessons = useMemo(() => {
        const all = lessonsData?.data || [];
        return all.filter((l: any) => !dayFilter || (l.weekday || l.weekDays) === dayFilter);
    }, [lessonsData, dayFilter]);

    const pageItems = filteredLessons.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(filteredLessons.length / limit);

    // 7. URL sinxronlash
    useEffect(() => {
        const params = new URLSearchParams();
        if (dayFilter) params.set('weekday', dayFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (search) params.set('search', search);
        if (page > 1) params.set('page', String(page));
        setSearchParams(params, { replace: true });
    }, [dayFilter, statusFilter, search, page, setSearchParams]);

    // Yordamchi funksiyalar
    const formatTime = (val: any) => {
        if (!val) return '--:--';
        const date = new Date(Number(val) < 1e12 ? val * 1000 : val);
        return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const openEdit = (lesson: any) => {
        setSelectedLesson(lesson);
        setTimeRange({
            start: formatTime(lesson.startTime),
            end: formatTime(lesson.finishTime || lesson.endTime)
        });
        setEditOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                {/* Qidiruv va Filterlar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={20} className="text-blue-600" />
                        <h1 className="text-lg font-bold text-gray-900">Dars jadvalim</h1>
                    </div>

                    <Input
                        prefix={<Search size={16} className="text-gray-400" />}
                        placeholder="Dars nomini yozing..."
                        className="h-11 rounded-xl"
                        allowClear
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {rollingWeek.map((item) => {
                            const isActive = dayFilter === item.dayName;
                            return (
                                <button
                                    key={item.dayName}
                                    onClick={() => { setDayFilter(isActive ? '' : item.dayName); setPage(1); }}
                                    className={`flex-shrink-0 min-w-[65px] py-2.5 rounded-2xl border transition-all flex flex-col items-center
                                        ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white border-gray-100 text-gray-500'}`}
                                >
                                    <span className="text-[10px] font-bold uppercase opacity-70">{item.dayName.slice(0, 3)}</span>
                                    <span className="text-sm font-black">{item.dateLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Darslar ro'yxati */}
                {isPending ? <PageLoader /> : (
                    <div className="space-y-3">
                        {pageItems.map((lesson: any) => (
                            <Card key={lesson.id} className="rounded-2xl border-none shadow-sm overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Tag color="blue" className="rounded-md border-none font-bold text-[10px] uppercase">
                                            {lesson.weekday || 'Dars'}
                                        </Tag>
                                        <h3 className="font-extrabold text-gray-900 text-base leading-tight">{lesson.lessonName}</h3>
                                        <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
                                            <div className="flex items-center gap-1"><Clock size={14} /> {formatTime(lesson.startTime)}</div>
                                            <div className="flex items-center gap-1 text-green-600"><DollarSign size={14} /> {Number(lesson.price || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <Tag color={lesson.status === 'completed' ? 'green' : 'orange'} className="m-0 rounded-full border-none px-3">
                                        {lesson.status}
                                    </Tag>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                                    <Button
                                        block
                                        icon={<Pencil size={14} />}
                                        onClick={() => openEdit(lesson)}
                                        className="rounded-xl border-gray-200 text-gray-600 h-10 font-bold text-xs"
                                    >
                                        Vaqtni o'zgartirish
                                    </Button>
                                    {lesson.meetLink && (
                                        <Button
                                            block
                                            type="primary"
                                            icon={<Link2 size={16} />}
                                            href={lesson.meetLink}
                                            target="_blank"
                                            className="rounded-xl bg-blue-600 h-10 font-bold text-xs"
                                        >
                                            Darsga kirish
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                        {!isPending && pageItems.length === 0 && (
                            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
                                Darslar topilmadi
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-2">
                        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft size={18} />} className="rounded-xl border-none shadow-sm" />
                        <span className="text-xs font-bold text-gray-400">{page} / {totalPages}</span>
                        <Button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} icon={<ChevronRight size={18} />} className="rounded-xl border-none shadow-sm" />
                    </div>
                )}
            </div>

            <TelegramStudentBottomNav studentId={studentId} />

            {/* Edit Modal */}
            <Modal
                open={editOpen}
                title="Vaqtni tahrirlash"
                onCancel={() => setEditOpen(false)}
                onOk={() => {
                    updateLesson({
                        id: Number(selectedLesson.id),
                        startTime: Math.floor(new Date().setHours(Number(timeRange.start.split(':')[0]), Number(timeRange.start.split(':')[1])) / 1000),
                        finishTime: Math.floor(new Date().setHours(Number(timeRange.end.split(':')[0]), Number(timeRange.end.split(':')[1])) / 1000),
                    } as any, { onSuccess: () => setEditOpen(false) });
                }}
                okText="Saqlash"
                cancelText="Bekor qilish"
                okButtonProps={{ className: 'bg-blue-600 rounded-lg', loading: isUpdating }}
            >
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Boshlanish</label>
                        <Input type="time" value={timeRange.start} onChange={e => setTimeRange({ ...timeRange, start: e.target.value })} className="rounded-xl h-11" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Tugash</label>
                        <Input type="time" value={timeRange.end} onChange={e => setTimeRange({ ...timeRange, end: e.target.value })} className="rounded-xl h-11" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};