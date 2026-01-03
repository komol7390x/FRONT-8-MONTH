import React from 'react';
import { X } from 'lucide-react';
import type { Admin } from '../service/useGetList';

interface EditForm {
    username: string;
    fullname: string;
    phoneNumber: string;
    password: string;
}

type ModalType = 'edit' | 'more' | '';

interface AdminModalsProps {
    showModal: boolean;
    modalType: ModalType;
    selectedAdmin: Admin | null;
    editForm: EditForm;
    closeModal: () => void;
    handleDelete: (id: number) => Promise<void>;
    handleEdit: () => Promise<void>;
    setEditForm: (form: EditForm) => void;
    switchToEdit: () => void;
    isUpdating: boolean;
    getInitials: (name: string) => string;
    handleBlock: (id: number, currentActive: boolean) => void;
    isBlocking: boolean;
}

export const AdminModals: React.FC<AdminModalsProps> = ({
    showModal,
    modalType,
    selectedAdmin,
    editForm,
    closeModal,
    handleDelete,
    handleEdit,
    setEditForm,
    switchToEdit,
    isUpdating,
    getInitials,
    handleBlock,
    isBlocking
}) => {
    return (
        <div>
            {showModal && selectedAdmin && (
                <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {modalType === 'edit' ? 'Edit Admin' : 'Admin Details'}
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
                                    {selectedAdmin.avatarUrl ? (
                                        <img
                                            src={selectedAdmin.avatarUrl}
                                            alt={selectedAdmin.fullname}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                                            {getInitials(selectedAdmin.fullname)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{selectedAdmin.id}</span>
                                            <h3 className="text-xl font-semibold text-gray-900">{selectedAdmin.fullname}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">@{selectedAdmin.username}</p>
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mt-2 ${selectedAdmin.role === 'SUPERADMIN'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {selectedAdmin.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                                        <p className="text-lg font-medium text-gray-900">{selectedAdmin.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${selectedAdmin.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {selectedAdmin.isActive ? '✅ Active' : '❌ Blocked'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Created At</p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedAdmin.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={switchToEdit}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedAdmin) {
                                                handleBlock(selectedAdmin.id, selectedAdmin.isActive);
                                            }
                                        }}
                                        disabled={isBlocking}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedAdmin?.isActive
                                            ? 'bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-400'
                                            : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                                            }`}
                                    >
                                        {isBlocking ? 'Jarayonda...' : selectedAdmin?.isActive ? 'Block' : 'Unblock'}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (selectedAdmin) {
                                                await handleDelete(selectedAdmin.id);
                                                closeModal();
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {modalType === 'edit' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, username: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.fullname}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, fullname: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phoneNumber}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password (optional)</label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, password: e.target.value })}
                                        placeholder="Leave empty to keep current password"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={closeModal}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
