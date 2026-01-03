import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateAdmin, useSendOtp, useVerifyOtp } from '../service/useCreateAdmin';

interface AddAdminModalProps {
    showModal: boolean;
    closeModal: () => void;
}

interface FormData {
    phoneNumber: string;
    username: string;
    fullname: string;
    password: string;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({ showModal, closeModal }) => {
    const [formData, setFormData] = useState<FormData>({
        phoneNumber: '',
        username: '',
        fullname: '',
        password: ''
    });

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [receivedOtp, setReceivedOtp] = useState('');

    const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
    const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp();
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendOtp = () => {
        if (!formData.phoneNumber.trim()) {
            alert('Please enter phone number');
            return;
        }
        sendOtp(formData.phoneNumber, {
            onSuccess: (data: any) => {
                setOtpSent(true);
                setReceivedOtp(data.data.otp);
            }
        } as any);
    };

    const handleVerifyOtp = () => {
        if (!otp.trim()) {
            alert('Please enter OTP');
            return;
        }
        verifyOtp({ phoneNumber: formData.phoneNumber, otp }, {
            onSuccess: () => {
                setOtpVerified(true);
            }
        } as any);
    };

    const handleCreateAdmin = () => {
        if (!otpVerified) {
            alert('Please verify phone number first');
            return;
        }

        if (!formData.username.trim() || !formData.fullname.trim() || !formData.password.trim()) {
            alert('Please fill all required fields');
            return;
        }

        createAdmin(formData, {
            onSuccess: () => {
                setFormData({
                    phoneNumber: '',
                    username: '',
                    fullname: '',
                    password: ''
                });
                setOtp('');
                setOtpSent(false);
                setOtpVerified(false);
                setReceivedOtp('');
                closeModal();
            }
        } as any);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Admin</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                disabled={otpVerified}
                                placeholder="+998901234567"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                            />
                            <button
                                onClick={handleSendOtp}
                                disabled={otpVerified || isSendingOtp || !formData.phoneNumber}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                            >
                                {isSendingOtp ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    </div>

                    {/* OTP Verification */}
                    {otpSent && !otpVerified && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verify OTP
                            </label>
                            {receivedOtp && (
                                <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                                    📱 Test OTP: <span className="font-mono font-bold">{receivedOtp}</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifying || !otp}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify'}
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="john.doe"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Admin123!@"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6">
                        <button
                            onClick={closeModal}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateAdmin}
                            disabled={isCreating || !otpVerified}
                            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                        >
                            {isCreating ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
