import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Mail, Phone, User, UserPlus, X } from 'lucide-react';
import { message } from 'antd';

import { useConfirmTelEmail } from '../service/useConfirmTeacherOtp';
import { useCreateTeacher } from '../service/useCreateTeacher';

interface TeacherCreateModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

type Step = 'contact' | 'otp' | 'details';

export const TeacherCreateModal: React.FC<TeacherCreateModalProps> = ({ open, onClose, onCreated }) => {
    const { mutate: sendOtp, isPending: isSendingOtp } = useConfirmTelEmail();
    const { mutate: createTeacher, isPending: isCreatingTeacher } = useCreateTeacher();

    const [step, setStep] = useState<Step>('contact');

    const [email, setEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    const [receivedPhoneOtp, setReceivedPhoneOtp] = useState<string>('');
    const [receivedEmailOtp, setReceivedEmailOtp] = useState<string>('');
    const [sekLeft, setSekLeft] = useState<number>(0);

    const [phoneOtp, setPhoneOtp] = useState<string>('');
    const [emailOtp, setEmailOtp] = useState<string>('');

    const [fullname, setFullname] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [expirence, setExpirence] = useState<number>(0);

    useEffect(() => {
        if (!open) return;
        setStep('contact');
        setEmail('');
        setPhoneNumber('');
        setReceivedPhoneOtp('');
        setReceivedEmailOtp('');
        setSekLeft(0);
        setPhoneOtp('');
        setEmailOtp('');
        setFullname('');
        setPassword('');
        setExpirence(0);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (step !== 'otp') return;
        if (!sekLeft) return;

        const t = window.setInterval(() => {
            setSekLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    window.clearInterval(t);
                    message.warning('siz vqtz tugadi');
                    onClose();
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => window.clearInterval(t);
    }, [open, onClose, sekLeft, step]);

    const phoneVerified = useMemo(() => !!receivedPhoneOtp && phoneOtp === receivedPhoneOtp, [phoneOtp, receivedPhoneOtp]);
    const emailVerified = useMemo(() => !!receivedEmailOtp && emailOtp === receivedEmailOtp, [emailOtp, receivedEmailOtp]);
    const allVerified = phoneVerified && emailVerified;

    const stepIndex: 1 | 2 | 3 = step === 'contact' ? 1 : step === 'otp' ? 2 : 3;

    const handleSendOtp = () => {
        if (!email.trim()) {
            message.warning('Email is required');
            return;
        }
        if (!phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        sendOtp(
            { email, phoneNumber },
            {
                onSuccess: (data: any) => {
                    const phoneOtpValue = data?.data?.phoneOtp || '';
                    const emailOtpValue = data?.data?.emailOtp || '';
                    setReceivedPhoneOtp(phoneOtpValue);
                    setReceivedEmailOtp(emailOtpValue);
                    setSekLeft(Number(data?.data?.sek || 0));
                    if (phoneOtpValue || emailOtpValue) {
                        message.success(`OTP: phone ${phoneOtpValue || '-'} | email ${emailOtpValue || '-'}`, 30);
                    }
                    setStep('otp');
                },
            } as any,
        );
    };

    const handleVerifyOtp = () => {
        if (!receivedPhoneOtp || !receivedEmailOtp) {
            message.warning('OTP not received yet');
            return;
        }
        if (!allVerified) {
            message.warning('OTP noto\'g\'ri');
            return;
        }
        setStep('details');
    };

    const handleCreate = () => {
        if (!email.trim() || !phoneNumber.trim()) {
            message.warning('Email and phone are required');
            return;
        }
        if (!allVerified) {
            message.warning('OTP tasdiqlanmagan');
            return;
        }
        if (!fullname.trim()) {
            message.warning('Fullname is required');
            return;
        }
        if (!password.trim()) {
            message.warning('Password is required');
            return;
        }

        createTeacher(
            {
                email,
                phoneNumber,
                fullname,
                password,
                expirence: Number(expirence) || 0,
            } as any,
            {
                onSuccess: () => {
                    onClose();
                    onCreated();
                },
            } as any,
        );
    };

    if (!open) return null;

    const Stepper = () => (
        <div className="flex items-center gap-3 mb-4">
            {[1, 2, 3].map((n) => {
                const active = stepIndex >= n;
                return (
                    <React.Fragment key={n}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {n}
                        </div>
                        {n !== 3 && (
                            <div className={`flex-1 h-1 rounded ${stepIndex > n ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <UserPlus size={20} className="text-green-700" />
                        <h2 className="text-2xl font-bold text-gray-900">Add Teacher</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <Stepper />

                    {step === 'contact' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs font-semibold text-blue-700 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="teacher@mail.com"
                                        />
                                    </div>
                                </div>

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
                            </div>

                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="w-full h-11 px-4 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                            >
                                {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">OTP</p>
                                    {sekLeft > 0 && <p className="text-xs text-gray-500">Valid: {sekLeft}s</p>}
                                </div>

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone OTP</label>
                                        <input
                                            value={phoneOtp}
                                            onChange={(e) => setPhoneOtp(e.target.value)}
                                            className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                            placeholder="Enter phone OTP"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email OTP</label>
                                        <input
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                            placeholder="Enter email OTP"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('contact')}
                                    className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={!receivedPhoneOtp || !receivedEmailOtp}
                                    className="flex-1 h-11 px-4 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:bg-green-300"
                                >
                                    Verify OTP
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'details' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-purple-700 mb-1.5">Fullname</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-700" />
                                        <input
                                            value={fullname}
                                            onChange={(e) => setFullname(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                            placeholder="Ali Valiyev"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-orange-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-700" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                            placeholder="@Komol12345"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-sky-700 mb-1.5">Expirence</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={expirence}
                                        onChange={(e) => setExpirence(Number(e.target.value))}
                                        className="w-full h-11 px-4 bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                                        placeholder="3"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('otp')}
                                    disabled={isCreatingTeacher}
                                    className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={isCreatingTeacher}
                                    className="flex-1 h-11 px-4 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:bg-green-300"
                                >
                                    {isCreatingTeacher ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
