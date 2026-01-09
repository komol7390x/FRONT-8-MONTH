import React, { useState, useMemo, useEffect } from 'react';
import { CalendarClock, Loader2, Plus, Search, User } from 'lucide-react';
import { Table, Tag, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTeacherSchedule } from '../teacher/service/useTeacherSchedule';
import { Pagination } from '../admin/components/pagantion';
import { ScheduleCreateModal } from './components/schedule-create-modal';
import { TeacherMoreModal } from '../teacher/components/teacher-more-modal';
import { useGetTeacherById } from '../teacher/service/useGetTeacherById';

export const SchedulePage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [activeFilter, setActiveFilter] = useState<string>('true');
    const [dayFilter, setDayFilter] = useState<string>('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const rollingWeek = useMemo(() => {
        const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayIdx = new Date().getDay();
        const res: Array<{ day: string; dateStr: string }> = [];
        for (let i = 0; i < 7; i++) {
            const idx = (todayIdx + i) % 7;
            const day = order[idx];
            const d = new Date();
            d.setDate(d.getDate() + i);
            res.push({
                day,
                dateStr: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            });
        }
        return res;
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 700);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        if (dayFilter) return;
        const today = rollingWeek[0]?.day;
        if (today) setDayFilter(today);
    }, [dayFilter, rollingWeek]);

    // Fetch stats for all schedule items
    const statsQuery = useTeacherSchedule({
        limit: 1000,
        active: true,
    });

    // Schedule Data
    const { data, isPending, isError, error, refetch } = useTeacherSchedule({
        page,
        limit,
        active: activeFilter === '' ? undefined : activeFilter === 'true',
        day: dayFilter || undefined,
        search: search || undefined,
    });

    const scheduleList = data?.data || [];
    const meta = data?.meta;
    const totalPages = meta?.totalPages || 1;
    const totalCount = meta?.totalItems || scheduleList.length;

    // Calculate day counts
    const dayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        if (statsQuery.data?.data) {
            statsQuery.data.data.forEach((item: any) => {
                const d = item.weekDays || item.day;
                if (d) counts[d] = (counts[d] || 0) + 1;
            });
        }
        return counts;
    }, [statsQuery.data]);

    // Create Schedule State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createTeacherId, setCreateTeacherId] = useState<number>(0);

    // Teacher Data for creation (certificates)
    const createTeacherQuery = useGetTeacherById(createTeacherId || undefined);
    const createTeacherCertificates = (createTeacherQuery.data as any)?.certificates || [];

    // View Teacher Details State
    const [viewTeacher, setViewTeacher] = useState<any | null>(null);
    const [teacherModalOpen, setTeacherModalOpen] = useState(false);

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const columns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id) => <span className="text-gray-500 font-medium">#{id}</span>,
        },
        {
            title: 'Teacher',
            key: 'teacher',
            render: (_, record) => {
                let avatarSrc = undefined;
                if (record.teacher?.imageUrl) {
                    try {
                        const parsed = typeof record.teacher.imageUrl === 'string'
                            ? JSON.parse(record.teacher.imageUrl)
                            : record.teacher.imageUrl;
                        avatarSrc = parsed?.value || parsed || record.teacher.imageUrl;
                    } catch {
                        // If not valid JSON, use as is
                        avatarSrc = record.teacher.imageUrl;
                    }
                }
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={avatarSrc}
                            icon={<User size={16} />}
                            className="bg-blue-100 text-blue-600"
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{record.teacher?.fullname || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">ID: {record.teacherId}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Lesson Name',
            dataIndex: 'lessonName',
            key: 'lessonName',
            render: (name) => <span className="font-medium text-gray-800">{name}</span>,
        },
        {
            title: 'Day',
            dataIndex: 'weekDays',
            key: 'weekDays',
            render: (day) => (
                <Tag color="blue" className="font-semibold px-2 py-1 text-sm rounded-md uppercase">
                    {day}
                </Tag>
            ),
        },
        {
            title: 'Time',
            key: 'time',
            render: (_, record) => (
                <div className="flex items-center gap-2 text-gray-700 font-medium bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 w-fit">
                    <span>{formatTime(record.startTime)}</span>
                    <span className="text-gray-400">-</span>
                    <span>{formatTime(record.endTime)}</span>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className="text-gray-700 font-medium">{Number(price).toLocaleString()} UZS</span>,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'} className="font-semibold">
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarClock size={24} className="text-blue-700" />
                        <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
                    </div>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        onClick={() => {
                            setCreateTeacherId(0);
                            setIsCreateOpen(true);
                        }}
                    >
                        <Plus size={18} />
                        Add Schedule
                    </button>
                </div>

                {/* Week Day Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {rollingWeek.map(({ day, dateStr }) => {
                        const count = dayCounts[day] || 0;
                        const isActiveDay = count > 0;

                        return (
                            <button
                                key={day}
                                onClick={() => {
                                    if (isActiveDay) {
                                        setDayFilter(day);
                                        setPage(1);
                                    }
                                }}
                                disabled={!isActiveDay}
                                className={`py-3 px-2 rounded-xl text-sm font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-1
                                    ${dayFilter === day
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 transform scale-105'
                                        : isActiveDay
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                            : 'bg-white text-gray-400 border border-gray-200 opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                <span>{day.slice(0, 3)}</span>
                                <span className="text-xs font-normal opacity-80">{dateStr}</span>
                                {isActiveDay && (
                                    <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs leading-none">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value);
                                }}
                                placeholder="Search schedule..."
                                className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm shadow-sm transition-all"
                            />
                        </div>

                        <select
                            value={activeFilter}
                            onChange={(e) => {
                                setActiveFilter(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {isPending ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : isError ? (
                        <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
                            Error loading schedule: {(error as any)?.message}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table
                                columns={columns}
                                dataSource={scheduleList}
                                rowKey="id"
                                pagination={false}
                                className="rounded-lg overflow-hidden"
                                rowClassName="cursor-pointer hover:bg-blue-50 transition-colors"
                                onRow={(record) => ({
                                    onClick: () => {
                                        if (record.teacher) {
                                            setViewTeacher(record.teacher);
                                            setTeacherModalOpen(true);
                                        }
                                    }
                                })}
                            />
                        </div>
                    )}

                    {!!totalPages && (
                        <div className="pt-4 border-t border-gray-100">
                            <Pagination
                                page={page}
                                limit={limit}
                                totalPages={totalPages}
                                totalCount={totalCount}
                                admins={scheduleList as any}
                                setPage={setPage}
                                handleLimitChange={handleLimitChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ScheduleCreateModal
                open={isCreateOpen}
                teacherId={createTeacherId}
                showTeacherIdInput={true}
                certificates={createTeacherCertificates}
                onTeacherIdChange={setCreateTeacherId}
                onClose={() => setIsCreateOpen(false)}
                onCreated={() => {
                    refetch();
                }}
            />

            {viewTeacher && (
                <TeacherMoreModal
                    open={teacherModalOpen}
                    teacher={viewTeacher}
                    onClose={() => {
                        setTeacherModalOpen(false);
                        setViewTeacher(null);
                    }}
                    onEdit={() => { }}
                    onRefetch={() => refetch()}
                    focusTab="schedule"
                />
            )}
        </div>
    );
};
