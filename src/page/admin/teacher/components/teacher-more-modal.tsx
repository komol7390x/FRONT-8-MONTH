import React, { useState } from 'react';
import { Ban, Edit, Unlock, X } from 'lucide-react';
import type { Teacher } from '../service/useGetTeachers';
import { useTeacherIsActive } from '../service/useTeacherIsActive';
import { useHardDeleteTeacher } from '../service/useHardDeleteTeacher';
import { useSoftDeleteTeacher } from '../service/useSoftDeleteTeacher';
import { TeacherMoreCertificates } from './teacher-more-certificates';
import { TeacherMoreInfo } from './teacher-more-info';
import { TeacherMoreLessons } from './teacher-more-lessons';
import { getInitials } from './teacher-utils';

type Tab = 'info' | 'certificates' | 'lessons';
type ModalView = 'more' | 'hardDeleteConfirm';

interface TeacherMoreModalProps {
    open: boolean;
    teacher: Teacher | null;
    onClose: () => void;
    onEdit: () => void;
    onRefetch: () => void;
    deleteMode?: boolean;
}

export const TeacherMoreModal: React.FC<TeacherMoreModalProps> = ({
    open,
    teacher,
    onClose,
    onEdit,
    onRefetch,
    deleteMode = false,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [view, setView] = useState<ModalView>('more');

    const { mutate: setActive, isPending: isBlocking } = useTeacherIsActive();
    const { mutate: softDeleteTeacher, isPending: isSoftDeletingTeacher } = useSoftDeleteTeacher();
    const { mutate: hardDeleteTeacher, isPending: isHardDeletingTeacher } = useHardDeleteTeacher();

    const shouldShowHardDelete = deleteMode || !!teacher?.isDeleted;

    const closeAll = () => {
        setView('more');
        setActiveTab('info');
        onClose();
    };

    if (!open || !teacher) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAll}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{view === 'hardDeleteConfirm' ? 'Confirm Hard Delete' : 'Teacher Details'}</h2>
                    <button onClick={closeAll} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {view === 'hardDeleteConfirm' ? (
                    <div className="space-y-4">
                        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                            <p className="text-sm font-semibold text-red-800">This action will permanently delete this teacher.</p>
                            <p className="text-xs text-red-700 mt-1">Teacher: {teacher.fullname} (ID: {teacher.id})</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setView('more')}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={isHardDeletingTeacher}
                                onClick={() => {
                                    if (!teacher?.id) return;
                                    hardDeleteTeacher(teacher.id, {
                                        onSuccess: () => {
                                            closeAll();
                                            onRefetch();
                                        },
                                    } as any);
                                }}
                                className="flex-1 px-4 py-2.5 bg-red-700 text-white rounded text-sm font-medium hover:bg-red-800 disabled:bg-red-300 transition-colors"
                            >
                                {isHardDeletingTeacher ? 'Deleting...' : 'Confirm Hard Delete'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {getInitials(teacher.fullname)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{teacher.fullname}</p>
                                    <p className="text-xs text-gray-600 truncate">{teacher.email}</p>
                                    <p className="text-xs text-gray-600 truncate">{teacher.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`px-3 py-2 rounded text-sm font-semibold border ${activeTab === 'info' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Info
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('certificates')}
                                className={`px-3 py-2 rounded text-sm font-semibold border ${activeTab === 'certificates' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Certificates
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('lessons')}
                                className={`px-3 py-2 rounded text-sm font-semibold border ${activeTab === 'lessons' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Lessons
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {activeTab === 'info' && <TeacherMoreInfo teacher={teacher} />}
                            {activeTab === 'certificates' && <TeacherMoreCertificates teacher={teacher} onUpdated={onRefetch} />}
                            {activeTab === 'lessons' && <TeacherMoreLessons teacher={teacher} onUpdated={onRefetch} />}

                            <div className="flex gap-2 pt-2">
                                {activeTab === 'info' && (
                                    <button
                                        type="button"
                                        onClick={onEdit}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!teacher?.id) return;
                                        if (teacher.isDeleted) return;
                                        const current = !!teacher.isActive;
                                        setActive(
                                            { id: teacher.id, active: !current },
                                            {
                                                onSuccess: () => {
                                                    closeAll();
                                                    onRefetch();
                                                },
                                            } as any,
                                        );
                                    }}
                                    disabled={isBlocking || !!teacher.isDeleted}
                                    className={`flex-1 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${teacher.isActive
                                        ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                                        : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300'
                                        }`}
                                >
                                    {teacher.isActive ? <Ban size={16} /> : <Unlock size={16} />}
                                    {isBlocking ? 'Processing...' : teacher.isActive ? 'Block' : 'Unblock'}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!teacher?.id) return;
                                    if (shouldShowHardDelete) {
                                        setView('hardDeleteConfirm');
                                        return;
                                    }
                                    softDeleteTeacher(
                                        { id: teacher.id, status: true },
                                        {
                                            onSuccess: () => {
                                                closeAll();
                                                onRefetch();
                                            },
                                        } as any,
                                    );
                                }}
                                disabled={isSoftDeletingTeacher || isHardDeletingTeacher}
                                className="w-full px-4 py-2.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-red-300 transition-colors flex items-center justify-center gap-2"
                            >
                                {shouldShowHardDelete
                                    ? isHardDeletingTeacher
                                        ? 'Deleting...'
                                        : 'Hard Delete'
                                    : isSoftDeletingTeacher
                                        ? 'Deleting...'
                                        : 'Delete'}
                            </button>

                            {shouldShowHardDelete && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!teacher?.id) return;
                                        softDeleteTeacher(
                                            { id: teacher.id, status: false },
                                            {
                                                onSuccess: () => {
                                                    closeAll();
                                                    onRefetch();
                                                },
                                            } as any,
                                        );
                                    }}
                                    disabled={isSoftDeletingTeacher}
                                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Unlock size={16} />
                                    {isSoftDeletingTeacher ? 'Resetting...' : 'Reset (Restore)'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
