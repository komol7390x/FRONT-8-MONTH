import React, { useEffect, useState } from 'react';
import { Lock, Phone } from 'lucide-react';
import { message } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTeacherRegisterStep2 } from '../service/teacher-auth';

type LocationState = {
    phoneNumber?: string;
    password?: string;
};

const STORAGE_KEY = 'teacher_register_step2';
const STORAGE_KEY_STEP3 = 'teacher_register_step3';

export const RegisterTeacherStep2: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state || {}) as LocationState;
    const { mutate: registerStep2, isPending } = useTeacherRegisterStep2();

    const [phoneNumber, setPhoneNumber] = useState(state.phoneNumber || '');
    const [password, setPassword] = useState(state.password || '');

    useEffect(() => {
        const hasState = !!(state.phoneNumber || state.password);
        if (hasState) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.phoneNumber && !phoneNumber) setPhoneNumber(String(parsed.phoneNumber));
            if (parsed?.password && !password) setPassword(String(parsed.password));
        } catch {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ phoneNumber: String(phoneNumber || ''), password: String(password || '') }),
            );
        } catch {
            // ignore
        }
    }, [password, phoneNumber]);

    const handleContinue = () => {
        if (!phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        if (!password.trim()) {
            message.warning('Password is required');
            return;
        }

        registerStep2(
            { phoneNumber, password } as any,
            {
                onSuccess: (res: any) => {
                    const raw: any = res?.data ?? res;
                    const otpValue = String(raw?.data?.otp ?? raw?.otp ?? '');
                    const sekValue = Number(raw?.data?.sek ?? raw?.sek ?? 0);
                    const teacherId = Number(raw?.data?.id ?? raw?.id ?? 0);

                    try {
                        localStorage.setItem(
                            STORAGE_KEY_STEP3,
                            JSON.stringify({
                                phoneNumber,
                                password,
                                otp: otpValue,
                                sek: sekValue,
                                id: teacherId,
                            }),
                        );
                    } catch {
                        // ignore
                    }

                    navigate('/teacher/register/step-3', {
                        state: {
                            phoneNumber,
                            password,
                            otp: otpValue,
                            sek: sekValue,
                            id: teacherId,
                        },
                    });
                },
                onError: (err: any) => {
                    message.error(err?.response?.data?.message || 'Register step2 xatolik');
                },
            } as any,
        );
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                    >
                        Back
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">Register Step 2</h2>
                    <Link to="/teacher/login" className="text-sm font-semibold text-blue-600 hover:underline">Login</Link>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-green-700 mb-1.5">Phone</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700" />
                            <input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
                                placeholder="Phone"
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
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/teacher/register')}
                            className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={isPending}
                            className="flex-1 h-11 px-4 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:bg-green-300"
                        >
                            {isPending ? 'Saving...' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
