import React, { useMemo, useState } from 'react';
import { Button, Modal, message } from 'antd';
import { CalendarDays, Clock, ArrowLeft, CheckCircle2, User, Info, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBookLesson } from './service/useBookLesson';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentBookConfirmPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 1. Ma'lumotlarni markazlashgan holda olish
    const studentId = Number(searchParams.get('studentId')) || Number(localStorage.getItem('telegram_student_id')) || 0;
    const lessonId = Number(searchParams.get('lessonId')) || 0;
    const lessonName = searchParams.get('lessonName') || 'Dars';
    const teacherId = searchParams.get('teacherId') || '';
    const startMs = Number(searchParams.get('startTime')) || 0;
    const endMs = Number(searchParams.get('endTime')) || 0;

    const toHHMM = (ms: number) => {
        if (!ms) return '';
        return new Date(ms).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const [startTimeStr, setStartTimeStr] = useState(toHHMM(startMs));
    const [endTimeStr, setEndTimeStr] = useState(toHHMM(endMs));

    const { mutate: bookLesson, isPending } = useBookLesson();

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
                    title: <span className="font-black">Muvaffaqiyatli!</span>,
                    icon: <CheckCircle2 className="text-emerald-500" size={32} />,
                    content: (
                        <div className="mt-4 space-y-4">
                            <p className="text-gray-600 font-medium">Darsingiz jadvalga muvaffaqiyatli qo'shildi.</p>
                            {meetLink && (
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Dars havolasi:</span>
                                    <a href={meetLink} target="_blank" rel="noreferrer" className="block text-indigo-600 truncate text-sm font-bold">
                                        {meetLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    ),
                    okText: "Darslarimga o'tish",
                    okButtonProps: { className: 'bg-indigo-600 rounded-xl h-11 font-bold' },
                    onOk: () => navigate('/telegram/student-lessons')
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28 font-sans">
            {/* Minimal Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                        <ArrowLeft size={22} className="text-gray-900" />
                    </button>
                    <h1 className="text-lg font-black text-gray-900 tracking-tight text-center">Tasdiqlash</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-md mx-auto p-5 space-y-6">
                {/* Visual Ticket Card */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 p-8 text-white relative">
                        {/* Decorative Circle */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

                        <div className="flex items-center gap-2 opacity-80 mb-2">
                            <CalendarDays size={16} />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{formattedDate}</span>
                        </div>
                        <h2 className="text-3xl font-black leading-tight tracking-tighter">{lessonName}</h2>
                    </div>

                    <div className="p-8 space-y-8 relative">
                        {/* Teacher Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <User size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">O'qituvchi</p>
                                <p className="text-base font-black text-gray-800">ID: {teacherId || 'Tayinlangan'}</p>
                            </div>
                        </div>

                        {/* Time Selectors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1 block">Boshlanishi</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="time"
                                        value={startTimeStr}
                                        onChange={(e) => setStartTimeStr(e.target.value)}
                                        className="w-full h-14 pl-11 pr-3 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:border-indigo-600 transition-all outline-none text-base font-black tabular-nums"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1 block">Tugashi</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="time"
                                        value={endTimeStr}
                                        onChange={(e) => setEndTimeStr(e.target.value)}
                                        className="w-full h-14 pl-11 pr-3 border-2 border-gray-50 rounded-2xl bg-gray-50 focus:bg-white focus:border-indigo-600 transition-all outline-none text-base font-black tabular-nums"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-3xl border border-amber-100/50">
                            <Info size={18} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                                Diqqat: Tanlangan vaqt o'qituvchi tomonidan belgilangan bo'sh oraliqda bo'lishi shart. Aks holda dars bekor qilinishi mumkin.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        type="primary"
                        loading={isPending}
                        onClick={handleConfirm}
                        className="h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 border-none text-base font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                    >
                        <ShieldCheck size={20} />
                        Band qilishni tasdiqlash
                    </Button>
                    <button
                        onClick={() => navigate(-1)}
                        className="h-14 rounded-3xl text-gray-400 font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                    >
                        Ortga qaytish
                    </button>
                </div>
            </div>

            <TelegramStudentBottomNav studentId={studentId || undefined} />
        </div>
    );
};