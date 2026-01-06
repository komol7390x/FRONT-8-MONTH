import React, { useMemo, useState } from 'react';
import { Card, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search } from 'lucide-react';
import { useTeacherLessons, type TeacherLessonTemplate } from '../service/useTeacherLessons';
import { PageLoader } from '../../../../components/page-loader';

export const TeacherLessonsPage: React.FC = () => {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | undefined>('available');
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

    const dataSource = (query.data?.data || []).map((row: any, idx: number) => ({
        key: row?.id ?? idx,
        ...row,
    }));

    const total = query.data?.meta?.totalItems ?? dataSource.length;

    const columns: ColumnsType<TeacherLessonTemplate> = useMemo(
        () => [
            { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
            { title: 'Lesson', dataIndex: 'lessonName', key: 'lessonName', render: (v) => String(v ?? '-') },
            { title: 'Weekday', dataIndex: 'weekday', key: 'weekday', width: 120, render: (v) => String(v ?? '-') },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (v) => {
                    const s = String(v || '').toLowerCase();
                    const color = s.includes('available') ? 'green' : s.includes('pending') ? 'gold' : 'default';
                    return <Tag className="m-0" color={color as any}>{String(v ?? '-')}</Tag>;
                },
            },
            {
                title: 'Paid',
                dataIndex: 'isPaid',
                key: 'isPaid',
                width: 100,
                render: (v) => (
                    <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium text-white min-w-22 text-center ${v ? 'bg-green-600' : 'bg-red-600'}`}>
                        {v ? 'Yes' : 'No'}
                    </span>
                ),
            },
            {
                title: 'Price',
                dataIndex: 'lessonPrice',
                key: 'lessonPrice',
                width: 140,
                render: (v) => <Tag className="m-0" color="gold">{v ?? '-'}</Tag>,
            },
        ],
        [],
    );

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
                                { value: 'available', label: 'available' },
                                { value: 'busy', label: 'busy' },
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
                    <Table
                        columns={columns}
                        dataSource={dataSource as any}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total,
                            onChange: (p, ps) => {
                                setPage(p);
                                setLimit(ps);
                            },
                        }}
                        bordered
                        size="middle"
                    />
                </Card>
            </div>
        </div>
    );
};
