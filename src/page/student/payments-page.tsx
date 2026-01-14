import React, { useEffect, useMemo, useState } from 'react';
import { Card, Select } from 'antd';
import { CalendarDays, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageLoader } from '../../components/page-loader';
import { usePayments } from '../admin/super-admin/payment/service/usePayments';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentPaymentsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [studentIdResolved, setStudentIdResolved] = useState<number>(0);

    useEffect(() => {
        const handler = (e: any) => {
            const id = Number(e?.detail?.studentId);
            if (Number.isFinite(id) && id > 0) {
                setStudentIdResolved(id);
            }
        };
        window.addEventListener('telegram-student-id-updated', handler as any);
        return () => window.removeEventListener('telegram-student-id-updated', handler as any);
    }, []);

    const studentId = useMemo(() => {
        const idFromQuery = Number(searchParams.get('userId') || searchParams.get('studentId'));
        if (Number.isFinite(idFromQuery) && idFromQuery > 0) return idFromQuery;
        if (studentIdResolved > 0) return studentIdResolved;
        try {
            const idFromStorage = Number(localStorage.getItem('telegram_student_id'));
            return Number.isFinite(idFromStorage) && idFromStorage > 0 ? idFromStorage : 0;
        } catch {
            return 0;
        }
    }, [searchParams, studentIdResolved]);

    const initialSearch = searchParams.get('search') || '';
    const initialStatus = searchParams.get('status') || '';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialLimit = Number(searchParams.get('limit')) || 10;

    const [status, setStatus] = useState<string>(initialStatus);
    const [searchInput, setSearchInput] = useState<string>(initialSearch);
    const [search, setSearch] = useState<string>(initialSearch);
    const [page, setPage] = useState<number>(initialPage);
    const [limit] = useState<number>(initialLimit);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        const params: any = {};
        if (studentId) params.userId = String(studentId);
        params.role = 'STUDENT';
        if (status) params.status = status;
        if (search) params.search = search;
        if (page > 1) params.page = String(page);
        if (limit !== 10) params.limit = String(limit);
        setSearchParams(params);
    }, [studentId, status, search, page, limit, setSearchParams]);

    const formatStatus = (value: any) => {
        const s = String(value ?? '').trim();
        if (!s) return '-';
        if (s === 'pendingCanceled') return 'Pending Canceled';
        if (s === 'paidCanceled') return 'Paid Canceled';
        if (s === 'pending') return 'Pending';
        if (s === 'paid') return 'Paid';
        return s;
    };

    const query = usePayments({
        status,
        active: undefined,
        role: 'STUDENT',
        userId: studentId || undefined,
        search,
        page,
        limit,
    });

    const rows = useMemo(() => {
        return (query.data?.data || []).map((row: any) => {
            const normalizedAmount = row?.amount ?? row?.price ?? row?.sum ?? row?.total ?? row?.paymentAmount ?? row?.value;
            return {
                ...row,
                amount: normalizedAmount,
            };
        });
    }, [query.data?.data]);

    const formatAmount = (value: any) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return '-';
        return `${n.toLocaleString()} UZS`;
    };

    const formatDateTime = (value: any) => {
        if (!value) return '-';
        const d = new Date(String(value));
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleString('uz-UZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalCount = query.data?.meta?.totalItems ?? rows.length;
    const totalPages = query.data?.meta?.totalPages ?? (limit > 0 ? Math.ceil(totalCount / limit) : 0);

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={20} className="text-blue-600" />
                        <h1 className="text-lg font-bold text-gray-900">Payments</h1>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
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
                                { value: '', label: 'All' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'paid', label: 'Paid' },
                                { value: 'pendingCanceled', label: 'Pending Canceled' },
                                { value: 'paidCanceled', label: 'Paid Canceled' },
                            ]}
                        />
                    </div>
                </div>

                {query.isPending && (
                    <div className="flex justify-center py-10">
                        <PageLoader />
                    </div>
                )}

                {!query.isPending && rows.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No payments</div>
                )}

                {rows.map((p: any, idx: number) => {
                    const st = formatStatus(p?.status);
                    const isPaid = st.toLowerCase().includes('paid');
                    const isPending = st.toLowerCase().includes('pending');
                    const pillClass = isPaid
                        ? 'bg-emerald-100 text-emerald-700'
                        : isPending
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700';
                    return (
                        <Card
                            key={p?.id ?? idx}
                            className="rounded-2xl shadow-sm border-gray-200"
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-gray-900">Payment #{p?.id ?? '-'}</div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pillClass}`}>{st}</span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                    <div className="text-[11px] text-gray-500">Amount</div>
                                    <div className="text-sm font-bold text-gray-900 mt-0.5">{formatAmount(p?.amount)}</div>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                    <div className="text-[11px] text-gray-500">Created</div>
                                    <div className="text-xs font-semibold text-gray-700 mt-0.5">{formatDateTime(p?.createdAt)}</div>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {totalPages > 1 && (
                    <div className="flex justify-center pb-6 gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <TelegramStudentBottomNav />
        </div>
    );
};
