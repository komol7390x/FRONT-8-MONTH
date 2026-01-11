import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Select, Tag } from 'antd';
import { Hash, Search } from 'lucide-react';
import { useTeacherPayments } from '../service/useTeacherPayments';
import { PageLoader } from '../../../../components/page-loader';
import { Pagination } from '../components/pagination';

export const TeacherPaymentPage: React.FC = () => {
    const [status, setStatus] = useState<string>('pending');
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(100);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 700);
        return () => clearTimeout(t);
    }, [searchInput]);

    const query = useTeacherPayments({ status, search, page, limit });



    const formatStatusLabel = (value: any) => {
        const s = String(value ?? '').trim();
        if (!s) return '-';
        if (s === 'pendingCanceled') return 'Pending Canceled';
        if (s === 'paidCanceled') return 'Paid Canceled';
        if (s === 'pending') return 'Pending';
        if (s === 'paid') return 'Paid';
        return s;
    };

    const dataSource = (query.data?.data || []).map((row: any, idx: number) => {
        const normalizedAmount = row?.amount ?? row?.price ?? row?.sum ?? row?.total ?? row?.paymentAmount ?? row?.value;
        return {
            key: row?.id ?? idx,
            ...row,
            amount: normalizedAmount,
        };
    });

    const total = query.data?.meta?.totalItems ?? dataSource.length;
    const totalPages = query.data?.meta?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0);

    const rows = useMemo(() => {
        return (dataSource as any[]).map((r: any, idx: number) => {
            const st = String(r?.status ?? '').toLowerCase();
            const color = st === 'pending' ? 'gold' : st === 'success' ? 'green' : st === 'cancelled' ? 'red' : 'blue';
            return {
                ...r,
                __sn: (page - 1) * limit + idx + 1,
                __statusColor: color,
            };
        });
    }, [dataSource, limit, page]);

    if (query.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
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
                <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-gray-900">Payments</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="relative">
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
                        <Select
                            value={status}
                            onChange={(v) => {
                                setStatus(String(v));
                                setPage(1);
                            }}
                            placeholder="Status"
                            style={{ width: '100%' }}
                            options={[
                                { value: 'pending', label: formatStatusLabel('pending') },
                                { value: 'success', label: 'Success' },
                                { value: 'cancelled', label: 'Cancelled' },
                                { value: 'failed', label: 'Failed' },
                            ]}
                        />
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
                                    setPage(1);
                                }}
                                className="h-11 px-5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <Card>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="grid grid-cols-6 px-3 sm:px-4 bg-gray-50 py-3 sm:py-4 border-b border-gray-200 font-semibold text-sm text-gray-700">
                            <div className="col-span-1 pr-3 sm:pr-5 flex items-center gap-2"><Hash size={14} /> №</div>
                            <div className="col-span-1 pr-5 flex items-center gap-2"><Hash size={14} /> ID</div>
                            <div className="col-span-2 pr-3 sm:pr-5">Status</div>
                            <div className="col-span-1 pr-3 sm:pr-5">Amount</div>
                            <div className="col-span-1 text-right">Created</div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                {rows.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">No payments</div>
                                ) : (
                                    rows.map((r: any, idx: number) => (
                                        <div
                                            key={r?.key ?? r?.id ?? idx}
                                            className="grid grid-cols-6 px-3 sm:px-4 py-3 sm:py-4 border-b items-center transition-colors border-gray-200 hover:bg-gray-50"
                                        >
                                            <div className="col-span-1 pr-3 sm:pr-5">
                                                <span className="text-sm font-semibold text-gray-700">{r.__sn}</span>
                                            </div>

                                            <div className="col-span-1 pr-5">
                                                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{r?.id ?? '-'}</span>
                                            </div>

                                            <div className="col-span-2 pr-3 sm:pr-5">
                                                <Tag className="m-0" color={r.__statusColor as any}>{formatStatusLabel(r?.status)}</Tag>
                                            </div>

                                            <div className="col-span-1 pr-3 sm:pr-5">
                                                <Tag className="m-0" color="gold">{r?.amount ?? '-'}</Tag>
                                            </div>

                                            <div className="col-span-1 text-right">
                                                <div className="text-xs text-gray-600">{r?.createdAt ? String(r.createdAt) : '-'}</div>
                                            </div>
                                        </div>
                                    ))
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
                    items={rows as any}
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
