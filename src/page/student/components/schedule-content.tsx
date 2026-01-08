import React, { useState } from 'react';
import { Card, Tag, Button, Select, message } from 'antd';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';
import { useStudentSchedule } from '../service/useStudentSchedule';
import { useBookLesson } from '../service/useBookLesson';
import { PageLoader } from '../../../components/page-loader';
import { WeekDays } from '../../../config/weekdays';
import { useGetTeachers } from '../../../page/admin/super-admin/teacher/service/useGetTeachers';

interface StudentScheduleContentProps {
    studentId: number;
}

export const StudentScheduleContent: React.FC<StudentScheduleContentProps> = ({ studentId }) => {
    const [dayFilter, setDayFilter] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [teacherId, setTeacherId] = useState<number | undefined>(undefined);

    const { data: teachersData } = useGetTeachers({ page: 1, limit: 100, status: true });
    const teachers = teachersData?.data || [];

    const { mutate: bookLesson, isPending: isBooking } = useBookLesson();

    const { data: scheduleData, isPending } = useStudentSchedule({
        teacherId,
        active: true,
        search: '',
        page,
        limit: 10,
        day: dayFilter || undefined,
    });

    const getCurrentWeekDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const currentDayIndex = now.getDay();
        const targetDayIndex = days.indexOf(dayName);
        
        if (targetDayIndex === -1) return '';

        const diff = targetDayIndex - currentDayIndex;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + diff);

        return targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    };

    const formatTime = (ms: number | null): string => {
        if (!ms) return '-';
        const d = new Date(ms);
        return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const handleBook = (lesson: any) => {
        const startTime = Number(lesson.startTime);
        const finishTime = Number(lesson.finishTime);
        
        if (!startTime || !finishTime) {
            message.error('Lesson time information is missing');
            return;
        }
        
        const startTimeSeconds = Math.floor(startTime / 1000);
        const finishTimeSeconds = Math.floor(finishTime / 1000);
        
        bookLesson({ 
            studentId, 
            lessonId: lesson.id,
            startTime: startTimeSeconds,
            finishTime: finishTimeSeconds
        });
    };

    if (isPending && !scheduleData) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarDays size={20} className="text-blue-600" />
                    <h1 className="text-lg font-bold text-gray-900">Available Lessons</h1>
                </div>

                <div className="mb-4">
                    <Select
                        placeholder="Filter by Teacher"
                        allowClear
                        value={teacherId}
                        onChange={(value) => {
                            setTeacherId(value || undefined);
                            setPage(1);
                        }}
                        className="w-full"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={teachers.map((t: any) => ({
                            value: t.id,
                            label: `${t.fullname || 'Unknown'} (ID: ${t.id})`,
                        }))}
                    />
                </div>

                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                    {Object.values(WeekDays).map((day) => {
                        const dateStr = getCurrentWeekDate(day);
                        const isActive = dayFilter === day;

                        return (
                            <button
                                key={day}
                                onClick={() => {
                                    setDayFilter(day === dayFilter ? '' : day);
                                    setPage(1);
                                }}
                                className={`flex-shrink-0 py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 min-w-[60px]
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <span>{day.slice(0, 3)}</span>
                                <span className={`text-[10px] font-normal ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{dateStr}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3">
                {scheduleData?.data?.map((lesson: any) => {
                    const startMs = Number(lesson.startTime);
                    const finishMs = Number(lesson.finishTime);
                    const isBooked = lesson.status === 'booked';
                    
                    return (
                        <Card key={lesson.id} className="rounded-2xl shadow-sm border-gray-200 overflow-hidden" bodyStyle={{ padding: '16px' }}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">{lesson.lessonName}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Clock size={12} />
                                        <span>{formatTime(startMs)} - {formatTime(finishMs)}</span>
                                    </div>
                                </div>
                                <Tag color={isBooked ? 'red' : 'green'}>{lesson.status || 'Available'}</Tag>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-1 text-amber-600 font-bold">
                                    <DollarSign size={16} />
                                    <span>{Number(lesson.lessonPrice).toLocaleString()} UZS</span>
                                </div>
                                
                                <Button 
                                    type="primary" 
                                    shape="round" 
                                    size="small"
                                    disabled={isBooked || isBooking}
                                    onClick={() => handleBook(lesson)}
                                    className={isBooked ? '' : 'bg-blue-600'}
                                >
                                    {isBooked ? 'Booked' : 'Book Now'}
                                </Button>
                            </div>
                        </Card>
                    );
                })}

                {(!scheduleData?.data || scheduleData.data.length === 0) && (
                    <div className="text-center py-10 text-gray-500">
                        No lessons found for this filter.
                    </div>
                )}
            </div>

            {scheduleData?.meta && scheduleData.meta.totalPages && scheduleData.meta.totalPages > 1 && (
                <div className="flex justify-center pb-6 gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                        Page {page} of {scheduleData.meta.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(scheduleData.meta.totalPages || 1, page + 1))}
                        disabled={page >= (scheduleData.meta.totalPages || 1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
