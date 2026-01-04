import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { message } from 'antd';
import type { Teacher } from '../service/useGetTeachers';
import { useConfirmTelEmail } from '../service/useConfirmTeacherOtp';
import { useUpdateTeacher } from '../service/useUpdateTeacher';

interface TeacherEditModalProps {
    open: boolean;
    teacher: Teacher | null;
    onClose: () => void;
    onUpdated: () => void;
}

export const TeacherEditModal: React.FC<TeacherEditModalProps> = ({ open, teacher, onClose, onUpdated }) => {
    const { mutate: sendTelEmailOtp, isPending: isSendingOtp } = useConfirmTelEmail();
    const { mutate: updateTeacher, isPending: isUpdatingTeacher } = useUpdateTeacher();

    const [form, setForm] = useState({
        email: '',
        phoneNumber: '',
        fullname: '',
        password: '',
        expirence: 0,
        cardNumber: '',
        portfolioLink: '',
    });

    const [original, setOriginal] = useState({ email: '', phoneNumber: '' });

    const [receivedPhoneOtp, setReceivedPhoneOtp] = useState<string>('');
    const [receivedEmailOtp, setReceivedEmailOtp] = useState<string>('');
    const [phoneOtp, setPhoneOtp] = useState<string>('');
    const [emailOtp, setEmailOtp] = useState<string>('');
    const [phoneOtpSent, setPhoneOtpSent] = useState<boolean>(false);
    const [emailOtpSent, setEmailOtpSent] = useState<boolean>(false);

    useEffect(() => {
        if (!teacher || !open) return;
        const originalEmail = teacher.email || '';
        const originalPhone = teacher.phoneNumber || '';
        setForm({
            email: originalEmail,
            phoneNumber: originalPhone,
            fullname: teacher.fullname || '',
            password: '',
            expirence: Number((teacher as any).expirence || 0),
            cardNumber: String((teacher as any).cardNumber || ''),
            portfolioLink: String((teacher as any).portfolioLink || ''),
        });
        setOriginal({ email: originalEmail, phoneNumber: originalPhone });
        setReceivedPhoneOtp('');
        setReceivedEmailOtp('');
        setPhoneOtp('');
        setEmailOtp('');
        setPhoneOtpSent(false);
        setEmailOtpSent(false);
    }, [teacher, open]);

    const emailChanged = (form.email || '') !== (original.email || '');
    const phoneChanged = (form.phoneNumber || '') !== (original.phoneNumber || '');

    const phoneVerified = useMemo(() => {
        if (!phoneChanged) return true;
        if (!phoneOtpSent || !receivedPhoneOtp) return true;
        return phoneOtp === receivedPhoneOtp;
    }, [phoneChanged, phoneOtpSent, receivedPhoneOtp, phoneOtp]);

    const emailVerified = useMemo(() => {
        if (!emailChanged) return true;
        if (!emailOtpSent || !receivedEmailOtp) return true;
        return emailOtp === receivedEmailOtp;
    }, [emailChanged, emailOtpSent, receivedEmailOtp, emailOtp]);

    const handleSendPhoneOtp = () => {
        if (!form.phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        if (!form.email.trim()) {
            message.warning('Email is required');
            return;
        }
        sendTelEmailOtp(
            { email: form.email, phoneNumber: form.phoneNumber },
            {
                onSuccess: (data: any) => {
                    setReceivedPhoneOtp(data?.data?.phoneOtp || '');
                    setPhoneOtpSent(true);
                },
            } as any,
        );
    };

    const handleSendEmailOtp = () => {
        if (!form.email.trim()) {
            message.warning('Email is required');
            return;
        }
        if (!form.phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        sendTelEmailOtp(
            { email: form.email, phoneNumber: form.phoneNumber },
            {
                onSuccess: (data: any) => {
                    setReceivedEmailOtp(data?.data?.emailOtp || '');
                    setEmailOtpSent(true);
                },
            } as any,
        );
    };

    const handleSave = () => {
        if (!teacher?.id) return;
        if (!form.fullname.trim()) {
            message.warning('fullname is required');
            return;
        }
        if (!form.email.trim()) {
            message.warning('email is required');
            return;
        }
        if (!form.phoneNumber.trim()) {
            message.warning('phoneNumber is required');
            return;
        }

        if ((phoneOtpSent && !phoneVerified) || (emailOtpSent && !emailVerified)) {
            message.warning('OTP noto\'g\'ri yoki kiritilmagan. Iltimos OTP ni to\'g\'ri kiriting.');
            return;
        }

        updateTeacher(
            {
                id: teacher.id,
                email: form.email,
                phoneNumber: form.phoneNumber,
                fullname: form.fullname,
                password: form.password,
                expirence: Number(form.expirence || 0),
                cardNumber: form.cardNumber || undefined,
                portfolioLink: form.portfolioLink || undefined,
            } as any,
            {
                onSuccess: () => {
                    onClose();
                    onUpdated();
                },
            } as any,
        );
    };

    if (!open || !teacher) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Teacher</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-semibold text-purple-600 mb-1.5">Fullname</label>
                            <input
                                value={form.fullname}
                                onChange={(e) => setForm((p) => ({ ...p, fullname: e.target.value }))}
                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200"
                                placeholder="Ali Valiyev"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-semibold text-sky-600 mb-1.5">Experience</label>
                            <input
                                type="number"
                                value={form.expirence}
                                onChange={(e) => setForm((p) => ({ ...p, expirence: Number(e.target.value) }))}
                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition-all duration-200"
                                placeholder="3"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-semibold text-blue-600 mb-1.5">Email</label>
                            <div className="flex gap-2">
                                <input
                                    value={form.email}
                                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                    className={`flex-1 px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 ${emailChanged ? 'ring-2 ring-orange-300' : ''}`}
                                    placeholder="teacher@mail.com"
                                />
                                {emailChanged && (
                                    <button
                                        type="button"
                                        onClick={handleSendEmailOtp}
                                        disabled={isSendingOtp}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                    >
                                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-semibold text-green-600 mb-1.5">Phone Number</label>
                            <div className="flex gap-2">
                                <input
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                                    className={`flex-1 px-3.5 py-2.5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 ${phoneChanged ? 'ring-2 ring-orange-300' : ''}`}
                                    placeholder="+998901234567"
                                />
                                {phoneChanged && (
                                    <button
                                        type="button"
                                        onClick={handleSendPhoneOtp}
                                        disabled={isSendingOtp}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                    >
                                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-semibold text-orange-600 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200"
                                placeholder="@Komol12345"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-semibold text-violet-600 mb-1.5">Card Number</label>
                            <input
                                value={form.cardNumber}
                                onChange={(e) => setForm((p) => ({ ...p, cardNumber: e.target.value }))}
                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all duration-200"
                                placeholder="8600123412341234"
                            />
                        </div>

                        <div className="md:col-span-2 group">
                            <label className="block text-xs font-semibold text-amber-600 mb-1.5">Portfolio Link</label>
                            <input
                                value={form.portfolioLink}
                                onChange={(e) => setForm((p) => ({ ...p, portfolioLink: e.target.value }))}
                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-200"
                                placeholder="https://github.com/teacher"
                            />
                        </div>
                    </div>

                    {(phoneChanged || emailChanged) && (phoneOtpSent || emailOtpSent) && (
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs font-semibold text-yellow-900">Test OTP</p>
                                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="text-xs text-yellow-900">
                                        <span className="font-semibold">Phone OTP:</span>{' '}
                                        <span className="font-mono">{receivedPhoneOtp || '-'}</span>
                                    </div>
                                    <div className="text-xs text-yellow-900">
                                        <span className="font-semibold">Email OTP:</span>{' '}
                                        <span className="font-mono">{receivedEmailOtp || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {phoneChanged && (
                                    <div className="p-3 border border-gray-200 rounded-lg bg-white">
                                        <p className="text-sm font-semibold text-gray-900">Phone OTP</p>
                                        <input
                                            value={phoneOtp}
                                            onChange={(e) => setPhoneOtp(e.target.value)}
                                            placeholder="Enter phone OTP"
                                            className="mt-2 w-full px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                )}

                                {emailChanged && (
                                    <div className="p-3 border border-gray-200 rounded-lg bg-white">
                                        <p className="text-sm font-semibold text-gray-900">Email OTP</p>
                                        <input
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            placeholder="Enter email OTP"
                                            className="mt-2 w-full px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdatingTeacher}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isUpdatingTeacher || (phoneOtpSent && !phoneVerified) || (emailOtpSent && !emailVerified)}
                            className="flex-1 px-4 py-2.5 bg-linear-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-semibold hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isUpdatingTeacher ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
