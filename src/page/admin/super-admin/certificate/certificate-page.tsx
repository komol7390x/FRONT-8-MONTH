import { Alert, Button, InputNumber, Select, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { Award, CalendarDays, CheckCircle2, Hash, Search, User } from 'lucide-react';
import { CertificateUpsertModal } from '../teacher/components/certificate-upsert-modal';
import { Pagination } from '../admin/components/pagantion';
import { useCertificates } from './service/useCertificates';
import { TeacherMoreModal } from '../teacher/components/teacher-more-modal';
import type { Teacher } from '../teacher/service/useGetTeachers';
import { useGetTeacherById } from '../teacher/service/useGetTeacherById';

export const CertificatePage: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');

    const [active, setActive] = useState<boolean | undefined>(undefined);
    const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);

    const [teacherId, setTeacherId] = useState<number | undefined>(undefined);

    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [upsertOpen, setUpsertOpen] = useState<boolean>(false);
    const [modalCertificate, setModalCertificate] = useState<any | null>(null);

    const [teacherModalOpen, setTeacherModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const [teacherFocusTab, setTeacherFocusTab] = useState<'info' | 'certificates' | 'lessons' | undefined>(undefined);
    const [teacherFocusCertificateId, setTeacherFocusCertificateId] = useState<number | undefined>(undefined);

    const teacherByIdQuery = useGetTeacherById(selectedRow?.teacherId ? Number(selectedRow.teacherId) : undefined);

    useEffect(() => {
        if (!teacherModalOpen) return;
        const t = teacherByIdQuery.data;
        if (!t) return;
        setSelectedTeacher(t as any);
    }, [teacherByIdQuery.data, teacherModalOpen]);

    const query = useCertificates({ page, limit, search, active, isDeleted, teacherId });

    const dataSource = (query.data?.data || []).map((row: any, idx: number) => ({
        key: row?.id ?? idx,
        ...row,
    }));

    const totalCount = query.data?.meta?.totalItems || dataSource.length;
    const totalPages = query.data?.meta?.totalPages || 0;

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const formatDateTime = (v: any) => {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        const day = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
        const date = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        return (
            <div className="leading-tight">
                <div className="text-xs font-semibold text-gray-800">{day} {date}</div>
                <div className="text-[11px] text-gray-500">{time}</div>
            </div>
        );
    };

    const columns: ColumnsType<any> = useMemo(
        () => [
            {
                title: '№',
                key: 'sn',
                width: 60,
                render: (_: any, __: any, idx: number) => (
                    <span className="text-sm font-semibold text-gray-700">{(page - 1) * limit + idx + 1}</span>
                ),
            },
            { title: <span className="inline-flex items-center gap-1"><Hash size={14} />ID</span>, dataIndex: 'id', key: 'id', width: 90 },
            { title: <span className="inline-flex items-center gap-1"><Award size={14} />Specification</span>, dataIndex: 'specificationName', key: 'specificationName', width: 220 },
            {
                title: 'Level',
                dataIndex: 'level',
                key: 'level',
                width: 120,
                render: (v) => {
                    const s = String(v || '').toUpperCase();
                    const color = s.startsWith('A') ? 'green' : s.startsWith('B') ? 'gold' : s.startsWith('C') ? 'red' : 'blue';
                    return <Tag color={color} className="m-0">{s || '-'}</Tag>;
                },
            },
            { title: 'Price', dataIndex: 'hourPrice', key: 'hourPrice', width: 140, render: (v) => <Tag color="gold" className="m-0">{v ?? '-'}</Tag> },
            { title: <span className="inline-flex items-center gap-1"><User size={14} />T</span>, dataIndex: 'teacherId', key: 'teacherId', width: 90 },
            {
                title: <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} />Active</span>,
                dataIndex: 'isActive',
                key: 'isActive',
                width: 110,
                render: (v) => <Tag color={v ? 'green' : 'red'} className="m-0">{v ? 'Active' : 'Inactive'}</Tag>,
            },
            {
                title: <span className="inline-flex items-center gap-1"><CalendarDays size={14} />Created</span>,
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: 190,
                render: (v) => formatDateTime(v),
            },
        ],
        [limit, page]
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
                message="Certificate yuklashda xatolik"
                description={(query.error as Error)?.message}
            />
        );
    }

    return (
        <div className="space-y-4">
            <Typography.Title level={3} style={{ margin: 0 }}>
                Certificate
            </Typography.Title>

            <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by specification/level/teacher id"
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
                                setActive(undefined);
                                setIsDeleted(undefined);
                                setTeacherId(undefined);
                                setPage(1);
                                setLimit(10);
                            }}
                            className="h-11 px-5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <Select
                        allowClear
                        value={active === undefined ? undefined : active ? 'true' : 'false'}
                        onChange={(v) => {
                            setActive(v === undefined ? undefined : v === 'true');
                            setPage(1);
                        }}
                        placeholder="Active"
                        style={{ width: '100%' }}
                        options={[
                            { value: 'true', label: 'Active' },
                            { value: 'false', label: 'Inactive' },
                        ]}
                    />

                    <Select
                        allowClear
                        value={isDeleted === undefined ? undefined : isDeleted ? 'true' : 'false'}
                        onChange={(v) => {
                            setIsDeleted(v === undefined ? undefined : v === 'true');
                            setPage(1);
                        }}
                        placeholder="Deleted"
                        style={{ width: '100%' }}
                        options={[
                            { value: 'true', label: 'Deleted' },
                            { value: 'false', label: 'Not deleted' },
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
                        controls={false}
                    />

                    <Button
                        className="w-full"
                        onClick={() => {
                            setModalCertificate(null);
                            setUpsertOpen(true);
                        }}
                    >
                        Add Certificate
                    </Button>
                </div>

            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                size="middle"
                rowClassName={() => 'cursor-pointer'}
                onRow={(record) => {
                    return {
                        onClick: () => {
                            setSelectedRow(record);
                            setTeacherFocusTab('certificates');
                            setTeacherFocusCertificateId(record?.id ? Number(record.id) : undefined);
                            setTeacherModalOpen(true);
                        },
                        onDoubleClick: () => {
                            setModalCertificate(record);
                            setUpsertOpen(true);
                        },
                    };
                }}
            />

            <Pagination
                page={page}
                limit={limit}
                totalPages={totalPages}
                totalCount={totalCount}
                admins={dataSource as any}
                setPage={setPage}
                handleLimitChange={handleLimitChange}
            />

            <CertificateUpsertModal
                open={upsertOpen}
                certificate={modalCertificate}
                teacherId={teacherId}
                onClose={() => {
                    setUpsertOpen(false);
                    setModalCertificate(null);
                }}
                onSaved={() => {
                    query.refetch();
                }}
            />

            <TeacherMoreModal
                open={teacherModalOpen}
                teacher={selectedTeacher}
                onClose={() => {
                    setTeacherModalOpen(false);
                    setSelectedRow(null);
                    setTeacherFocusTab(undefined);
                    setTeacherFocusCertificateId(undefined);
                    setSelectedTeacher(null);
                }}
                onEdit={() => { }}
                onRefetch={() => teacherByIdQuery.refetch()}
                focusTab={teacherFocusTab}
                focusCertificateId={teacherFocusCertificateId}
            />
        </div>
    );
};
