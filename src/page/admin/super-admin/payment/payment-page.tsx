import { Alert, Card, Select, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Pagination } from '../admin/components/pagantion';
import { Roles } from '../../../../config/roles';
import { PaymentStatus, usePayments } from './service/usePayments';
import { useNavigate } from 'react-router-dom';

export const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');

    const [active, setActive] = useState<boolean | undefined>(undefined);
    const [role, setRole] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string | undefined>(undefined);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 600);
        return () => clearTimeout(t);
    }, [searchInput]);

    const query = usePayments({
        page,
        limit,
        search,
        active,
        role,
        status,
    });

    const dataSource = (query.data?.data || []).map((row: any, idx: number) => {
        const normalizedActive = typeof row?.active === 'boolean'
            ? row.active
            : typeof row?.isActive === 'boolean'
                ? row.isActive
                : undefined;

        return {
            key: row?.id ?? idx,
            ...row,
            active: normalizedActive,
        };
    });

    const totalCount = query.data?.meta?.totalItems || dataSource.length;
    const totalPages = query.data?.meta?.totalPages || 0;

    const getTargetId = (row: any): number | undefined => {
        const v =
            row?.userId ??
            row?.ownerId ??
            row?.teacherId ??
            row?.studentId ??
            row?.adminId ??
            row?.user?.id ??
            row?.teacher?.id ??
            row?.student?.id ??
            row?.admin?.id;
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : undefined;
    };

    const handleRowClick = (row: any) => {
        const targetId = getTargetId(row);
        const r = String(row?.role || '').toUpperCase();

        if (!targetId || !r) return;

        if (r === String(Roles.TEACHER).toUpperCase()) {
            navigate('/super-admin/teacher/all', { state: { openTeacherId: targetId } });
            return;
        }
        if (r === String(Roles.STUDENT).toUpperCase()) {
            navigate('/super-admin/student/all', { state: { openStudentId: targetId } });
            return;
        }
        if (r === String(Roles.ADMIN).toUpperCase() || r === String(Roles.SUPER_ADMIN).toUpperCase()) {
            navigate('/super-admin/admin/list', { state: { openAdminId: targetId } });
        }
    };

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
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
            { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
            {
                title: 'Role',
                dataIndex: 'role',
                key: 'role',
                width: 140,
                render: (v) => <Tag className="m-0" color="blue">{String(v || '-')}</Tag>,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 170,
                render: (v) => {
                    const s = String(v || '').toLowerCase();
                    const color = s.includes('paid') ? 'green' : s.includes('pending') ? 'gold' : 'default';
                    return <Tag className="m-0" color={color as any}>{String(v || '-')}</Tag>;
                },
            },
            {
                title: 'Active',
                dataIndex: 'active',
                key: 'active',
                width: 110,
                render: (v) => (
                    <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium text-white min-w-22 text-center ${v ? 'bg-green-600' : 'bg-red-600'}`}>
                        {v ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
            { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 140, render: (v) => <Tag className="m-0" color="gold">{v ?? '-'}</Tag> },
            { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 190, render: (v) => (v ? String(v) : '-') },
        ],
        [limit, page],
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
                message="Payment yuklashda xatolik"
                description={(query.error as Error)?.message}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Payment
                </Typography.Title>

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
                                    setActive(undefined);
                                    setRole(undefined);
                                    setStatus(undefined);
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
                                setActive(v == null ? undefined : v === 'true');
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
                            value={role || undefined}
                            onChange={(v) => {
                                setRole((v as any) ?? undefined);
                                setPage(1);
                            }}
                            placeholder="Role"
                            style={{ width: '100%' }}
                            options={[
                                { value: Roles.ADMIN, label: Roles.ADMIN },
                                { value: Roles.SUPER_ADMIN, label: Roles.SUPER_ADMIN },
                                { value: Roles.TEACHER, label: Roles.TEACHER },
                                { value: Roles.STUDENT, label: Roles.STUDENT },
                            ]}
                        />

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
                                { value: PaymentStatus.PENDING, label: PaymentStatus.PENDING },
                                { value: PaymentStatus.PAID, label: PaymentStatus.PAID },
                                { value: PaymentStatus.PENDING_CANCELED, label: PaymentStatus.PENDING_CANCELED },
                                { value: PaymentStatus.PAID_CANCELED, label: PaymentStatus.PAID_CANCELED },
                            ]}
                        />
                    </div>
                </div>

                <Card>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        pagination={false}
                        bordered
                        size="middle"
                        rowClassName={() => 'cursor-pointer'}
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                        })}
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
            </div>
        </div>
    );
};
