import React, { useEffect, useState } from 'react';
import { Award, BadgeCheck, DollarSign, FileText, Hash, X } from 'lucide-react';
import { message } from 'antd';
import { useCreateCertificate } from '../service/useCreateCertificate';
import { useUpdateCertificate } from '../service/useUpdateCertificate';

interface CertificateUpsertModalProps {
    open: boolean;
    certificate: any | null;
    teacherId?: number;
    onClose: () => void;
    onSaved: () => void;
}

export const CertificateUpsertModal: React.FC<CertificateUpsertModalProps> = ({
    open,
    certificate,
    teacherId,
    onClose,
    onSaved,
}) => {
    const { mutate: createCertificate, isPending: isCreating } = useCreateCertificate();
    const { mutate: updateCertificate, isPending: isUpdating } = useUpdateCertificate();

    const isEdit = !!certificate?.id;

    const [form, setForm] = useState({
        specificationName: '',
        level: 'B2',
        description: '',
        hourPrice: 0,
        teacherId: 0,
    });

    useEffect(() => {
        if (!open) return;
        if (isEdit) {
            setForm({
                specificationName: String(certificate?.specificationName || ''),
                level: String(certificate?.level || 'B2'),
                description: String(certificate?.description || ''),
                hourPrice: Number(certificate?.hourPrice || 0),
                teacherId: Number(certificate?.teacherId || teacherId || 0),
            });
        } else {
            setForm({
                specificationName: '',
                level: 'B2',
                description: '',
                hourPrice: 0,
                teacherId: Number(teacherId || 0),
            });
        }
    }, [open, isEdit, certificate, teacherId]);

    const handleSave = () => {
        if (!form.specificationName.trim()) {
            message.warning('specificationName is required');
            return;
        }
        if (!form.level) {
            message.warning('level is required');
            return;
        }
        if (!form.description.trim()) {
            message.warning('description is required');
            return;
        }

        const hp = Number(form.hourPrice);
        if (!Number.isFinite(hp) || hp <= 0) {
            message.warning('hourPrice is required');
            return;
        }
        const finalTeacherId = Number(teacherId || form.teacherId);
        if (!finalTeacherId) {
            message.warning('teacherId is required');
            return;
        }

        if (isEdit) {
            updateCertificate(
                {
                    id: Number(certificate.id),
                    specificationName: form.specificationName,
                    level: form.level,
                    description: form.description,
                    hourPrice: Number(form.hourPrice) || 0,
                    teacherId: finalTeacherId,
                } as any,
                {
                    onSuccess: () => {
                        onClose();
                        onSaved();
                    },
                } as any,
            );
            return;
        }

        createCertificate(
            {
                specificationName: form.specificationName,
                level: form.level,
                description: form.description,
                hourPrice: Number(form.hourPrice) || 0,
                teacherId: finalTeacherId,
            } as any,
            {
                onSuccess: () => {
                    onClose();
                    onSaved();
                },
            } as any,
        );
    };

    const isPending = isCreating || isUpdating;

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Award size={18} className="text-amber-700" />
                        <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Certificate' : 'Add Certificate'}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specification Name</label>
                        <div className="relative">
                            <Award size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700" />
                            <input
                                value={form.specificationName}
                                onChange={(e) => setForm((p) => ({ ...p, specificationName: e.target.value }))}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <div className="relative">
                            <BadgeCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" />
                            <input
                                value={form.level}
                                onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3 top-3 text-violet-700" />
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2.5 bg-linear-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hour Price</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-700" />
                            <input
                                type="number"
                                value={form.hourPrice}
                                onChange={(e) => setForm((p) => ({ ...p, hourPrice: Number(e.target.value) }))}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                            />
                        </div>
                    </div>

                    {!teacherId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID</label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                                <input
                                    type="number"
                                    value={form.teacherId}
                                    onChange={(e) => setForm((p) => ({ ...p, teacherId: Number(e.target.value) }))}
                                    className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
