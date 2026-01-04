import React, { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { message } from 'antd';
import { useUpdateCertificate } from '../service/useUpdateCertificate';

interface CertificateEditModalProps {
    open: boolean;
    certificate: any | null;
    onClose: () => void;
    onUpdated: () => void;
}

export const CertificateEditModal: React.FC<CertificateEditModalProps> = ({ open, certificate, onClose, onUpdated }) => {
    const { mutate: updateCertificate, isPending } = useUpdateCertificate();

    const [form, setForm] = useState({
        specificationName: '',
        level: 'B2',
        description: '',
        hourPrice: 0,
        teacherId: 0,
    });

    useEffect(() => {
        if (!open || !certificate) return;
        setForm({
            specificationName: String(certificate?.specificationName || ''),
            level: String(certificate?.level || 'B2'),
            description: String(certificate?.description || ''),
            hourPrice: Number(certificate?.hourPrice || 0),
            teacherId: Number(certificate?.teacherId || 0),
        });
    }, [open, certificate]);

    const handleSave = () => {
        if (!certificate?.id) {
            message.error('Certificate ID not found');
            return;
        }
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
        if (!form.teacherId) {
            message.warning('teacherId is required');
            return;
        }

        updateCertificate(
            {
                id: Number(certificate.id),
                specificationName: form.specificationName,
                level: form.level,
                description: form.description,
                hourPrice: Number(form.hourPrice) || 0,
                teacherId: Number(form.teacherId),
            } as any,
            {
                onSuccess: () => {
                    onClose();
                    onUpdated();
                },
            } as any,
        );
    };

    if (!open || !certificate) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Award size={18} className="text-amber-700" />
                        <h2 className="text-xl font-bold text-gray-900">Edit Certificate</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specification Name</label>
                        <input
                            value={form.specificationName}
                            onChange={(e) => setForm((p) => ({ ...p, specificationName: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <input
                            value={form.level}
                            onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hour Price</label>
                        <input
                            type="number"
                            value={form.hourPrice}
                            onChange={(e) => setForm((p) => ({ ...p, hourPrice: Number(e.target.value) }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID</label>
                        <input
                            type="number"
                            value={form.teacherId}
                            onChange={(e) => setForm((p) => ({ ...p, teacherId: Number(e.target.value) }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

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
