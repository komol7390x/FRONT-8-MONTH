import type React from 'react';
import { useState } from 'react';
import { X, Copy, Edit, Ban, Unlock, Trash2 } from 'lucide-react';
import type { Admin } from '../service/useGetList';

interface EditForm {
    username: string;
    fullname: string;
    phoneNumber: string;
    password: string;
}

type ModalType = 'edit' | 'more' | 'create' | '';

interface AdminModalsProps {
    showModal: boolean;
    modalType: ModalType;
    selectedAdmin: Admin | null;
    editForm: EditForm;
    closeModal: () => void;
    handleSoftDelete: (id: number) => Promise<void>;
    handleEdit: () => Promise<void>;
    handleCreate: () => Promise<void>;
    setEditForm: (form: EditForm) => void;
    switchToEdit: () => void;
    isUpdating: boolean;
    getInitials: (name: string) => string;
    handleBlock: (id: number) => void;
    isBlocking?: boolean;
    refetch: () => void;
    deleteAdmin: (id: number, options?: any) => void;
    blockAdmin: (params: { id: number; active: boolean }, options?: any) => void;
}

export const AdminModals: React.FC<AdminModalsProps> = ({
    showModal,
    modalType,
    selectedAdmin,
    closeModal,
    switchToEdit,
    getInitials,
    isBlocking = false,
    refetch,
    deleteAdmin,
    blockAdmin
}) => {
    const [confirmAction, setConfirmAction] = useState<'unblock' | 'delete' | 'block' | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleUnblockConfirm = () => {
        if (selectedAdmin && blockAdmin && typeof blockAdmin === 'function') {
            blockAdmin({ id: selectedAdmin.id, active: true }, {
                onSuccess: () => {
                    refetch();
                    setConfirmAction(null);
                    closeModal();
                },
                onError: (error: any) => {
                    console.error('Unblock failed:', error);
                }
            } as any);
        }
    };

    const handleBlockConfirm = () => {
        if (selectedAdmin && blockAdmin && typeof blockAdmin === 'function') {
            blockAdmin({ id: selectedAdmin.id, active: false }, {
                onSuccess: () => {
                    refetch();
                    setConfirmAction(null);
                    closeModal();
                },
                onError: (error: any) => {
                    console.error('Block failed:', error);
                }
            } as any);
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedAdmin) {
            deleteAdmin(selectedAdmin.id, {
                onSuccess: () => {
                    closeModal();
                    refetch();
                    window.location.href = '/super-admin/admin/delete';
                }
            } as any);
        }
    };

    return (
        <div>
            {(showModal && (selectedAdmin || modalType === 'create')) && (
                <div
                    className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {modalType === 'edit' ? 'Edit Admin' : modalType === 'create' ? 'Create Admin' : 'Admin Details'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {modalType === 'more' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    {selectedAdmin?.avatarUrl ? (
                                        <img
                                            src={selectedAdmin.avatarUrl}
                                            alt={selectedAdmin?.fullname || ''}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                                            {getInitials(selectedAdmin?.fullname || '')}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{selectedAdmin?.id}</span>
                                            <h3 className="text-xl font-semibold text-gray-900">{selectedAdmin?.fullname}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">@{selectedAdmin?.username}</p>
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mt-2 ${selectedAdmin?.role === 'SUPERADMIN'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {selectedAdmin?.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">ID</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedAdmin?.id}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(selectedAdmin?.id?.toString() || '')}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                            title="Copy ID"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>

                                    <div className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Full Name</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedAdmin?.fullname}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(selectedAdmin?.fullname || '')}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                            title="Copy Full Name"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>

                                    <div className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Username</p>
                                            <p className="text-sm font-semibold text-gray-900">@{selectedAdmin?.username}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(selectedAdmin?.username || '')}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                            title="Copy Username"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>

                                    <div className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Phone Number</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedAdmin?.phoneNumber}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(selectedAdmin?.phoneNumber || '')}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                            title="Copy Phone Number"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Role</p>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${selectedAdmin?.role === 'SUPERADMIN'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {selectedAdmin?.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${selectedAdmin?.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {selectedAdmin?.isActive ? 'Active' : 'Blocked'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={switchToEdit}
                                        className="flex-1 px-4 py-3 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedAdmin) {
                                                const action = selectedAdmin.isActive ? 'block' : 'unblock';
                                                setConfirmAction(action);
                                            }
                                        }}
                                        disabled={isBlocking}
                                        className={`flex-1 px-4 py-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${selectedAdmin?.isActive
                                            ? 'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-400'
                                            : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                                            }`}
                                    >
                                        {isBlocking ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Bajarilmoqda...
                                            </>
                                        ) : selectedAdmin?.isActive ? (
                                            <>
                                                <Ban size={16} />
                                                Block
                                            </>
                                        ) : (
                                            <>
                                                <Unlock size={16} />
                                                Unblock
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedAdmin) {
                                                setConfirmAction('delete');
                                            }
                                        }}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirmation Modals */}
                        {confirmAction === 'unblock' && (
                            <div
                                className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setConfirmAction(null)}
                            >
                                <div
                                    className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Unlock size={32} className="text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Adminni Faollashtirish</h3>
                                        <p className="text-gray-600 mb-6">
                                            "{selectedAdmin?.fullname}" adminini faollashtirishni tasdiqlaysizmi? Bu ularga tizimga qayta kirish imkonini beradi.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setConfirmAction(null)}
                                                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                            >
                                                Bekor qilish
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleUnblockConfirm();
                                                }}
                                                disabled={isBlocking}
                                                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                            >
                                                {isBlocking ? 'Bajarilmoqda...' : 'Faollashtirish'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {confirmAction === 'block' && (
                            <div
                                className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setConfirmAction(null)}
                            >
                                <div
                                    className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Ban size={32} className="text-orange-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Adminni Blokirovka Qilish</h3>
                                        <p className="text-gray-600 mb-6">
                                            "{selectedAdmin?.fullname}" adminini blokirovka qilishni tasdiqlaysizmi? Bu ularning tizimga kirishini to'xtatadi.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setConfirmAction(null)}
                                                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                            >
                                                Bekor qilish
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleBlockConfirm();
                                                }}
                                                disabled={isBlocking}
                                                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
                                            >
                                                {isBlocking ? 'Bajarilmoqda...' : 'Blokirovka qilish'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {confirmAction === 'delete' && (
                            <div
                                className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setConfirmAction(null)}
                            >
                                <div
                                    className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Trash2 size={32} className="text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Adminni O'chirish</h3>
                                        <p className="text-gray-600 mb-6">
                                            "{selectedAdmin?.fullname}" adminini o'chirishni tasdiqlaysizmi? Bu amal ortga qaytarib bo'lmaydi.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setConfirmAction(null)}
                                                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                            >
                                                Bekor qilish
                                            </button>
                                            <button
                                                onClick={handleDeleteConfirm}
                                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                            >
                                                O'chirish
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
