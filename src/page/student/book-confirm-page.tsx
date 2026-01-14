import React, { useMemo, useState } from 'react';
import { Button, Modal, message, Card } from 'antd';
import { CalendarDays, Clock, ArrowLeft, CheckCircle2, User, Info } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBookLesson } from './service/useBookLesson';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentBookConfirmPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 1. Ma'lumotlarni olish
    const studentId = Number(searchParams.get('studentId')) || Number(localStorage.getItem('telegram_student_id')) || 0;
    const lessonId = Number(searchParams.get('lessonId')) || 0;
    const lessonName = searchParams.get('lessonName') || 'Dars';
    const teacherId = searchParams.get('teacherId') || '';
    const startMs = Number(searchParams.get('startTime')) || 0;
    const endMs = Number(searchParams.get('endTime')) || 0;

    // 2. Vaqt formatlash funksiyasi
    const toHHMM = (ms: number) => {
        if (!ms) return '';
        return new Date(ms).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const [startTimeStr, setStartTimeStr] = useState(toHHMM(startMs));
    const [endTimeStr, setEndTimeStr] = useState(toHHMM(endMs));

    const { mutate: bookLesson, isPending } = useBookLesson();

    // 3. Vizual vaqt matni
    const formattedDate = useMemo(() => {
        if (!startMs) return '';
        return new Date(startMs).toLocaleDateString('uz-UZ', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }, [startMs]);

    const handleConfirm = () => {
        const buildMs = (base: number, timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            const d = new Date(base);
            d.setHours(h, m, 0, 0);
            return d.getTime();
        };

        const finalStart = buildMs(startMs, startTimeStr);
        const finalEnd = buildMs(startMs, endTimeStr);

        // Validatsiya
        if (finalStart < startMs || finalEnd > endMs || finalEnd <= finalStart) {
            message.error("Vaqt oralig'i noto'g'ri tanlandi");
            return;
        }

        bookLesson({
            studentId,
            lessonId,
            startTime: Math.floor(finalStart / 1000),
            finishTime: Math.floor(finalEnd / 1000),
        }, {
            onSuccess: (data: any) => {
                const meetLink = data?.data?.meetLink || data?.meetLink;
                Modal.success({
                    title: 'Muvaffaqiyatli band qilindi!',
                    icon: <CheckCircle2 className="text-green-500" />,
                    content: (
                        <div className="mt-2 space-y-3">
                            <p className="text-gray-600">Darsingiz jadvalga qo'shildi.</p>
                            {meetLink && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase">Dars havolasi:</span>
                                    <a href={meetLink} target="_blank" className="block text-blue-600 truncate text-xs font-medium">
                                        {meetLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    ),
                    okText: "Darslarimga o'tish",
                    onOk: () => navigate('/telegram/student-lessons')
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
                <div className="max-w-md mx-auto flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Tasdiqlash</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {/* Dars ma'lumotlari */}
                <Card className="rounded-3xl border-none shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                    <div className="bg-green-600 p-5 text-white">
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                            <CalendarDays size={14} />
                            <span className="text-xs font-medium uppercase tracking-wider">{formattedDate}</span>
                        </div>
                        <h2 className="text-xl font-black">{lessonName}</h2>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">O'qituvchi</p>
                                <p className="text-sm font-bold text-gray-700">ID: {teacherId || 'Tayinlangan'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Boshlanishi</label>
                                <div className="relative">
                                    <Clock size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="time"
                                        value={startTimeStr}
                                        onChange={(e) => setStartTimeStr(e.target.value)}
                                        className="w-full h-11 pl-9 pr-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Tugashi</label>
                                <div className="relative">
                                    <Clock size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="time"
                                        value={endTimeStr}
                                        onChange={(e) => setEndTimeStr(e.target.value)}
                                        className="w-full h-11 pl-9 pr-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <Info size={14} className="text-amber-600 mt-0.5" />
                            <p className="text-[10px] text-amber-700 leading-relaxed">
                                Tanlangan vaqt o'qituvchi tomonidan belgilangan oraliqda bo'lishi shart.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                    <Button
                        type="primary"
                        size="large"
                        loading={isPending}
                        onClick={handleConfirm}
                        className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 border-none text-base font-bold shadow-lg shadow-green-100"
                    >
                        Band qilishni tasdiqlash
                    </Button>
                    <Button
                        size="large"
                        onClick={() => navigate(-1)}
                        className="h-14 rounded-2xl border-none text-gray-500 font-bold bg-transparent"
                    >
                        Bekor qilish
                    </Button>
                </div>
            </div>

            <TelegramStudentBottomNav studentId={studentId || undefined} />
        </div>
    );
};