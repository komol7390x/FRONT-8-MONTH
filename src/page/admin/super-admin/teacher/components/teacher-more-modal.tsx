import React, { useEffect, useState } from 'react';
import { Ban, Edit, Unlock, X } from 'lucide-react';
import { ConfirmModal } from '../../../../../components/confirm-modal';
import type { Teacher } from '../service/useGetTeachers';
import { useTeacherIsActive } from '../service/useTeacherIsActive';
import { useHardDeleteTeacher } from '../service/useHardDeleteTeacher';
import { useSoftDeleteTeacher } from '../service/useSoftDeleteTeacher';
import { TeacherMoreCertificates } from './teacher-more-certificates';
import { TeacherMoreInfo } from './teacher-more-info';
import { TeacherMoreLessons } from './teacher-more-lessons';
import { TeacherMoreSchedule } from './teacher-more-schedule';
import { getInitials } from './teacher-utils';
import Cookies from 'js-cookie';
import { TokenName } from '../../../../../config/enum';
import { jwtDecode } from 'jwt-decode';
import { Roles } from '../../../../../config/roles';

type Tab = 'info' | 'certificates' | 'schedule' | 'lessons';
type ConfirmAction = 'toggleActive' | 'softDelete' | 'restore';
type ModalView = 'more' | 'hardDeleteConfirm' | 'confirm';

interface TeacherMoreModalProps {
    open: boolean;
    teacher: Teacher | null;
    onClose: () => void;
    onEdit: () => void;
    onRefetch: () => void;
    deleteMode?: boolean;
    focusTab?: Tab;
    focusLessonId?: number;
    focusCertificateId?: number;
}

export const TeacherMoreModal: React.FC<TeacherMoreModalProps> = ({
    open,
    teacher,
    onClose,
    onEdit,
    onRefetch,
    deleteMode = false,
    focusTab,
    focusLessonId,
    focusCertificateId,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [view, setView] = useState<ModalView>('more');
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    const { mutate: setActive, isPending: isBlocking } = useTeacherIsActive();
    const { mutate: softDeleteTeacher, isPending: isSoftDeletingTeacher } = useSoftDeleteTeacher();
    const { mutate: hardDeleteTeacher, isPending: isHardDeletingTeacher } = useHardDeleteTeacher();

    const token = Cookies.get(TokenName.TOKEN_NAME);
    let role: string | undefined;
    try {
        role = token ? (jwtDecode<any>(token) as any)?.role : undefined;
    } catch {
        role = undefined;
    }

    const isAdminRole = String(role || '').toUpperCase() === String(Roles.ADMIN).toUpperCase();
    const shouldShowHardDelete = !isAdminRole && (deleteMode || !!teacher?.isDeleted);

    useEffect(() => {
        if (!open) return;
        if (view !== 'more') return;
        if (!focusTab) return;
        setActiveTab(focusTab);
    }, [focusTab, open, view]);

    const closeAll = () => {
        setView('more');
        setConfirmAction(null);
        setActiveTab('info');
        onClose();
    };

    const confirmNow = () => {
        if (!teacher?.id || !confirmAction) return;

        if (confirmAction === 'toggleActive') {
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
            return;
        }

        if (confirmAction === 'softDelete') {
            softDeleteTeacher(
                { id: teacher.id, status: true },
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
            softDeleteTeacher(
                { id: teacher.id, status: false },
                {
                    onSuccess: () => {
                        closeAll();
                        onRefetch();
                    },
                } as any,
            );
        }
    };

    if (!open || !teacher) return null;

    const subject = (
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
    );

    const confirmVariant =
        view === 'hardDeleteConfirm'
            ? 'hard_delete'
            : confirmAction === 'restore'
                ? 'restore'
                : confirmAction === 'softDelete'
                    ? 'delete'
                    : teacher.isActive
                        ? 'block'
                        : 'unblock';

    const confirmMessage =
        view === 'hardDeleteConfirm'
            ? 'Hard delete qilishni tasdiqlaysizmi?'
            : confirmAction === 'softDelete'
                ? 'Delete qilishni tasdiqlaysizmi?'
                : confirmAction === 'restore'
                    ? 'Restore qilishni tasdiqlaysizmi?'
                    : teacher.isActive
                        ? 'Block qilishni tasdiqlaysizmi?'
                        : 'Unblock qilishni tasdiqlaysizmi?';

    const confirmNote =
        view === 'hardDeleteConfirm'
            ? `Teacher: ${teacher.fullname} (ID: ${teacher.id}). Bu amal qaytarilmaydi va barcha ma'lumotlar butunlay o'chadi!`
            : `Teacher: ${teacher.fullname} (ID: ${teacher.id})`;

    if (view === 'confirm' || view === 'hardDeleteConfirm') {
        return (
            <ConfirmModal
                open={true}
                title="Confirm Action"
                subject={subject}
                variant={confirmVariant as any}
                message={confirmMessage}
                note={confirmNote}
                confirmText={view === 'hardDeleteConfirm' ? 'Confirm Hard Delete' : 'Confirm'}
                cancelText={view === 'hardDeleteConfirm' ? 'Back' : 'Cancel'}
                loading={view === 'hardDeleteConfirm' ? isHardDeletingTeacher : (isBlocking || isSoftDeletingTeacher)}
                onCancel={() => {
                    setView('more');
                    setConfirmAction(null);
                }}
                onConfirm={() => {
                    if (view === 'hardDeleteConfirm') {
                        if (!teacher?.id) return;
                        hardDeleteTeacher(teacher.id, {
                            onSuccess: () => {
                                closeAll();
                                onRefetch();
                            },
                        } as any);
                        return;
                    }
                    confirmNow();
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAll}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Teacher Details</h2>
                    <button onClick={closeAll} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

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
                        {activeTab === 'certificates' && (
                            <TeacherMoreCertificates
                                teacher={teacher}
                                onUpdated={onRefetch}
                                focusCertificateId={focusCertificateId}
                            />
                        )}
                        {activeTab === 'schedule' && <TeacherMoreSchedule teacher={teacher} />}
                        {activeTab === 'lessons' && (
                            <TeacherMoreLessons
                                teacher={teacher}
                                onUpdated={onRefetch}
                                focusLessonId={focusLessonId}
                            />
                        )}

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
                                    setConfirmAction('toggleActive');
                                    setView('confirm');
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
                                setConfirmAction('softDelete');
                                setView('confirm');
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
                                    setConfirmAction('restore');
                                    setView('confirm');
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
            </div>
        </div>
    );
};
