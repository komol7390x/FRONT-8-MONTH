import React, { useMemo, useState } from 'react';
import { Card, Select, Tag } from 'antd';
import { CalendarDays, CheckCircle2, Hash, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeacherLessons, type TeacherLessonTemplate } from '../service/useTeacherLessons';
import { PageLoader } from '../../../../components/page-loader';
import { Pagination } from '../components/pagination';
import { WeekDays } from '../../../../config/weekdays';

const BookedLesson = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
} as const;

export const TeacherLessonsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [weekday, setWeekday] = useState<string | undefined>(undefined);
    const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const query = useTeacherLessons({
        status,
        weekday,
        isPaid,
        search,
        page,
        limit,
    });

    const weekdayStatsQuery = useTeacherLessons({
        status,
        weekday: undefined,
        isPaid,
        search,
        page: 1,
        limit: 1000,
    });

    const dataSource = (query.data?.data || []).map((row: any, idx: number) => {
        const normalizedWeekday = (row as any)?.weekday ?? (row as any)?.weekDays ?? (row as any)?.weekDay;
        const normalizedStatus = (row as any)?.status ?? (row as any)?.lessonStatus;
        const normalizedIsPaid = (row as any)?.isPaid ?? (row as any)?.isPaidToTeacher ?? (row as any)?.isPaidToTeacher;
        const normalizedPrice = (row as any)?.lessonPrice ?? (row as any)?.price;
        return {
            key: row?.id ?? idx,
            ...row,
            weekday: normalizedWeekday,
            status: normalizedStatus,
            isPaid: normalizedIsPaid,
            lessonPrice: normalizedPrice,
        };
    });

    const total = query.data?.meta?.totalItems ?? dataSource.length;
    const totalPages = query.data?.meta?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0);

    const weekdaySlots = useMemo(() => {
        const months = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK'];
        const dayNames: Array<{ key: (typeof WeekDays)[keyof typeof WeekDays]; short: string }> = [
            { key: WeekDays.SUNDAY, short: 'Yak' },
            { key: WeekDays.MONDAY, short: 'Dush' },
            { key: WeekDays.TUESDAY, short: 'Sesh' },
            { key: WeekDays.WEDNESDAY, short: 'Chor' },
            { key: WeekDays.THURSDAY, short: 'Pay' },
            { key: WeekDays.FRIDAY, short: 'Jum' },
            { key: WeekDays.SATURDAY, short: 'Shan' },
        ];

        const base = new Date();
        base.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(base);
            d.setDate(d.getDate() + i);
            const dd = String(d.getDate()).padStart(2, '0');
            const dateLabel = `${dd}-${months[d.getMonth()]}`;
            const day = dayNames[d.getDay()];
            return { weekday: day.key, short: day.short, dateLabel };
        });
    }, []);

    const weekdayStats = useMemo(() => {
        const rows = (weekdayStatsQuery.data?.data || []) as any[];
        const map = new Map<string, { count: number; hasBooked: boolean }>();

        for (const s of Object.values(WeekDays)) {
            map.set(String(s), { count: 0, hasBooked: false });
        }

        for (const r of rows) {
            const wd = String(r?.weekday ?? r?.weekDays ?? r?.weekDay ?? '').trim();
            if (!wd) continue;
            const item = map.get(wd) || { count: 0, hasBooked: false };
            const statusValue = String(r?.status ?? '').toLowerCase();
            map.set(wd, {
                count: item.count + 1,
                hasBooked: item.hasBooked || statusValue === 'booked',
            });
        }

        return map;
    }, [weekdayStatsQuery.data?.data]);

    if (query.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={18} className="text-blue-700" />
                            <div className="text-sm font-semibold text-gray-900">Next 7 days</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setWeekday(undefined);
                                    setPage(1);
                                }}
                                className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                                Clear weekday
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/teacher-panel/create-lesson')}
                                className="h-10 px-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm"
                            >
                                Add lesson
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {weekdaySlots.map((s) => {
                            const st = weekdayStats.get(String(s.weekday)) || { count: 0, hasBooked: false };
                            const disabled = st.count <= 0;
                            const selected = weekday === s.weekday;
                            const bg = st.hasBooked ? 'from-green-600 to-emerald-600' : 'from-blue-600 to-indigo-600';
                            const border = selected ? 'ring-2 ring-offset-1 ring-cyan-300' : 'ring-0';
                            return (
                                <button
                                    key={`${s.weekday}-${s.dateLabel}`}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        setWeekday(s.weekday);
                                        setPage(1);
                                    }}
                                    className={`h-14 rounded-xl px-3 text-left text-white shadow-sm transition-colors ${disabled
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : `bg-linear-to-r ${bg} hover:opacity-95`
                                        } ${border}`}
                                >
                                    <div className={`flex items-center justify-between ${disabled ? 'text-gray-600' : ''}`}>
                                        <div className="text-sm font-bold">{s.short}</div>
                                        <div className={`text-xs font-bold px-2 py-0.5 rounded ${disabled ? 'bg-gray-300 text-gray-700' : 'bg-white/15 text-white'}`}>
                                            {st.count}
                                        </div>
                                    </div>
                                    <div className={`text-[11px] font-semibold ${disabled ? 'text-gray-600' : 'text-white/90'}`}>{s.dateLabel}</div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearch(searchInput);
                                        setPage(1);
                                    }
                                }}
                                className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch(searchInput);
                                    setPage(1);
                                }}
                                className="h-11 px-5 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <Search size={16} />
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput('');
                                    setSearch('');
                                    setStatus(undefined);
                                    setWeekday(undefined);
                                    setIsPaid(undefined);
                                    setPage(1);
                                    setLimit(10);
                                }}
                                className="h-11 px-5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <Select
                            allowClear
                            value={status || undefined}
                            onChange={(v) => {
                                setStatus((v as any) ?? undefined);
                                setPage(1);
                            }}
                            placeholder="Status"
                            style={{ width: '100%' }}
                            options={[
                                { value: BookedLesson.AVAILABLE, label: BookedLesson.AVAILABLE },
                                { value: BookedLesson.BOOKED, label: BookedLesson.BOOKED },
                                { value: BookedLesson.COMPLETED, label: BookedLesson.COMPLETED },
                                { value: BookedLesson.CANCELLED, label: BookedLesson.CANCELLED },
                                { value: BookedLesson.EXPIRED, label: BookedLesson.EXPIRED },
                            ]}
                        />
                        <Select
                            allowClear
                            value={weekday || undefined}
                            onChange={(v) => {
                                setWeekday((v as any) ?? undefined);
                                setPage(1);
                            }}
                            placeholder="Weekday"
                            style={{ width: '100%' }}
                            options={[
                                { value: 'Monday', label: 'Monday' },
                                { value: 'Tuesday', label: 'Tuesday' },
                                { value: 'Wednesday', label: 'Wednesday' },
                                { value: 'Thursday', label: 'Thursday' },
                                { value: 'Friday', label: 'Friday' },
                                { value: 'Saturday', label: 'Saturday' },
                                { value: 'Sunday', label: 'Sunday' },
                            ]}
                        />
                        <Select
                            allowClear
                            value={isPaid === undefined ? undefined : isPaid ? 'true' : 'false'}
                            onChange={(v) => {
                                setIsPaid(v == null ? undefined : v === 'true');
                                setPage(1);
                            }}
                            placeholder="Is Paid"
                            style={{ width: '100%' }}
                            options={[
                                { value: 'true', label: 'true' },
                                { value: 'false', label: 'false' },
                            ]}
                        />
                    </div>
                </div>

                <Card>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="grid grid-cols-4 sm:grid-cols-8 px-3 sm:px-4 bg-gray-50 py-3 sm:py-4 border-b border-gray-200 font-semibold text-sm text-gray-700">
                            <div className="col-span-1 pr-3 sm:pr-5 flex items-center gap-2"><Hash size={14} /> №</div>
                            <div className="hidden sm:flex col-span-1 pr-5 items-center gap-2"><Hash size={14} /> ID</div>
                            <div className="col-span-2 sm:col-span-2 pr-3 sm:pr-5 flex items-center gap-2">Lesson</div>
                            <div className="col-span-1 pr-3 sm:pr-5">Weekday</div>
                            <div className="hidden sm:flex col-span-1 pr-5 items-center gap-2"><CheckCircle2 size={14} /> Status</div>
                            <div className="hidden sm:block col-span-1 pr-5">Paid</div>
                            <div className="hidden sm:block col-span-1 pr-5">Price</div>
                            <div className="col-span-1 text-right">Info</div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-[900px]">

                                {dataSource.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">No lessons found</div>
                                ) : (
                                    (dataSource as any[]).map((t: TeacherLessonTemplate, idx: number) => {
                                        const wd = String((t as any)?.weekday ?? '-');
                                        const st = String((t as any)?.status ?? '').toLowerCase();
                                        const statusColor = st === 'booked' ? 'green' : st === 'available' ? 'blue' : st ? 'gold' : 'default';
                                        const paid = Boolean((t as any)?.isPaid);
                                        const rowBg = st === 'booked' ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50';
                                        return (
                                            <div
                                                key={(t as any)?.id ?? idx}
                                                className={`grid grid-cols-8 px-3 sm:px-4 py-3 sm:py-4 border-b items-center transition-colors ${rowBg}`}
                                            >
                                                <div className="col-span-1 pr-3 sm:pr-5">
                                                    <span className="text-sm font-semibold text-gray-700">{(page - 1) * limit + idx + 1}</span>
                                                </div>

                                                <div className="col-span-1 pr-5">
                                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{(t as any)?.id ?? '-'}</span>
                                                </div>

                                                <div className="col-span-2 pr-3 sm:pr-5 min-w-0">
                                                    <div className="leading-tight min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{String((t as any)?.lessonName ?? '-')}</p>
                                                        <p className="text-xs text-gray-500 truncate">{String((t as any)?.meetLink ?? '')}</p>
                                                    </div>
                                                </div>

                                                <div className="col-span-1 pr-3 sm:pr-5">
                                                    <span className="text-sm font-semibold text-gray-700">{wd}</span>
                                                </div>

                                                <div className="col-span-1 pr-5">
                                                    <Tag className="m-0" color={statusColor as any}>{String((t as any)?.status ?? '-')}</Tag>
                                                </div>

                                                <div className="col-span-1 pr-5">
                                                    <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium text-white min-w-22 text-center ${paid ? 'bg-green-600' : 'bg-red-600'}`}>
                                                        {paid ? 'Yes' : 'No'}
                                                    </span>
                                                </div>

                                                <div className="col-span-1 pr-5">
                                                    <Tag className="m-0" color="gold">{(t as any)?.lessonPrice ?? '-'}</Tag>
                                                </div>

                                                <div className="col-span-1 text-right">
                                                    <div className="text-xs text-gray-600">{String((t as any)?.startTime ?? '')}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <Pagination
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalCount={total}
                    items={dataSource as any}
                    setPage={setPage}
                    handleLimitChange={(newLimit) => {
                        setLimit(Number(newLimit));
                        setPage(1);
                    }}
                />
            </div>
        </div>
    );
};
