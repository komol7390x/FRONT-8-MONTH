import React, { useMemo, useState, useEffect } from 'react';
import { Select, Input } from 'antd';
import { Receipt, Search, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageLoader } from '../../components/page-loader';
import { usePayments } from '../admin/super-admin/payment/service/usePayments';

export const StudentPaymentsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Shell orqali saqlangan Student ID
    const studentId = Number(localStorage.getItem('telegram_student_internal_id') || localStorage.getItem('telegram_student_id') || 0);

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
        const next = params.toString();
        const current = searchParams.toString();
        if (next !== current) {
            setSearchParams(params, { replace: true });
        }
    }, [page, search, searchParams, setSearchParams, status]);

    // 5. Ma'lumotlarni formatlash
    const rows = useMemo(() => data?.data || [], [data]);
    const totalPages = data?.meta?.totalPages || 1;

    const getStatusInfo = (s: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
            paid: { label: 'To\'langan', class: 'bg-green-100 text-green-700' },
            pending: { label: 'Kutilmoqda', class: 'bg-amber-100 text-amber-700' },
            pendingCanceled: { label: 'Bekor qilingan', class: 'bg-red-100 text-red-700' },
            paidCanceled: { label: 'Qaytarilgan', class: 'bg-gray-100 text-gray-500' },
        };
        return statusMap[s] || { label: s, class: 'bg-gray-100 text-gray-700' };
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-28 font-sans">
            <div className="max-w-md mx-auto space-y-5">

                {/* Header Section */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">To'lovlar tarixi</h1>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tranzaksiyalar ro'yxati</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Input
                            prefix={<Search size={18} className="text-gray-300 mr-1" />}
                            placeholder="Qidirish (ID yoki izoh)..."
                            allowClear
                            className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                            defaultValue={search}
                            onPressEnter={(e: any) => { setSearch(e.target.value); setPage(1); }}
                        />
                        <Select
                            value={status}
                            onChange={(v) => { setStatus(v); setPage(1); }}
                            className="w-full h-12 custom-select-modern"
                            placeholder="Barcha holatlar"
                            options={[
                                { value: '', label: 'Barcha to\'lovlar' },
                                { value: 'paid', label: '✅ To\'langan' },
                                { value: 'pending', label: '⏳ Kutilmoqda' },
                                { value: 'pendingCanceled', label: '❌ Bekor qilingan' },
                            ]}
                        />
                    </div>
                </div>

                {/* Payments List */}
                <div className="space-y-3">
                    {isPending ? (
                        <div className="py-10"><PageLoader /></div>
                    ) : rows.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <CreditCard size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-400 font-medium">To'lovlar mavjud emas</p>
                        </div>
                    ) : (
                        rows.map((p: any) => {
                            const stInfo = getStatusInfo(p?.status);
                            return (
                                <div key={p.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50 active:scale-[0.98] transition-transform">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                ID: #{p.id}
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">
                                                {new Date(p.createdAt).toLocaleDateString('uz-UZ', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight ${stInfo.class}`}>
                                            {stInfo.label}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">To'lov miqdori</span>
                                            <div className="text-xl font-black text-gray-900 tabular-nums">
                                                {Number(p.amount || p.price || 0).toLocaleString()}
                                                <span className="text-xs font-medium text-gray-400 ml-1">UZS</span>
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-gray-400 font-medium max-w-[120px] text-right leading-tight italic">
                                            {p.comment || 'Xizmatlar uchun'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Modern */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="h-12 px-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700 disabled:opacity-20 active:bg-gray-50 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="px-5 py-2 bg-gray-900 text-white rounded-2xl text-xs font-black tracking-widest">
                            {page} / {totalPages}
                        </div>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="h-12 px-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700 disabled:opacity-20 active:bg-gray-50 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};