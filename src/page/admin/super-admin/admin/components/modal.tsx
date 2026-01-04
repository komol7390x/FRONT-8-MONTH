import type React from 'react';
import { X, Copy, Edit, Ban, Unlock, Trash2 } from 'lucide-react';
import type { Admin } from '../service/useGetList';
import { useSendOtp } from '../service/useCreateAdmin';

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
    // OTP props only needed for create modal
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

        // Verify OTP locally by comparing with received OTP
        if (otp === receivedOtp) {
            setOtpVerified?.(true);
            alert('OTP verified successfully!');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div>
            {(showModal && (selectedAdmin || modalType === 'create' || modalType === 'confirm')) && (
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
                                {modalType === 'edit' ? 'Edit Admin' : modalType === 'create' ? 'Create Admin' : modalType === 'confirm' ? 'Confirm Action' : 'Admin Details'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {modalType === 'confirm' && (
                            <div className="space-y-5">
                                {selectedAdmin && (
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
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
                                )}

                                <div className={`p-4 rounded-lg border ${tone === 'danger' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <p className={`text-sm font-medium ${tone === 'danger' ? 'text-red-900' : 'text-green-900'}`}>
                                        {confirmMessage || 'Tasdiqlaysizmi?'}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            onConfirm?.();
                                        }}
                                        className={`flex-1 px-4 py-3 text-white rounded text-sm font-medium transition-colors ${tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}

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

                                    <div className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Created At</p>
                                            <p className="text-xs font-medium text-gray-700">
                                                {new Date(selectedAdmin?.createdAt || '').toLocaleDateString('uz-UZ', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(new Date(selectedAdmin?.createdAt || '').toLocaleString())}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                            title="Copy Created At"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>

                                    <div className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Updated At</p>
                                            <p className="text-xs font-medium text-gray-700">
                                                {new Date(selectedAdmin?.updatedAt || '').toLocaleDateString('uz-UZ', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(new Date(selectedAdmin?.updatedAt || '').toLocaleString())}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                            title="Copy Updated At"
                                        >
                                            <Copy size={14} />
                                        </button>
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
                                                handleBlock(selectedAdmin.id, selectedAdmin.isActive);
                                            }
                                        }}
                                        disabled={isBlocking || !!selectedAdmin?.isDeleted}
                                        className={`flex-1 px-4 py-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${selectedAdmin?.isActive
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
                                    <button
                                        onClick={async () => {
                                            if (selectedAdmin) {
                                                await handleSoftDelete(selectedAdmin.id);
                                            }
                                        }}
                                        disabled={!!selectedAdmin?.isDeleted}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
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
                                            className="flex-1 px-3.5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
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
                                                className="flex-1 px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
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
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
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
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
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
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                                            placeholder="Enter password"
                                        />
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, password: e.target.value })}
                                            disabled={!otpVerified}
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 mt-2"
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
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-semibold hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
                                                // Reset OTP verification if phone number changes
                                                if (selectedAdmin && e.target.value !== selectedAdmin.phoneNumber) {
                                                    setOtpSent?.(false);
                                                    setOtpVerified?.(false);
                                                    setReceivedOtp?.('');
                                                    setOtp?.('');
                                                }
                                            }}
                                            className={`flex-1 px-3.5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 ${selectedAdmin && editForm.phoneNumber !== selectedAdmin.phoneNumber ? 'ring-2 ring-orange-300' : ''}`}
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
                                                className="flex-1 px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
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
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
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
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200"
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
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200"
                                        />
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, password: e.target.value })}
                                            placeholder="Confirm password"
                                            className="w-full px-3.5 py-2.5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 mt-2"
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
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-semibold hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
