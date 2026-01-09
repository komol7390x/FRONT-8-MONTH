import React, { useEffect, useMemo, useState } from 'react';
import { Button, message } from 'antd';
import { CalendarDays, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBookLesson } from './service/useBookLesson';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentBookConfirmPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const studentId = Number(searchParams.get('studentId')) || 0;
    const lessonId = Number(searchParams.get('lessonId')) || 0;
    const lessonName = searchParams.get('lessonName') || 'Lesson';
    const teacherId = searchParams.get('teacherId') || '';

    const startMs = Number(searchParams.get('startTime')) || 0;
    const endMs = Number(searchParams.get('endTime')) || 0;

    const initialStart = useMemo(() => {
        if (!startMs) return '';
        const d = new Date(startMs);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }, [startMs]);

    const initialEnd = useMemo(() => {
        if (!endMs) return '';
        const d = new Date(endMs);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }, [endMs]);

    const [startTimeStr, setStartTimeStr] = useState<string>(initialStart);
    const [endTimeStr, setEndTimeStr] = useState<string>(initialEnd);

    useEffect(() => {
        setStartTimeStr(initialStart);
    }, [initialStart]);

    useEffect(() => {
        setEndTimeStr(initialEnd);
    }, [initialEnd]);

    const { mutate: bookLesson, isPending } = useBookLesson();

    const timeText = useMemo(() => {
        if (!startMs || !endMs) return '-';
        const st = new Date(startMs);
        const et = new Date(endMs);
        const day = st.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const stTime = st.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        const etTime = et.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        return `${day} • ${stTime} - ${etTime}`;
    }, [startMs, endMs]);

    const minTime = useMemo(() => {
        if (!startMs) return '';
        const d = new Date(startMs);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }, [startMs]);

    const maxTime = useMemo(() => {
        if (!endMs) return '';
        const d = new Date(endMs);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }, [endMs]);

    const buildMsFromTime = (baseMs: number, hhmm: string): number | null => {
        if (!baseMs) return null;
        const [hhRaw, mmRaw] = hhmm.split(':');
        const hh = Number(hhRaw);
        const mm = Number(mmRaw);
        if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
        const d = new Date(baseMs);
        d.setHours(hh, mm, 0, 0);
        return d.getTime();
    };

    const handleConfirm = () => {
        if (!studentId || !lessonId || !startMs || !endMs) {
            message.error('Booking data is missing');
            return;
        }
        if (endMs <= startMs) {
            message.error('Lesson time range is invalid');
            return;
        }

        const selectedStartMs = buildMsFromTime(startMs, startTimeStr);
        const selectedEndMs = buildMsFromTime(startMs, endTimeStr);

        if (!selectedStartMs || !selectedEndMs) {
            message.error('Please select start and end time');
            return;
        }

        if (selectedStartMs < startMs || selectedEndMs > endMs) {
            message.error('Selected time must be within allowed interval');
            return;
        }

        if (selectedEndMs <= selectedStartMs) {
            message.error('End time must be after start time');
            return;
        }

        const startTimeSeconds = Math.floor(selectedStartMs / 1000);
        const finishTimeSeconds = Math.floor(selectedEndMs / 1000);

        bookLesson(
            {
                studentId,
                lessonId,
                startTime: startTimeSeconds,
                finishTime: finishTimeSeconds,
                showMeetLinkModal: false,
                closeWebAppOnSuccess: true,
            },
            {
                onSuccess: () => {
                    if ((window as any).Telegram?.WebApp) {
                        (window as any).Telegram.WebApp.close();
                        return;
                    }
                    navigate('/telegram/student-schedule');
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={18} className="text-green-600" />
                        <div className="text-base font-bold text-gray-900">Booking confirmation</div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="text-sm font-semibold text-gray-900">{lessonName}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock size={14} className="text-gray-500" />
                            <span>{timeText}</span>
                        </div>
                        <div className="text-xs text-gray-500">Teacher ID: {teacherId || '-'}</div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Start time</div>
                            <input
                                type="time"
                                value={startTimeStr}
                                min={minTime}
                                max={maxTime}
                                onChange={(e) => setStartTimeStr(e.target.value)}
                                className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-200 text-sm shadow-sm"
                            />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">End time</div>
                            <input
                                type="time"
                                value={endTimeStr}
                                min={minTime}
                                max={maxTime}
                                onChange={(e) => setEndTimeStr(e.target.value)}
                                className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-200 text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                        <Button
                            className="w-full"
                            onClick={() => navigate(-1)}
                            disabled={isPending}
                        >
                            Back
                        </Button>
                        <Button
                            type="primary"
                            className="w-full bg-green-600"
                            loading={isPending}
                            onClick={handleConfirm}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>

            <TelegramStudentBottomNav studentId={studentId || undefined} />
        </div>
    );
};
