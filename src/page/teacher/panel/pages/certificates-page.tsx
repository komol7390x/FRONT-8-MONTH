import React, { useMemo, useState } from 'react';
import { Alert } from 'antd';
import { Award, CheckCircle2, Plus, XCircle } from 'lucide-react';
import { useTeacherDetails } from '../service/useTeacherDetails';
import { CertificateUpsertModal } from '../../../admin/super-admin/teacher/components/certificate-upsert-modal';
import { PageLoader } from '../../../../components/page-loader';

export const TeacherCertificatesPage: React.FC = () => {
    const details = useTeacherDetails();
    const [upsertOpen, setUpsertOpen] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);

    const certificates = useMemo(() => {
        const arr = ((details.data as any)?.certificates || []) as any[];
        return Array.isArray(arr) ? arr : [];
    }, [details.data]);

    const teacherId = (details.data as any)?.id ? Number((details.data as any).id) : undefined;

    if (details.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    if (details.isError) {
        return (
            <Alert
                type="error"
                showIcon
                message="Certificates yuklashda xatolik"
                description={(details.error as Error)?.message}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Award size={18} className="text-amber-700" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Certificates</h1>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSelected(null);
                                setUpsertOpen(true);
                            }}
                            className="h-11 px-5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add certificate
                        </button>
                    </div>

                    {certificates.length === 0 ? (
                        <div className="mt-6 p-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center">
                            <div className="text-sm font-semibold text-gray-900">No certificates</div>
                            <div className="mt-1 text-xs text-gray-600">
                                Avval certificate qo‘shing, keyin lesson create qilasiz.
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelected(null);
                                    setUpsertOpen(true);
                                }}
                                className="mt-4 h-10 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                            >
                                Add certificate
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {certificates.map((c) => (
                                <button
                                    key={c?.id ?? Math.random()}
                                    type="button"
                                    onClick={() => {
                                        setSelected(c);
                                        setUpsertOpen(true);
                                    }}
                                    className="text-left p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-gray-900 truncate">{String(c?.specificationName || '-')}</div>
                                            <div className="mt-1 text-xs text-gray-600 truncate">{String(c?.description || '')}</div>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                            {Boolean(c?.isActive) ? (
                                                <CheckCircle2 size={18} className="text-emerald-600" />
                                            ) : (
                                                <XCircle size={18} className="text-rose-600" />
                                            )}
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800">
                                                {String(c?.level || '-').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700">Price:</span>
                                        <span className="text-xs font-bold text-gray-900">{String(c?.hourPrice ?? '-')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <CertificateUpsertModal
                    open={upsertOpen}
                    certificate={selected}
                    teacherId={teacherId}
                    onClose={() => setUpsertOpen(false)}
                    onSaved={() => {
                        setUpsertOpen(false);
                        details.refetch();
                    }}
                />
            </div>
        </div>
    );
};
