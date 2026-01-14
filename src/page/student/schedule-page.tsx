import React, { useState, useEffect, useMemo } from 'react';
import { Button, Select, message } from 'antd';
import { CalendarDays } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentSchedule } from './service/useStudentSchedule';
import { PageLoader } from '../../components/page-loader';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentSchedulePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Shell tomonidan saqlangan Student ID ni olish
    const studentId = Number(localStorage.getItem('telegram_student_id') || 0);

    // 2. Filterlar holati
    const [dayFilter, setDayFilter] = useState<string>(searchParams.get('day') || '');
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [selectedLessonNames, setSelectedLessonNames] = useState<string[]>(
        searchParams.get('lessonNames')?.split(',').filter(Boolean) || []
    );

    // 3. API so'rovi (Hozirgi kun uchun)
    const { data: scheduleData, isPending } = useStudentSchedule({
        active: true,
        day: dayFilter || undefined,
        page: 1,
        limit: 1000,
    });

    // Barcha darslar (Select filtri uchun dars nomlarini olish)
    const { data: allData } = useStudentSchedule({ active: true, page: 1, limit: 1000 });
    const allLessons = allData?.data || [];

    // 4. Bugungi kunni avtomatik tanlash (Faqat bir marta boshida)
    useEffect(() => {
        if (!dayFilter && !searchParams.get('day')) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = days[new Date().getDay()];
            setDayFilter(today);
        }
    }, [dayFilter, searchParams]);

    // 5. URLni yangilash
    useEffect(() => {
        const params = new URLSearchParams();
        if (dayFilter) params.set('day', dayFilter);
        if (selectedLessonNames.length) params.set('lessonNames', selectedLessonNames.join(','));
        setSearchParams(params, { replace: true });
    }, [dayFilter, selectedLessonNames]);

    // 6. Haftalik kunlar va darslar sonini hisoblash
    const rollingWeek = useMemo(() => {
        const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayIdx = new Date().getDay();
        return Array.from({ length: 7 }, (_, i) => {
            const idx = (todayIdx + i) % 7;
            const d = new Date();
            d.setDate(d.getDate() + i);
            return {
                day: order[idx],
                dateStr: d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }),
            };
        });
    }, []);

    const weekdayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allLessons.forEach((l: any) => {
            const d = l?.weekDays || l?.weekday || l?.day;
            if (d) counts[d] = (counts[d] || 0) + 1;
        });
        return counts;
    }, [allLessons]);

    const toMs = (value: any): number | null => {
        if (value == null || value === '') return null;
        const n = Number(value);
        if (Number.isFinite(n)) {
            return n < 1_000_000_000_000 ? n * 1000 : n;
        }
        const d = new Date(String(value));
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    };

    // 7. Darslarni saralash
    const filteredLessons = useMemo(() => {
        return (scheduleData?.data || [])
            .filter((l: any) => {
                if (selectedLessonNames.length) {
                    return selectedLessonNames.includes(l?.lessonName);
                }
                return true;
            })
            .sort((a: any, b: any) => (toMs(a?.startTime) ?? 0) - (toMs(b?.startTime) ?? 0));
    }, [scheduleData?.data, selectedLessonNames]);

    // Xavfsiz vaqt formatlash
    const formatTime = (time: any) => {
        if (!time) return '--:--';
        const ms = toMs(time);
        if (!ms) return '--:--';
        return new Date(ms).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const handleBook = (lesson: any) => {
        if (!studentId) {
            return message.error('Student ID topilmadi. Iltimos, qaytadan kiring.');
        }

        const qp = new URLSearchParams({
            studentId: String(studentId),
            lessonId: String(lesson.id),
            lessonName: String(lesson.lessonName || 'Dars'),
            teacherId: String(lesson.teacherId || ''),
            startTime: String(lesson.startTime),
            endTime: String(lesson.finishTime || lesson.endTime)
        });
        navigate(`/telegram/student-book-confirm?${qp.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <CalendarDays size={22} className="text-green-600" />
                        <h1 className="text-xl font-bold text-gray-900">Darslar jadvali</h1>
                    </div>

                    <Select
                        mode="multiple"
                        placeholder="Dars turini tanlang"
                        className="w-full mb-5 custom-select"
                        allowClear
                        value={selectedLessonNames}
                        onChange={setSelectedLessonNames}
                        options={Array.from(new Set(allLessons.map((l: any) => l.lessonName))).map(n => ({ label: n, value: n }))}
                    />

                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {rollingWeek.map(({ day, dateStr }) => {
                            const count = weekdayCounts[day] || 0;
                            const active = dayFilter === day;
                            return (
                                <button
                                    key={day}
                                    disabled={count === 0 && !active}
                                    onClick={() => { setDayFilter(day); setSelectedLesson(null); }}
                                    className={`py-3 rounded-2xl text-[11px] font-bold flex flex-col items-center transition-all border
                                        ${active ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100' :
                                            count === 0 ? 'bg-gray-50 text-gray-300 border-gray-100 opacity-60' : 'bg-white text-gray-600 border-gray-100'}`}
                                >
                                    <span className="uppercase tracking-tighter">{day.slice(0, 3)}</span>
                                    <span className="text-[10px] opacity-60 font-medium">{dateStr}</span>
                                    {count > 0 && !active && (
                                        <span className="mt-1 px-1.5 bg-green-50 text-green-600 rounded-lg text-[9px]">{count}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    {isPending ? (
                        <div className="py-10"><PageLoader /></div>
                    ) : filteredLessons.length > 0 ? (
                        filteredLessons.map((l: any) => (
                            <button
                                key={l.id}
                                onClick={() => setSelectedLesson(l)}
                                className={`w-full text-left p-4 rounded-3xl border transition-all active:scale-[0.98] 
                                    ${selectedLesson?.id === l.id
                                        ? 'border-green-500 bg-green-50 ring-2 ring-green-500/10'
                                        : 'border-white bg-white shadow-sm'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="text-base font-semibold text-gray-900">{l.lessonName}</div>
                                        <div className="text-[11px] text-gray-400 font-normal">O'qituvchi ID: {l.teacherId}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-green-600">
                                            {formatTime(l.startTime)} - {formatTime(l.finishTime || l.endTime)}
                                        </div>
                                        <div className="text-xs text-green-600 font-bold mt-1">
                                            {Number(l.price).toLocaleString()} UZS
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed text-gray-400">
                            Bu kunda darslar topilmadi
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Booking Action */}
            {selectedLesson && (
                <div className="fixed bottom-24 left-4 right-4 animate-in fade-in slide-in-from-bottom-5">
                    <div className="max-w-md mx-auto bg-gray-900 text-white p-4 rounded-3xl shadow-2xl flex justify-between items-center border border-white/10 backdrop-blur-md">
                        <div className="pl-2">
                            <div className="text-xs text-gray-400 font-medium">Tanlangan dars:</div>
                            <div className="text-sm font-bold truncate max-w-[150px]">{selectedLesson.lessonName}</div>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            className="bg-green-500 border-none hover:bg-green-400 h-12 px-8 rounded-2xl font-bold"
                            onClick={() => handleBook(selectedLesson)}
                        >
                            Band qilish
                        </Button>
                    </div>
                </div>
            )}

            <TelegramStudentBottomNav studentId={studentId} />
        </div>
    );
};