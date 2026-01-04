import { Alert, Button, Card, Descriptions, Drawer, Input, InputNumber, Select, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Hash, Search, User, UserRound } from 'lucide-react';
import { Pagination } from '../admin/components/pagantion';
import { useLessonTemplates } from './service/useLessonTemplates';

export const LessonPage: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const [searchInput, setSearchInput] = useState<string>('1');
    const [search, setSearch] = useState<string>('1');

    const [status, setStatus] = useState<string | undefined>('available');
    const [weekday, setWeekday] = useState<string | undefined>('Tuesday');
    const [teacherId, setTeacherId] = useState<number | undefined>(1);
    const [studentId, setStudentId] = useState<number | undefined>(1);
    const [active, setActive] = useState<boolean | undefined>(true);

    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const query = useLessonTemplates({
        status,
        weekday,
        teacherId,
        studentId,
        active,
        search,
        page,
        limit,
    });

    const dataSource = (query.data?.data || []).map((row: any) => ({
        key: row?.id ?? `${row?.teacherId}-${row?.studentId}-${Math.random()}`,
        ...row,
    }));

    const totalCount = query.data?.meta?.totalItems || dataSource.length;
    const totalPages = query.data?.meta?.totalPages || 0;

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const columns: ColumnsType<any> = useMemo(
        () => [
            { title: <span className="inline-flex items-center gap-1"><Hash size={14} />ID</span>, dataIndex: 'id', key: 'id', width: 90 },
            { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
            { title: <span className="inline-flex items-center gap-1"><CalendarDays size={14} />Day</span>, dataIndex: 'weekDays', key: 'weekDays', width: 130 },
            { title: <span className="inline-flex items-center gap-1"><User size={14} />T</span>, dataIndex: 'teacherId', key: 'teacherId', width: 90 },
            { title: <span className="inline-flex items-center gap-1"><UserRound size={14} />S</span>, dataIndex: 'studentId', key: 'studentId', width: 90 },
            {
                title: <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} />Active</span>,
                dataIndex: 'active',
                key: 'active',
                width: 90,
                render: (v) => (
                    <Tag color={v ? 'green' : 'red'} className="m-0">
                        {v ? 'Active' : 'Inactive'}
                    </Tag>
                ),
            },
            { title: 'Name', dataIndex: 'lessonName', key: 'lessonName', width: 180 },
            { title: 'StartTime', dataIndex: 'startTime', key: 'startTime', width: 160 },
            { title: 'EndTime', dataIndex: 'endTime', key: 'endTime', width: 160 },
            {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
                width: 120,
                render: (v) => (
                    <Tag color="gold" className="m-0">
                        {v ?? '-'}
                    </Tag>
                ),
            },
        ],
        []
    );

    if (query.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (query.isError) {
        return (
            <Alert
                type="error"
                showIcon
                message="Lesson-template yuklashda xatolik"
                description={(query.error as Error)?.message}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Lesson
                </Typography.Title>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur-sm shadow-sm p-4">
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search (Lesson/Teacher/Student ID)"
                            prefix={<Search size={16} className="text-slate-400" />}
                            size="large"
                        />

                        <div className="flex gap-2">
                            <Button
                                type="primary"
                                className="w-full"
                                onClick={() => {
                                    setSearch(searchInput);
                                    setPage(1);
                                }}
                                size="large"
                            >
                                Search
                            </Button>
                            <Button
                                className="w-full"
                                onClick={() => {
                                    setSearchInput('');
                                    setSearch('');
                                    setActive(undefined);
                                    setWeekday(undefined);
                                    setStatus(undefined);
                                    setTeacherId(undefined);
                                    setStudentId(undefined);
                                    setPage(1);
                                    setLimit(10);
                                }}
                                size="large"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Select
                                allowClear
                                value={active === undefined ? undefined : active ? 'true' : 'false'}
                                onChange={(v) => {
                                    setActive(v === undefined ? undefined : v === 'true');
                                    setPage(1);
                                }}
                                placeholder="Active"
                                size="large"
                                options={[
                                    { value: 'true', label: 'Active' },
                                    { value: 'false', label: 'Inactive' },
                                ]}
                            />

                            <Select
                                allowClear
                                value={weekday}
                                onChange={(v) => {
                                    setWeekday(v);
                                    setPage(1);
                                }}
                                placeholder="Weekday"
                                size="large"
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <Select
                            allowClear
                            value={status}
                            onChange={(v) => {
                                setStatus(v);
                                setPage(1);
                            }}
                            placeholder="Status"
                            size="large"
                            options={[
                                { value: 'available', label: 'Available' },
                                { value: 'booked', label: 'Booked' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' },
                                { value: 'expired', label: 'Expired' },
                            ]}
                        />

                        <InputNumber
                            value={teacherId}
                            onChange={(v) => {
                                setTeacherId(v === null ? undefined : Number(v));
                                setPage(1);
                            }}
                            placeholder="Teacher ID"
                            style={{ width: '100%' }}
                            min={1}
                            size="large"
                        />

                        <InputNumber
                            value={studentId}
                            onChange={(v) => {
                                setStudentId(v === null ? undefined : Number(v));
                                setPage(1);
                            }}
                            placeholder="Student ID"
                            style={{ width: '100%' }}
                            min={1}
                            size="large"
                        />
                    </div>
                </div>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    size="small"
                    rowClassName={() => 'h-12'}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                setSelectedRow(record);
                                setDrawerOpen(true);
                            },
                        };
                    }}
                    pagination={false}
                    scroll={{ x: 1200, y: 520 }}
                />
            </Card>

            <Pagination
                page={page}
                limit={limit}
                totalPages={totalPages}
                totalCount={totalCount}
                admins={dataSource as any}
                setPage={setPage}
                handleLimitChange={handleLimitChange}
            />

            <Drawer
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedRow(null);
                }}
                title={
                    <div className="flex items-center justify-between w-full">
                        <span>Lesson Info</span>
                        <div className="flex items-center gap-2">
                            <Tag color="blue">ID: {selectedRow?.id ?? '-'}</Tag>
                            {!!selectedRow?.status && <Tag color="geekblue">{String(selectedRow.status)}</Tag>}
                        </div>
                    </div>
                }
                width={520}
            >
                <Descriptions
                    size="small"
                    column={1}
                    bordered
                    items={[
                        { key: 'teacherId', label: 'Teacher ID', children: selectedRow?.teacherId ?? '-' },
                        { key: 'studentId', label: 'Student ID', children: selectedRow?.studentId ?? '-' },
                        { key: 'weekday', label: 'Weekday', children: selectedRow?.weekDays ?? '-' },
                        { key: 'active', label: 'Active', children: String(!!selectedRow?.active) },
                        { key: 'lessonName', label: 'Lesson Name', children: selectedRow?.lessonName ?? '-' },
                        { key: 'startTime', label: 'Start Time', children: selectedRow?.startTime ?? '-' },
                        { key: 'endTime', label: 'End Time', children: selectedRow?.endTime ?? '-' },
                        { key: 'price', label: 'Price', children: selectedRow?.price ?? '-' },
                        { key: 'meetLink', label: 'Meet Link', children: selectedRow?.meetLink ?? '-' },
                        { key: 'googleEventId', label: 'Google Event ID', children: selectedRow?.googleEventId ?? '-' },
                    ]}
                />

                {!!selectedRow?.teacher && (
                    <div className="mt-4">
                        <Typography.Title level={5} style={{ margin: 0 }}>Teacher</Typography.Title>
                        <Descriptions
                            size="small"
                            column={1}
                            bordered
                            className="mt-2"
                            items={[
                                { key: 't_id', label: 'ID', children: selectedRow.teacher?.id ?? '-' },
                                { key: 't_name', label: 'Name', children: selectedRow.teacher?.fullname ?? selectedRow.teacher?.name ?? '-' },
                                { key: 't_phone', label: 'Phone', children: selectedRow.teacher?.phoneNumber ?? '-' },
                                { key: 't_tg', label: 'TG', children: selectedRow.teacher?.tgUsername ?? '-' },
                            ]}
                        />
                    </div>
                )}

                {!!selectedRow?.student && (
                    <div className="mt-4">
                        <Typography.Title level={5} style={{ margin: 0 }}>Student</Typography.Title>
                        <Descriptions
                            size="small"
                            column={1}
                            bordered
                            className="mt-2"
                            items={[
                                { key: 's_id', label: 'ID', children: selectedRow.student?.id ?? '-' },
                                { key: 's_name', label: 'Name', children: (selectedRow.student?.fullname ?? `${selectedRow.student?.firstName || ''} ${selectedRow.student?.lastName || ''}`.trim()) || '-' },
                                { key: 's_phone', label: 'Phone', children: selectedRow.student?.phoneNumber ?? '-' },
                                { key: 's_tg', label: 'TG', children: selectedRow.student?.tgUsername ?? '-' },
                            ]}
                        />
                    </div>
                )}
            </Drawer>
        </div>
    );
};
