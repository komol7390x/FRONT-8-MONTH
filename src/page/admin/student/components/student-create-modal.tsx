import React, { useEffect, useState } from 'react';
import { Hash, Phone, User, UserPlus, X } from 'lucide-react';
import { message } from 'antd';

import { useConfirmStudent } from '../service/useConfirmStudent';
import { useCreateStudent } from '../service/useCreateStudent';

type Step = 'phone' | 'otp' | 'details';

interface StudentCreateModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export const StudentCreateModal: React.FC<StudentCreateModalProps> = ({ open, onClose, onCreated }) => {
    const { mutate: confirmPhone, isPending: isConfirming } = useConfirmStudent();
    const { mutate: createStudent, isPending: isCreating } = useCreateStudent();

    const [step, setStep] = useState<Step>('phone');

    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [receivedOtp, setReceivedOtp] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [tgId, setTgId] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [tgUsername, setTgUsername] = useState<string>('');

    useEffect(() => {
        if (!open) return;
        setStep('phone');
        setPhoneNumber('');
        setReceivedOtp('');
        setOtp('');
        setTgId('');
        setLastName('');
        setFirstName('');
        setTgUsername('');
    }, [open]);

    const handleConfirm = () => {
        if (!phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        confirmPhone(
            { phoneNumber },
            {
                onSuccess: (data: any) => {
                    const otpValue = data?.data?.otp || '';
                    setReceivedOtp(String(otpValue || ''));
                    setOtp('');
                    setStep('otp');
                },
            } as any,
        );
    };

    const handleVerifyOtp = () => {
        if (!receivedOtp) {
            message.warning('OTP not received');
            return;
        }
        if (!otp.trim()) {
            message.warning('OTP is required');
            return;
        }
        if (otp.trim() !== String(receivedOtp)) {
            message.warning('OTP noto\'g\'ri');
            return;
        }
        setStep('details');
    };

    const handleCreate = () => {
        if (!phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        if (!tgId.trim()) {
            message.warning('tgId is required');
            return;
        }
        if (!firstName.trim() || !lastName.trim()) {
            message.warning('Firstname/Lastname is required');
            return;
        }
        if (!tgUsername.trim()) {
            message.warning('tgUsername is required');
            return;
        }

        createStudent(
            { phoneNumber, tgId, lastName, firstName, tgUsername },
            {
                onSuccess: () => {
                    onClose();
                    onCreated();
                },
            } as any,
        );
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto border border-green-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <UserPlus size={20} className="text-green-800" />
                        <h2 className="text-2xl font-bold text-green-900">Add Student</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'phone' ? 'bg-green-600 text-white' : 'bg-green-600 text-white'}`}>1</div>
                        <div className={`flex-1 h-1 rounded ${step === 'otp' || step === 'details' ? 'bg-green-600' : 'bg-gray-200'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'otp' || step === 'details' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                        <div className={`flex-1 h-1 rounded ${step === 'details' ? 'bg-green-600' : 'bg-gray-200'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'details' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
                    </div>

                    {step === 'phone' && (
                        <>
                            <div className="group">
                                <label className="block text-xs font-semibold text-green-700 mb-1.5">Phone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700" />
                                    <input
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
                                        placeholder="+998901234567"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="w-full h-11 px-4 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                            >
                                {isConfirming ? 'Confirming...' : 'Confirm phone'}
                            </button>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            {receivedOtp && (
                                <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                    Test OTP: <span className="font-mono font-bold">{receivedOtp}</span>
                                </div>
                            )}

                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">OTP</label>
                                <input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                                    placeholder="Enter OTP"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('phone')}
                                    className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    className="flex-1 h-11 px-4 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:bg-green-300"
                                >
                                    Verify OTP
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'details' && (
                        <>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="group">
                                    <label className="block text-xs font-semibold text-green-700 mb-1.5">Phone</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700" />
                                        <input
                                            value={phoneNumber}
                                            disabled
                                            className="w-full h-11 pl-10 pr-4 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-blue-700 mb-1.5">tgId</label>
                                    <div className="relative">
                                        <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" />
                                        <input
                                            value={tgId}
                                            onChange={(e) => setTgId(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="123456789"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-purple-700 mb-1.5">First name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-700" />
                                        <input
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                            placeholder="Ali"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-purple-700 mb-1.5">Last name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-700" />
                                        <input
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                            placeholder="Aliyev"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-sky-700 mb-1.5">tgUsername</label>
                                    <input
                                        value={tgUsername}
                                        onChange={(e) => setTgUsername(e.target.value)}
                                        className="w-full h-11 px-4 bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                                        placeholder="ali_dev"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('otp')}
                                    disabled={isCreating}
                                    className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="flex-1 h-11 px-4 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:bg-green-300"
                                >
                                    {isCreating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
