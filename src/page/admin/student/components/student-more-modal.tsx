import React, { useEffect, useState } from 'react';
import { Ban, Edit, PlusCircle, Trash2, Unlock, Wallet, X } from 'lucide-react';
import type { Student } from '../service/useGetStudents';
import { useStudentIsActive } from '../service/useStudentIsActive';
import { useSoftDeleteStudent } from '../service/useSoftDeleteStudent';
import { useHardDeleteStudent } from '../service/useHardDeleteStudent';
import { getInitials } from './student-utils';
import { StudentMoreInfo } from './student-more-info';
import { StudentMoreLessons } from './student-more-lessons';
import { StudentEditModal } from './student-edit-modal';

type Tab = 'info' | 'lessons';
type ConfirmAction = 'toggleActive' | 'softDelete' | 'restore' | 'hardDelete';

type ModalView = 'more' | 'confirm';

interface StudentMoreModalProps {
    open: boolean;
    student: Student | null;
    onClose: () => void;
    onRefetch: () => void;
    deleteMode?: boolean;
    initialAction?: ConfirmAction | null;
}

export const StudentMoreModal: React.FC<StudentMoreModalProps> = ({
    open,
    student,
    onClose,
    onRefetch,
    deleteMode = false,
    initialAction = null,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [view, setView] = useState<ModalView>('more');
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

    const { mutate: setActive, isPending: isBlocking } = useStudentIsActive();
    const { mutate: softDeleteStudent, isPending: isSoftDeleting } = useSoftDeleteStudent();
    const { mutate: hardDeleteStudent, isPending: isHardDeleting } = useHardDeleteStudent();

    const shouldShowHardDelete = deleteMode || !!student?.isDeleted;

    useEffect(() => {
        if (!open) return;
        if (!student?.id) return;
        if (!initialAction) return;
        setConfirmAction(initialAction);
        setView('confirm');
    }, [open, student?.id, initialAction]);

    const closeAll = () => {
        setView('more');
        setConfirmAction(null);
        setActiveTab('info');
        setIsEditOpen(false);
        onClose();
    };

    const confirmNow = () => {
        if (!student?.id || !confirmAction) return;

        if (confirmAction === 'toggleActive') {
            setActive(
                { id: student.id, active: !student.isActive },
                {
                    onSuccess: () => {
                        closeAll();
                        onRefetch();
                    },
                } as any,
            );
            return;
        }

        if (confirmAction === 'softDelete') {
            softDeleteStudent(
                { id: student.id, status: true },
                {
                    onSuccess: () => {
                        closeAll();
                        onRefetch();
                    },
                } as any,
            );
            return;
        }

        if (confirmAction === 'restore') {
            softDeleteStudent(
                { id: student.id, status: false },
                {
                    onSuccess: () => {
                        closeAll();
                        onRefetch();
                    },
                } as any,
            );
            return;
        }

        if (confirmAction === 'hardDelete') {
            hardDeleteStudent(student.id, {
                onSuccess: () => {
                    closeAll();
                    onRefetch();
                },
            } as any);
        }
    };

    if (!open || !student) return null;

    const fullname = `${student.firstName || ''} ${student.lastName || ''}`.trim();

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAll}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
                    <button onClick={closeAll} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {view === 'confirm' ? (
                    <div className="space-y-4">
                        <div className={`p-4 border rounded-lg ${confirmAction === 'softDelete' || confirmAction === 'hardDelete'
                            ? 'border-red-200 bg-red-50'
                            : confirmAction === 'restore'
                                ? 'border-green-200 bg-green-50'
                                : 'border-amber-200 bg-amber-50'
                            }`}
                        >
                            <p className={`text-sm font-semibold ${confirmAction === 'softDelete' || confirmAction === 'hardDelete'
                                ? 'text-red-800'
                                : confirmAction === 'restore'
                                    ? 'text-green-800'
                                    : 'text-amber-800'
                                }`}
                            >
                                {confirmAction === 'softDelete'
                                    ? 'Delete qilishni tasdiqlaysizmi?'
                                    : confirmAction === 'restore'
                                        ? 'Restore qilishni tasdiqlaysizmi?'
                                        : confirmAction === 'hardDelete'
                                            ? 'Hard delete qilishni tasdiqlaysizmi?'
                                            : student.isActive
                                                ? 'Block qilishni tasdiqlaysizmi?'
                                                : 'Unblock qilishni tasdiqlaysizmi?'}
                            </p>
                            <p className="text-xs mt-1 text-gray-700">Student: {fullname} (ID: {student.id})</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setView('more');
                                    setConfirmAction(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isBlocking || isSoftDeleting || isHardDeleting}
                                onClick={confirmNow}
                                className={`flex-1 px-4 py-2.5 text-white rounded text-sm font-medium transition-colors ${confirmAction === 'softDelete' || confirmAction === 'hardDelete'
                                    ? 'bg-red-700 hover:bg-red-800 disabled:bg-red-300'
                                    : confirmAction === 'restore'
                                        ? 'bg-green-700 hover:bg-green-800 disabled:bg-green-300'
                                        : 'bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {getInitials(fullname)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{fullname || '-'}</p>
                                    <p className="text-xs text-gray-600 truncate">@{student.tgUsername || '-'}</p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{student.id}</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">TG:{student.tgId}</span>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold flex items-center gap-1">
                                    <Wallet size={12} /> {student.wallet}
                                </span>
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
                                onClick={() => setActiveTab('lessons')}
                                className={`px-3 py-2 rounded text-sm font-semibold border ${activeTab === 'lessons' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Lessons
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {activeTab === 'info' && <StudentMoreInfo student={student} />}
                            {activeTab === 'lessons' && <StudentMoreLessons student={student} />}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {activeTab === 'info' && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(true)}
                                    disabled={!!student.isDeleted}
                                    className="col-span-2 px-4 py-2.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    if (student.isDeleted) return;
                                    setConfirmAction('toggleActive');
                                    setView('confirm');
                                }}
                                disabled={isBlocking || !!student.isDeleted}
                                className={`px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${student.isActive
                                    ? 'bg-red-700 text-white hover:bg-red-800 disabled:bg-red-300'
                                    : 'bg-green-700 text-white hover:bg-green-800 disabled:bg-green-300'
                                    }`}
                            >
                                {student.isActive ? <Ban size={16} /> : <Unlock size={16} />}
                                {isBlocking ? '...' : student.isActive ? 'Block' : 'Unblock'}
                            </button>

                            {student.isDeleted ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmAction('restore');
                                        setView('confirm');
                                    }}
                                    disabled={isSoftDeleting}
                                    className="px-4 py-2.5 bg-green-700 text-white rounded text-sm font-medium hover:bg-green-800 disabled:bg-green-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Unlock size={16} />
                                    {isSoftDeleting ? '...' : 'Recover'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmAction('softDelete');
                                        setView('confirm');
                                    }}
                                    disabled={isSoftDeleting}
                                    className="px-4 py-2.5 bg-red-800 text-white rounded text-sm font-medium hover:bg-red-900 disabled:bg-red-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    {isSoftDeleting ? '...' : 'Delete'}
                                </button>
                            )}

                            {shouldShowHardDelete && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmAction('hardDelete');
                                        setView('confirm');
                                    }}
                                    disabled={isHardDeleting}
                                    className="col-span-2 px-4 py-2.5 bg-red-900 text-white rounded text-sm font-medium hover:bg-black disabled:bg-red-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <PlusCircle size={16} />
                                    {isHardDeleting ? 'Deleting...' : 'Hard Delete'}
                                </button>
                            )}
                        </div>

                        <StudentEditModal
                            open={isEditOpen}
                            student={student}
                            onClose={() => setIsEditOpen(false)}
                            onUpdated={() => {
                                setIsEditOpen(false);
                                onRefetch();
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
