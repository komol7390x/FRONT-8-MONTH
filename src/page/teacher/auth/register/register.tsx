import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import { message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    useTeacherConfirmTelEmail,
    useTeacherCreate,
} from '../service/teacher-auth';

type Step = 'contact' | 'otp' | 'details';

export const RegisterTeacher: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mutate: confirmTelEmail, isPending: isSendingOtp } = useTeacherConfirmTelEmail();
    const { mutate: createTeacher, isPending: isCreating } = useTeacherCreate();

    const [step, setStep] = useState<Step>('contact');

    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [receivedPhoneOtp, setReceivedPhoneOtp] = useState<string>('');
    const [receivedEmailOtp, setReceivedEmailOtp] = useState<string>('');
    const [phoneOtp, setPhoneOtp] = useState<string>('');
    const [emailOtp, setEmailOtp] = useState<string>('');
    const [otpSekLeft, setOtpSekLeft] = useState<number>(0);

    const [fullname, setFullname] = useState('');
    const [password, setPassword] = useState('');
    const [expirence, setExpirence] = useState<number>(0);

    const stepIndex: 1 | 2 | 3 = step === 'contact' ? 1 : step === 'otp' ? 2 : 3;

    const steps = useMemo(() => [1, 2, 3], []);

    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const stepParam = sp.get('step');
        const idParam = sp.get('id');
        const emailParam = sp.get('email');
        const nameParam = sp.get('name');

        if (stepParam === '2' && idParam) {
            const id = Number(idParam);
            if (Number.isFinite(id) && id > 0) {
                navigate('/teacher/google/step-2', {
                    replace: true,
                    state: {
                        id,
                        email: emailParam ? String(emailParam) : '',
                        name: nameParam ? String(nameParam) : '',
                    },
                });
            }
        }
    }, [location.search]);

    useEffect(() => {
        if (!otpSekLeft) return;
        const t = window.setInterval(() => {
            setOtpSekLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    window.clearInterval(t);
                    return 0;
                }
                return next;
            });
        }, 1000);
        return () => window.clearInterval(t);
    }, [otpSekLeft]);

    const handleSendOtp = () => {
        if (!email.trim()) {
            message.warning('Email is required');
            return;
        }
        if (!phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }

        confirmTelEmail(
            { email, phoneNumber },
            {
                onSuccess: (data: any) => {
                    const raw: any = data?.data ?? data;
                    const p = String(raw?.data?.phoneOtp ?? raw?.phoneOtp ?? '');
                    const e = String(raw?.data?.emailOtp ?? raw?.emailOtp ?? '');
                    setPhoneOtp(p);
                    setEmailOtp(e);
                    setReceivedPhoneOtp(p);
                    setReceivedEmailOtp(e);
                    setOtpSekLeft(Number(raw?.data?.sek ?? raw?.sek ?? 30) || 30);
                    setStep('otp');
                    message.success('OTP yuborildi');
                },
                onError: (err: any) => {
                    message.error(err?.response?.data?.message || 'OTP yuborishda xatolik');
                },
            } as any,
        );
    };

    const handleVerifyOtp = () => {
        if (!receivedPhoneOtp || !receivedEmailOtp) {
            message.warning('OTP kelmadi, qayta yuboring');
            return;
        }
        if (!phoneOtp.trim() || !emailOtp.trim()) {
            message.warning('Phone OTP va Email OTP kiriting');
            return;
        }
        if (phoneOtp !== receivedPhoneOtp || emailOtp !== receivedEmailOtp) {
            message.warning('OTP xato');
            return;
        }
        setStep('details');
    };

    const handleCreate = () => {
        if (!email.trim() || !phoneNumber.trim()) {
            message.warning('Email and phone are required');
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
                onSuccess: (res: any) => {
                    const id = Number(res?.data?.id ?? res?.id ?? res?.data?.data?.id);
                    if (!Number.isFinite(id) || id <= 0) {
                        message.error('Teacher ID topilmadi (create response)');
                        return;
                    }

                    navigate('/teacher/register/step-2', {
                        replace: true,
                        state: { id, phoneNumber, password },
                    });
                },
                onError: (err: any) => {
                    message.error(err?.response?.data?.message || 'Create teacher xatolik');
                },
            } as any,
        );
    };

    const Stepper = () => (
        <div className="flex items-center gap-3 mb-4">
            {steps.map((n) => {
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
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                {(phoneOtp || emailOtp) && otpSekLeft > 0 && (
                    <div className="mb-4 rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-xs font-semibold text-blue-700">SMS / Email OTP</div>
                                <div className="mt-1 text-sm text-gray-900 font-semibold">
                                    Phone: <span className="font-mono">{phoneOtp || '-'}</span>
                                    <span className="mx-2 text-gray-400">|</span>
                                    Email: <span className="font-mono">{emailOtp || '-'}</span>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-blue-700 whitespace-nowrap">{otpSekLeft}s</div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <UserPlus size={20} className="text-green-700" />
                        <h2 className="text-2xl font-bold text-gray-900">Add Teacher</h2>
                    </div>
                    <Link to="/teacher/login" className="text-sm font-semibold text-blue-600 hover:underline">Login</Link>
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
                                </div>

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone OTP</label>
                                        <input
                                            value={phoneOtp}
                                            onChange={(e) => setPhoneOtp(e.target.value)}
                                            className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                            placeholder="123456"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email OTP</label>
                                        <input
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                                            placeholder="123456"
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
