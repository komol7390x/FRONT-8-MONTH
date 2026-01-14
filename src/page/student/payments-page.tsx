import React, { useMemo, useState, useEffect } from 'react';
import { Card, Select, Input } from 'antd';
import { Receipt, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageLoader } from '../../components/page-loader';
import { usePayments } from '../admin/super-admin/payment/service/usePayments';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentPaymentsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Markazlashgan ID (Shell orqali olingan)
    const studentId = Number(localStorage.getItem('telegram_student_id') || 0);

    // 2. Filterlar holati
    const [status, setStatus] = useState<string>(searchParams.get('status') || '');
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');
    const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
    const limit = 10;

    // 3. API so'rovi
    const { data, isPending } = usePayments({
        status: status || undefined,
        role: 'STUDENT',
        userId: studentId || undefined,
        search: search || undefined,
        page,
        limit,
    });

    // 4. URLni sinxronlash
    useEffect(() => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (search) params.set('search', search);
        if (page > 1) params.set('page', String(page));
        setSearchParams(params, { replace: true });
    }, [status, search, page, setSearchParams]);

    // 5. Ma'lumotlarni formatlash
    const rows = useMemo(() => data?.data || [], [data]);
    const totalPages = data?.meta?.totalPages || 1;

    const getStatusInfo = (s: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
            paid: { label: 'To\'langan', class: 'bg-emerald-100 text-emerald-700' },
            pending: { label: 'Kutilmoqda', class: 'bg-amber-100 text-amber-700' },
            pendingCanceled: { label: 'Bekor qilingan', class: 'bg-red-100 text-red-700' },
            paidCanceled: { label: 'Qaytarilgan', class: 'bg-gray-100 text-gray-700' },
        };
        return statusMap[s] || { label: s, class: 'bg-gray-100 text-gray-700' };
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header va Qidiruv */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Receipt size={20} className="text-blue-600" />
                        <h1 className="text-lg font-bold text-gray-900">To'lovlar tarixi</h1>
                    </div>

                    <div className="space-y-2">
                        <Input
                            prefix={<Search size={16} className="text-gray-400" />}
                            placeholder="Qidirish..."
                            allowClear
                            className="h-11 rounded-xl"
                            defaultValue={search}
                            onPressEnter={(e: any) => { setSearch(e.target.value); setPage(1); }}
                        />
                        <Select
                            value={status}
                            onChange={(v) => { setStatus(v); setPage(1); }}
                            className="w-full h-11"
                            placeholder="Holat bo'yicha"
                            options={[
                                { value: '', label: 'Barchasi' },
                                { value: 'paid', label: 'To\'langan' },
                                { value: 'pending', label: 'Kutilmoqda' },
                                { value: 'pendingCanceled', label: 'Bekor qilingan' },
                            ]}
                        />
                    </div>
                </div>

                {/* To'lovlar ro'yxati */}
                {isPending ? (
                    <PageLoader />
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">To'lovlar topilmadi</div>
                ) : (
                    <div className="space-y-3">
                        {rows.map((p: any) => {
                            const stInfo = getStatusInfo(p?.status);
                            return (
                                <Card key={p.id} className="rounded-2xl border-none shadow-sm overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">ID: {p.id}</div>
                                            <div className="text-sm font-bold text-gray-900 mt-0.5">
                                                {new Date(p.createdAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${stInfo.class}`}>
                                            {stInfo.label}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between border-t border-gray-50 pt-3 mt-1">
                                        <div className="text-lg font-black text-gray-900">
                                            {Number(p.amount || p.price || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">UZS</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 italic">
                                            {p.comment || 'Xizmat uchun to\'lov'}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 pt-2 text-gray-500 font-medium text-sm">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="flex items-center gap-1 disabled:opacity-30 p-2 bg-white rounded-xl shadow-sm border border-gray-100"
                        >
                            <ChevronLeft size={18} /> Oldingi
                        </button>
                        <span>{page} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-1 disabled:opacity-30 p-2 bg-white rounded-xl shadow-sm border border-gray-100"
                        >
                            Keyingi <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            <TelegramStudentBottomNav studentId={studentId} />
        </div>
    );
};