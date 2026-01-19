import type React from 'react';
import { X, Edit, Ban, Unlock, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../../../../components/confirm-modal';
import type { Admin } from '../service/useGetList';
import { useSendOtp } from '../service/useCreateAdmin';
import { AdminMoreInfo } from './admin-more-info';

interface EditForm {
    username: string;
    fullname: string;
    phoneNumber: string;
    password: string;
}

type ModalType = 'edit' | 'more' | 'create' | 'confirm' | '';

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
    handleBlock: (id: number, currentActive: boolean) => void;
    isBlocking: boolean;
    otpSent?: boolean;
    otpVerified?: boolean;
    receivedOtp?: string;
    otp?: string;
    setOtpSent?: (sent: boolean) => void;
    setOtpVerified?: (verified: boolean) => void;
    setReceivedOtp?: (otp: string) => void;
    setOtp?: (otp: string) => void;

    confirmMessage?: string;
    onConfirm?: () => void;
    confirmTone?: 'success' | 'danger';
}

export const AdminModals: React.FC<AdminModalsProps> = ({
    showModal,
    modalType,
    selectedAdmin,
    editForm,
    closeModal,
    handleSoftDelete,
    handleEdit,
    handleCreate,
    setEditForm,
    switchToEdit,
    isUpdating,
    getInitials,
    handleBlock,
    isBlocking,
    otpSent,
    otpVerified,
    receivedOtp,
    otp,
    setOtpSent,
    setOtpVerified,
    setReceivedOtp,
    setOtp,
    confirmMessage,
    onConfirm,
    confirmTone
}) => {
    const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp();
    const tone: 'success' | 'danger' = confirmTone || 'success';

    const messageText = String(confirmMessage || '').toLowerCase();
    const confirmVariant = (
        messageText.includes('hard') || messageText.includes("butunlay") || messageText.includes("o'ch")
            ? 'hard_delete'
            : messageText.includes('block')
                ? 'block'
                : messageText.includes('active') || messageText.includes('unblock')
                    ? 'unblock'
                    : tone === 'danger'
                        ? 'delete'
                        : 'restore'
    );

    if (showModal && modalType === 'confirm') {
        return (
            <ConfirmModal
                open={true}
                title="Confirm Action"
                subject={
                    selectedAdmin ? (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {selectedAdmin.avatarUrl ? (
                                <img
                                    src={selectedAdmin.avatarUrl}
                                    alt={selectedAdmin.fullname}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {getInitials(selectedAdmin.fullname)}
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedAdmin.fullname}</p>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">ID:{selectedAdmin.id}</span>
                                </div>
                                <p className="text-xs text-gray-600 truncate">@{selectedAdmin.username}</p>
                            </div>
                        </div>
                    ) : undefined
                }
                variant={confirmVariant as any}
                message={confirmMessage || 'Tasdiqlaysizmi?'}
                note={selectedAdmin ? `Admin: ${selectedAdmin.fullname} (ID: ${selectedAdmin.id})` : undefined}
                confirmText={confirmVariant === 'hard_delete' ? 'Confirm Hard Delete' : 'Confirm'}
                cancelText="Cancel"
                loading={false}
                onCancel={closeModal}
                onConfirm={() => {
                    onConfirm?.();
                }}
            />
        );
    }

    const handleSendOtp = () => {
        if (!editForm.phoneNumber.trim()) {
            alert('Please enter phone number');
            return;
        }
        sendOtp(editForm.phoneNumber, {
            onSuccess: (data: any) => {
                setOtpSent?.(true);
                setReceivedOtp?.(data.data.otp);
            }
        } as any);
    };

    const handleVerifyOtp = () => {
        if (!otp?.trim()) {
            alert('Please enter OTP');
            return;
        }

        if (otp === receivedOtp) {
            setOtpVerified?.(true);
            alert('OTP verified successfully!');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };

    return (
        <div>
            {(showModal && (selectedAdmin || modalType === 'create' || modalType === 'confirm')) && (
                <div
                    className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalType === 'edit' ? 'Edit Admin' : modalType === 'create' ? 'Create Admin' : modalType === 'confirm' ? 'Confirm Action' : 'Admin Details'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {modalType === 'more' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        {selectedAdmin?.avatarUrl ? (
                                            <img
                                                src={selectedAdmin.avatarUrl}
                                                alt={selectedAdmin?.fullname || ''}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {getInitials(selectedAdmin?.fullname || '')}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{selectedAdmin?.fullname}</p>
                                            <p className="text-xs text-gray-600 truncate">@{selectedAdmin?.username}</p>
                                            <p className="text-xs text-gray-600 truncate">{selectedAdmin?.phoneNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedAdmin && <AdminMoreInfo admin={selectedAdmin} />}

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={switchToEdit}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedAdmin) {
                                                handleBlock(selectedAdmin.id, selectedAdmin.isActive);
                                            }
                                        }}
                                        disabled={isBlocking || !!selectedAdmin?.isDeleted}
                                        className={`flex-1 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${selectedAdmin?.isActive
                                            ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                                            : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                                            }`}
                                    >
                                        {isBlocking ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
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
                                </div>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (selectedAdmin) {
                                            await handleSoftDelete(selectedAdmin.id);
                                        }
                                    }}
                                    disabled={!!selectedAdmin?.isDeleted}
                                    className="w-full px-4 py-2.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        )}

                        {modalType === 'create' && (
                            <div className="space-y-3">
                                {/* Phone Number with OTP */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-green-600 mb-1.5">Phone Number</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.phoneNumber}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                            disabled={otpVerified}
                                            className="flex-1 px-3.5 py-2.5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                                            placeholder="+998901234567"
                                        />
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={otpVerified || isSendingOtp || !editForm.phoneNumber}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                        >
                                            {isSendingOtp ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    </div>
                                </div>

                                {/* OTP Verification */}
                                {otpSent && !otpVerified && (
                                    <div className="space-y-2">
                                        {receivedOtp && (
                                            <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                                                📱 Test OTP: <span className="font-mono font-bold">{receivedOtp}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp?.(e.target.value)}
                                                placeholder="Enter OTP"
                                                className="flex-1 px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                                            />
                                            <button
                                                onClick={handleVerifyOtp}
                                                disabled={!otp}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {otpVerified && (
                                    <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                        ✅ Phone number verified
                                    </div>
                                )}

                                {/* Username */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-blue-600 mb-1.5">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, username: e.target.value })}
                                            disabled={!otpVerified}
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                                            placeholder="Enter username"
                                        />
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-purple-600 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editForm.fullname}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, fullname: e.target.value })}
                                            disabled={!otpVerified}
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-orange-600 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, password: e.target.value })}
                                            disabled={!otpVerified}
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                                            placeholder="Enter password"
                                        />
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, password: e.target.value })}
                                            disabled={!otpVerified}
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 mt-2"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={closeModal}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={isUpdating || !otpVerified}
                                        className="flex-1 px-4 py-2.5 bg-linear-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-semibold hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {isUpdating ? 'Creating...' : 'Create Admin'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {modalType === 'edit' && (
                            <div className="space-y-3">
                                {/* Phone Number with OTP */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-green-600 mb-1.5">Phone Number</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.phoneNumber}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setEditForm({ ...editForm, phoneNumber: e.target.value });
                                                if (selectedAdmin && e.target.value !== selectedAdmin.phoneNumber) {
                                                    setOtpSent?.(false);
                                                    setOtpVerified?.(false);
                                                    setReceivedOtp?.('');
                                                    setOtp?.('');
                                                }
                                            }}
                                            className={`flex-1 px-3.5 py-2.5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 ${selectedAdmin && editForm.phoneNumber !== selectedAdmin.phoneNumber ? 'ring-2 ring-orange-300' : ''}`}
                                            placeholder="+998901234567"
                                        />
                                        {selectedAdmin && editForm.phoneNumber !== selectedAdmin.phoneNumber && (
                                            <button
                                                onClick={handleSendOtp}
                                                disabled={otpVerified || isSendingOtp || !editForm.phoneNumber}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                            >
                                                {isSendingOtp ? 'Sending...' : 'Send OTP'}
                                            </button>
                                        )}
                                    </div>
                                    {selectedAdmin && editForm.phoneNumber !== selectedAdmin.phoneNumber && (
                                        <p className="text-xs text-orange-600 mt-1">⚠️ Phone number changed - verification required</p>
                                    )}
                                </div>

                                {/* OTP Verification - only show when phone number is changed */}
                                {selectedAdmin && editForm.phoneNumber !== selectedAdmin.phoneNumber && otpSent && !otpVerified && (
                                    <div className="space-y-2">
                                        {receivedOtp && (
                                            <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                                                📱 Test OTP: <span className="font-mono font-bold">{receivedOtp}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp?.(e.target.value)}
                                                placeholder="Enter OTP"
                                                className="flex-1 px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                                            />
                                            <button
                                                onClick={handleVerifyOtp}
                                                disabled={!otp}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedAdmin && editForm.phoneNumber !== selectedAdmin.phoneNumber && otpVerified && (
                                    <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                        ✅ Phone number verified
                                    </div>
                                )}

                                {/* Username */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-blue-600 mb-1.5">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter username"
                                        />
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-purple-600 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editForm.fullname}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, fullname: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-orange-600 mb-1.5">Password (optional)</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, password: e.target.value })}
                                            placeholder="Leave empty to keep current password"
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200"
                                        />
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, password: e.target.value })}
                                            placeholder="Confirm password"
                                            className="w-full px-3.5 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 mt-2"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={closeModal}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        disabled={isUpdating || (selectedAdmin && editForm.phoneNumber !== selectedAdmin.phoneNumber && !otpVerified ? true : false)}
                                        className="flex-1 px-4 py-2.5 bg-linear-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-semibold hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
