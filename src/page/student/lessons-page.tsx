import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { CalendarDays, DollarSign, Pencil, Search, ChevronLeft, ChevronRight, Video } from 'lucide-react';
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
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');
    const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
    const limit = 10;

    // 3. API Ma'lumotlari
    const { data: lessonsData, isPending } = useStudentLessons(studentId || undefined, {
        page: 1,
        limit: 1000,
    });

    const { mutate: updateLesson, isPending: isUpdating } = useUpdateLessonTemplate();

    // 4. Modal holatlari
    const [editOpen, setEditOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [timeRange, setTimeRange] = useState({ start: '', end: '' });

    // 5. Haftalik kunlar mantiqi
    const rollingWeek = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();

        const dayOfWeek = today.getDay();
        const diffToMonday = today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

        const monday = new Date(today.setDate(diffToMonday));

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            const dayName = days[date.getDay()];
            const dateLabel = date.toLocaleDateString('uz-UZ', {
                day: '2-digit',
                month: '2-digit'
            });

            return { dayName, dateLabel, isToday: new Date().toDateString() === date.toDateString() };
        });
    }, []);

    // 6. Filtrlash (Client-side)
    const filteredLessons = useMemo(() => {
        let all = lessonsData?.data || [];
        if (dayFilter) {
            all = all.filter((l: any) => (l.weekday || l.weekDays) === dayFilter);
        }
        if (search) {
            all = all.filter((l: any) => l.lessonName?.toLowerCase().includes(search.toLowerCase()));
        }
        return all;
    }, [lessonsData, dayFilter, search]);

    const pageItems = filteredLessons.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(filteredLessons.length / limit);

    // 7. URL sinxronlash
    useEffect(() => {
        const params = new URLSearchParams();
        if (dayFilter) params.set('weekday', dayFilter);
        if (search) params.set('search', search);
        if (page > 1) params.set('page', String(page));
        setSearchParams(params, { replace: true });
    }, [dayFilter, search, page, setSearchParams]);

    const formatTime = (val: any) => {
        if (!val) return '--:--';
        const t = Number(val);
        const date = new Date(t < 1e11 ? t * 1000 : t);
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
        <div className="min-h-screen bg-gray-50 p-4 pb-28 font-sans">
            <div className="max-w-md mx-auto space-y-5">

                {/* Header Section */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Dars jadvalim</h1>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Siz band qilgan darslar</p>
                        </div>
                    </div>

                    <Input
                        prefix={<Search size={18} className="text-gray-300 mr-1" />}
                        placeholder="Dars nomini yozing..."
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all mb-5"
                        allowClear
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {rollingWeek.map((item) => {
                            const isActive = dayFilter === item.dayName;
                            return (
                                <button
                                    key={item.dayName}
                                    onClick={() => { setDayFilter(isActive ? '' : item.dayName); setPage(1); }}
                                    className={`flex-shrink-0 min-w-[70px] py-3 rounded-2xl border transition-all flex flex-col items-center
                                        ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 text-gray-500'}`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70 mb-1">{item.dayName.slice(0, 3)}</span>
                                    <span className="text-sm font-black tracking-tight">{item.dateLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-4">
                    {isPending ? <div className="py-10"><PageLoader /></div> : pageItems.length > 0 ? (
                        pageItems.map((lesson: any) => (
                            <div key={lesson.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg">
                                                {lesson.weekday || 'Dars'}
                                            </span>
                                            {lesson.status === 'active' && (
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            )}
                                        </div>
                                        <h3 className="font-black text-gray-900 text-lg leading-tight mt-1">{lesson.lessonName}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-base font-black text-gray-900 tracking-tighter">
                                            {formatTime(lesson.startTime)}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                            Boshlanishi
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm font-bold text-gray-600 mb-5">
                                    <div className="flex items-center gap-1.5">
                                        <DollarSign size={16} className="text-green-500" />
                                        <span>{Number(lesson.price || 0).toLocaleString()} UZS</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => openEdit(lesson)}
                                        className="h-12 rounded-2xl border-gray-100 bg-gray-50 text-gray-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100"
                                    >
                                        <Pencil size={14} /> Vaqt
                                    </Button>

                                    {lesson.meetLink ? (
                                        <Button
                                            type="primary"
                                            href={lesson.meetLink}
                                            target="_blank"
                                            className="h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-100 font-bold text-xs flex items-center justify-center gap-2"
                                        >
                                            <Video size={16} /> Kirish
                                        </Button>
                                    ) : (
                                        <div className="h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center leading-tight">
                                            Link mavjud emas
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <CalendarDays size={48} className="mx-auto text-gray-100 mb-4" />
                            <p className="text-gray-400 font-bold">Darslar topilmadi</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-2 py-4">
                        <Button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            icon={<ChevronLeft size={20} />}
                            className="w-12 h-12 rounded-2xl border-none shadow-sm flex items-center justify-center"
                        />
                        <div className="px-5 py-2 bg-gray-900 text-white rounded-2xl text-xs font-black tracking-widest">
                            {page} / {totalPages}
                        </div>
                        <Button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            icon={<ChevronRight size={20} />}
                            className="w-12 h-12 rounded-2xl border-none shadow-sm flex items-center justify-center"
                        />
                    </div>
                )}
            </div>

            <TelegramStudentBottomNav studentId={studentId} />

            {/* Modern Edit Modal */}
            <Modal
                open={editOpen}
                title={<span className="font-black text-gray-900">Vaqtni o'zgartirish</span>}
                onCancel={() => setEditOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setEditOpen(false)} className="rounded-xl font-bold h-11">Bekor qilish</Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={isUpdating}
                        className="rounded-xl font-bold bg-indigo-600 h-11 px-8"
                        onClick={() => {
                            updateLesson({
                                id: Number(selectedLesson.id),
                                startTime: Math.floor(new Date().setHours(Number(timeRange.start.split(':')[0]), Number(timeRange.start.split(':')[1])) / 1000),
                                finishTime: Math.floor(new Date().setHours(Number(timeRange.end.split(':')[0]), Number(timeRange.end.split(':')[1])) / 1000),
                            } as any, {
                                onSuccess: () => {
                                    message.success('Vaqt yangilandi');
                                    setEditOpen(false);
                                }
                            });
                        }}
                    >
                        Saqlash
                    </Button>
                ]}
                centered
                className="custom-modal"
            >
                <div className="grid grid-cols-2 gap-4 py-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Boshlanish</label>
                        <Input
                            type="time"
                            value={timeRange.start}
                            onChange={e => setTimeRange({ ...timeRange, start: e.target.value })}
                            className="rounded-2xl h-14 font-bold text-lg bg-gray-50 border-none focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Tugash</label>
                        <Input
                            type="time"
                            value={timeRange.end}
                            onChange={e => setTimeRange({ ...timeRange, end: e.target.value })}
                            className="rounded-2xl h-14 font-bold text-lg bg-gray-50 border-none focus:bg-white transition-all"
                        />
                    </div>
                </div>
                <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-3 rounded-xl leading-relaxed">
                    ⚠️ Diqqat: Vaqtni o'zgartirish dars jadvalingizga ta'sir qiladi. Iltimos, o'qituvchi bilan maslahatlashing.
                </p>
            </Modal>
        </div>
    );
};