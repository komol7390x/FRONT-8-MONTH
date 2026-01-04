import React, { useMemo, useState } from 'react';
import { Award, CalendarClock, DollarSign, Edit, Hash, Plus, Search, ShieldCheck } from 'lucide-react';
import type { Teacher } from '../service/useGetTeachers';
import { formatDateTime, formatNumber, toDisplay } from './teacher-utils';
import { CertificateUpsertModal } from './certificate-upsert-modal';

interface TeacherMoreCertificatesProps {
    teacher: Teacher;
    onUpdated: () => void;
}

export const TeacherMoreCertificates: React.FC<TeacherMoreCertificatesProps> = ({ teacher, onUpdated }) => {
    const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

    const [search, setSearch] = useState<string>('');
    const [levelFilter, setLevelFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [deletedFilter, setDeletedFilter] = useState<string>('');

    const certificates = (teacher.certificates || []) as any[];

    const filteredCertificates = useMemo(() => {
        const q = search.trim().toLowerCase();
        return certificates.filter((c) => {
            const matchesSearch = !q
                ? true
                : String(c?.specificationName || '').toLowerCase().includes(q)
                || String(c?.description || '').toLowerCase().includes(q)
                || String(c?.level || '').toLowerCase().includes(q);

            const matchesLevel = !levelFilter ? true : String(c?.level || '') === levelFilter;

            const matchesStatus = statusFilter === ''
                ? true
                : statusFilter === 'true'
                    ? !!c?.isActive
                    : !c?.isActive;

            const matchesDeleted = deletedFilter === ''
                ? true
                : deletedFilter === 'true'
                    ? !!c?.isDeleted
                    : !c?.isDeleted;

            return matchesSearch && matchesLevel && matchesStatus && matchesDeleted;
        });
    }, [certificates, search, levelFilter, statusFilter, deletedFilter]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Award size={16} className="text-amber-700" />
                    <p className="text-sm font-semibold text-gray-900">Certificates</p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSelectedCertificate(null);
                        setIsEditOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
                >
                    <Plus size={12} />
                    Add
                </button>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search certificates..."
                        className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        placeholder="Level (e.g. B2)"
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    >
                        <option value="">Status: All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    <select
                        value={deletedFilter}
                        onChange={(e) => setDeletedFilter(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    >
                        <option value="">Deleted: All</option>
                        <option value="true">Deleted</option>
                        <option value="false">Not deleted</option>
                    </select>
                </div>
            </div>

            {filteredCertificates.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">No certificates</div>
            ) : (
                filteredCertificates.map((c: any, idx: number) => {
                    const badgeActive = c?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                    const badgeDeleted = c?.isDeleted ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700';
                    const cardStyles = [
                        'bg-sky-50 border-sky-200',
                        'bg-emerald-50 border-emerald-200',
                        'bg-violet-50 border-violet-200',
                        'bg-amber-50 border-amber-200',
                        'bg-rose-50 border-rose-200',
                    ];

                    return (
                        <div key={c.id || `${c.specificationName}-${c.level}-${idx}`} className={`p-3 border rounded-lg ${cardStyles[idx % cardStyles.length]}`}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Award size={16} className="text-gray-700 shrink-0" />
                                        <p className="text-sm font-semibold text-gray-900 truncate" title={toDisplay(c?.specificationName)}>
                                            {toDisplay(c?.specificationName)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-1 truncate" title={toDisplay(c?.description)}>
                                        {toDisplay(c?.description)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeActive}`}>{c?.isActive ? 'Active' : 'Inactive'}</span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeDeleted}`}>{c?.isDeleted ? 'Deleted' : 'OK'}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCertificate(c);
                                            setIsEditOpen(true);
                                        }}
                                        className="px-2 py-1 rounded text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                    >
                                        <Edit size={12} />
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2">
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Hash size={14} className="text-sky-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay(c?.id)}>{toDisplay(c?.id)}</span>
                                    </div>
                                </div>
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Level</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay(c?.level)}>{toDisplay(c?.level)}</span>
                                    </div>
                                </div>
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <DollarSign size={14} className="text-violet-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Hour Price</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatNumber(c?.hourPrice)}>{formatNumber(c?.hourPrice)}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CalendarClock size={14} className="text-amber-700 shrink-0" />
                                            <span className="text-xs font-semibold text-gray-700 w-20 shrink-0">Created</span>
                                            <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime(c?.createdAt)}>{formatDateTime(c?.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CalendarClock size={14} className="text-rose-700 shrink-0" />
                                            <span className="text-xs font-semibold text-gray-700 w-20 shrink-0">Updated</span>
                                            <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime(c?.updatedAt)}>{formatDateTime(c?.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            <CertificateUpsertModal
                open={isEditOpen}
                certificate={selectedCertificate}
                teacherId={teacher.id}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedCertificate(null);
                }}
                onSaved={() => {
                    setIsEditOpen(false);
                    setSelectedCertificate(null);
                    onUpdated();
                }}
            />
        </div>
    );
};
