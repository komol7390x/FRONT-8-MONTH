import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, message } from 'antd';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useStudentSchedule } from './service/useStudentSchedule';
import { useBookLesson } from './service/useBookLesson';
import { Pagination } from '../admin/super-admin/admin/components/pagantion';
import { PageLoader } from '../../components/page-loader';
import { WeekDays } from '../../config/weekdays';

// enum WeekDays {
//     Monday = 'Monday',
//     Tuesday = 'Tuesday',
//     Wednesday = 'Wednesday',
//     Thursday = 'Thursday',
//     Friday = 'Friday',
//     Saturday = 'Saturday',
//     Sunday = 'Sunday',
// }

export const StudentSchedulePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read initial params from URL
    const initialTeacherId = Number(searchParams.get('teacherId')) || undefined;
    const initialDay = searchParams.get('day') || '';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialLimit = Number(searchParams.get('limit')) || 10;
    const initialSearch = searchParams.get('search') || '';

    const [dayFilter, setDayFilter] = useState<string>(initialDay);
    const [page, setPage] = useState<number>(initialPage);
    const [teacherId, setTeacherId] = useState<number | undefined>(initialTeacherId);
    
    // For now, hardcode studentId or get from somewhere. 
    // In a real Telegram Web App, this would come from initData.
    // The user example had 21.
    const studentId = 21; 

    const { mutate: bookLesson, isPending: isBooking } = useBookLesson();

    const { data: scheduleData, isPending } = useStudentSchedule({
        teacherId,
        active: true,
        search: initialSearch,
        page,
        limit: initialLimit,
        day: dayFilter || undefined,
    });

    // Update URL when filters change
    useEffect(() => {
        const params: any = {};
        if (teacherId) params.teacherId = String(teacherId);
        if (dayFilter) params.day = dayFilter;
        if (page > 1) params.page = String(page);
        if (initialLimit !== 10) params.limit = String(initialLimit);
        if (initialSearch) params.search = initialSearch;
        params.active = 'true';
        
        setSearchParams(params);
    }, [teacherId, dayFilter, page, initialLimit, initialSearch, setSearchParams]);

    const getCurrentWeekDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const currentDayIndex = now.getDay(); // 0-6
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

    const handleBook = (lessonId: number) => {
        bookLesson({ studentId, lessonId });
    };

    if (isPending && !scheduleData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
            <div className="max-w-md mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={20} className="text-blue-600" />
                        <h1 className="text-lg font-bold text-gray-900">Available Lessons</h1>
                    </div>

                    {/* Day Filters */}
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
                         // Adapting to potentially different response structure
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
                                        onClick={() => handleBook(lesson.id)}
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

                {scheduleData?.meta && (
                     <div className="flex justify-center pb-6">
                         <Pagination
                             meta={scheduleData.meta}
                             onPageChange={setPage}
                         />
                     </div>
                )}
            </div>
        </div>
    );
};
