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

    // 1. Statik ma'lumotlar (Shell allaqachon tokenni hal qilgan)
    const studentId = Number(localStorage.getItem('telegram_student_id') || 0);

    // 2. Filterlar holati
    const [dayFilter, setDayFilter] = useState<string>(searchParams.get('day') || '');
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [selectedLessonNames, setSelectedLessonNames] = useState<string[]>(
        searchParams.get('lessonNames')?.split(',').filter(Boolean) || []
    );

    // 3. API so'rovlari
    const { data: scheduleData, isPending } = useStudentSchedule({
        active: true,
        day: dayFilter || undefined,
        page: 1,
        limit: 1000,
    });

    // Barcha darslar (hisob-kitoblar uchun)
    const statsQuery = useStudentSchedule({ active: true, page: 1, limit: 1000 });
    const allLessonsForStats = statsQuery.data?.data || [];

    // 4. Bugungi kunni avtomatik tanlash
    useEffect(() => {
        if (!dayFilter) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            setDayFilter(days[new Date().getDay()]);
        }
    }, [dayFilter]);

    // 5. URLni filterlarga mos yangilash
    useEffect(() => {
        const params = new URLSearchParams();
        if (dayFilter) params.set('day', dayFilter);
        if (selectedLessonNames.length) params.set('lessonNames', selectedLessonNames.join(','));
        setSearchParams(params, { replace: true });
    }, [dayFilter, selectedLessonNames, setSearchParams]);

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
        allLessonsForStats.forEach((l: any) => {
            const d = l?.weekDays || l?.weekday || l?.day;
            if (d) counts[d] = (counts[d] || 0) + 1;
        });
        return counts;
    }, [allLessonsForStats]);

    // 7. Darslarni saralash va formatlash
    const lessonsForSelectedDay = useMemo(() => {
        return (scheduleData?.data || [])
            .filter((l: any) => {
                if (selectedLessonNames.length) {
                    return selectedLessonNames.includes(l?.lessonName);
                }
                return true;
            })
            .sort((a: any, b: any) => Number(a.startTime) - Number(b.startTime));
    }, [scheduleData?.data, selectedLessonNames]);

    const formatTime = (time: any) => {
        const date = new Date(Number(time) < 1e12 ? Number(time) * 1000 : Number(time));
        return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const handleBook = (lesson: any) => {
        if (!studentId) return message.error('Student topilmadi');

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
                {/* Header & Filter */}
                <div className="bg-white rounded-2xl shadow-sm border p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={20} className="text-green-600" />
                        <h1 className="text-lg font-bold text-gray-900">Darslar jadvali</h1>
                    </div>

                    <Select
                        mode="multiple"
                        placeholder="Darsni tanlang"
                        className="w-full mb-4"
                        value={selectedLessonNames}
                        onChange={setSelectedLessonNames}
                        options={Array.from(new Set(allLessonsForStats.map((l: any) => l.lessonName))).map(n => ({ label: n, value: n }))}
                    />

                    {/* Kunlar filtri */}
                    <div className="grid grid-cols-4 gap-2">
                        {rollingWeek.map(({ day, dateStr }) => {
                            const count = weekdayCounts[day] || 0;
                            const active = dayFilter === day;
                            return (
                                <button
                                    key={day}
                                    disabled={count === 0}
                                    onClick={() => { setDayFilter(day); setSelectedLesson(null); }}
                                    className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center transition-all border
                                        ${active ? 'bg-green-600 text-white border-green-600 shadow-md' :
                                            count === 0 ? 'bg-gray-50 text-gray-300 border-gray-100' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    <span>{day.slice(0, 3)}</span>
                                    <span className="text-[10px] opacity-70">{dateStr}</span>
                                    {count > 0 && !active && <span className="mt-1 px-1.5 bg-green-100 text-green-700 rounded-full text-[9px]">{count}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Darslar ro'yxati */}
                    <div className="mt-6 space-y-2">
                        {isPending ? <PageLoader /> : lessonsForSelectedDay.map((l: any) => (
                            <button
                                key={l.id}
                                onClick={() => setSelectedLesson(l)}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedLesson?.id === l.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-800">{l.lessonName}</span>
                                    <span className="text-xs font-semibold text-gray-500">{formatTime(l.startTime)} - {formatTime(l.finishTime || l.endTime)}</span>
                                </div>
                                <div className="text-xs text-amber-600 font-bold mt-1">{Number(l.price).toLocaleString()} UZS</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tanlangan dars confirm */}
                {selectedLesson && (
                    <div className="bg-white p-4 rounded-2xl shadow-lg border-t-4 border-green-500 flex justify-between items-center animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <div className="text-sm font-bold">{selectedLesson.lessonName}</div>
                            <div className="text-xs text-gray-500">{formatTime(selectedLesson.startTime)}</div>
                        </div>
                        <Button type="primary" className="bg-green-600" shape="round" onClick={() => handleBook(selectedLesson)}>
                            Band qilish
                        </Button>
                    </div>
                )}
            </div>
            <TelegramStudentBottomNav studentId={studentId} />
        </div>
    );
};