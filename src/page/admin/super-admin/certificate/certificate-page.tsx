import { Alert, Button, Card, Descriptions, Drawer, Input, InputNumber, Select, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Hash, Search, Trash2, User } from 'lucide-react';
import { CertificateUpsertModal } from '../../teacher/components/certificate-upsert-modal';
import { Pagination } from '../admin/components/pagantion';
import { useCertificates } from './service/useCertificates';

export const CertificatePage: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');

    const [status, setStatus] = useState<boolean | undefined>(undefined);
    const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);

    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalCertificate, setModalCertificate] = useState<any | null>(null);
    const [newTeacherId, setNewTeacherId] = useState<number | undefined>(undefined);

    const query = useCertificates({ page, limit, search, status, isDeleted });

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

    const columns: ColumnsType<any> = useMemo(
        () => [
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
                title: <span className="inline-flex items-center gap-1"><Trash2 size={14} />Del</span>,
                dataIndex: 'isDeleted',
                key: 'isDeleted',
                width: 120,
                render: (v) => <Tag color={v ? 'red' : 'default'} className="m-0">{v ? 'Deleted' : 'OK'}</Tag>,
            },
            { title: 'CreatedAt', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
            { title: 'UpdatedAt', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
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

            <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur-sm shadow-sm p-4">
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search (Specification / Level / Teacher ID)"
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
                                    setStatus(undefined);
                                    setIsDeleted(undefined);
                                    setPage(1);
                                    setLimit(10);
                                }}
                                size="large"
                            >
                                Clear
                            </Button>
                        </div>

                        <InputNumber
                            value={newTeacherId}
                            onChange={(v) => setNewTeacherId(v === null ? undefined : Number(v))}
                            placeholder="Teacher ID (for Add)"
                            style={{ width: '100%' }}
                            min={1}
                            size="large"
                        />

                        <Button
                            className="w-full"
                            onClick={() => {
                                setModalCertificate(null);
                                setModalOpen(true);
                            }}
                            size="large"
                        >
                            Add Certificate
                        </Button>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            <Select
                                allowClear
                                value={status === undefined ? undefined : status ? 'true' : 'false'}
                                onChange={(v) => {
                                    setStatus(v === undefined ? undefined : v === 'true');
                                    setPage(1);
                                }}
                                placeholder="Status"
                                size="large"
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
                                size="large"
                                options={[
                                    { value: 'true', label: 'Deleted' },
                                    { value: 'false', label: 'Not deleted' },
                                ]}
                            />
                        </div>
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
                            onDoubleClick: () => {
                                setModalCertificate(record);
                                setModalOpen(true);
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
                        <span>Certificate Info</span>
                        <div className="flex items-center gap-2">
                            <Tag color="blue">ID: {selectedRow?.id ?? '-'}</Tag>
                            {!!selectedRow?.level && <Tag color="geekblue">{String(selectedRow.level)}</Tag>}
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
                        { key: 'specificationName', label: 'Specification', children: selectedRow?.specificationName ?? '-' },
                        { key: 'level', label: 'Level', children: selectedRow?.level ?? '-' },
                        { key: 'description', label: 'Description', children: selectedRow?.description ?? '-' },
                        { key: 'hourPrice', label: 'Hour Price', children: selectedRow?.hourPrice ?? '-' },
                        { key: 'teacherId', label: 'Teacher ID', children: selectedRow?.teacherId ?? '-' },
                        { key: 'active', label: 'Active', children: String(!!selectedRow?.isActive) },
                        { key: 'deleted', label: 'Deleted', children: String(!!selectedRow?.isDeleted) },
                        { key: 'createdAt', label: 'CreatedAt', children: selectedRow?.createdAt ?? '-' },
                        { key: 'updatedAt', label: 'UpdatedAt', children: selectedRow?.updatedAt ?? '-' },
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

                <div className="mt-4 flex gap-2">
                    <Button
                        className="w-full"
                        onClick={() => {
                            setModalCertificate(selectedRow);
                            setModalOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                </div>
            </Drawer>

            <CertificateUpsertModal
                open={modalOpen}
                certificate={modalCertificate}
                teacherId={modalCertificate?.teacherId || newTeacherId}
                onClose={() => {
                    setModalOpen(false);
                    setModalCertificate(null);
                }}
                onSaved={() => {
                    setModalOpen(false);
                    setModalCertificate(null);
                    query.refetch();
                }}
            />
        </div>
    );
};
