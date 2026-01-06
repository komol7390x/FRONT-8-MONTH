import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTeacherRegisterStep3 } from '../service/teacher-auth';
import { useTeacherLogin } from '../service/teacher-auth';
import Cookies from 'js-cookie';
import { TokenName } from '../../../../config/enum';

type LocationState = {
    phoneNumber?: string;
    password?: string;
    otp?: string;
    sek?: number;
    id?: number;
};

const STORAGE_KEY_STEP2 = 'teacher_register_step2';
const STORAGE_KEY_STEP3 = 'teacher_register_step3';

export const RegisterTeacherStep3: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state || {}) as LocationState;
    const { mutate: registerStep3, isPending } = useTeacherRegisterStep3();
    const { mutate: loginTeacher, isPending: isLoginPending } = useTeacherLogin();

    const [otp, setOtp] = useState(state.otp || '');
    const [sekLeft, setSekLeft] = useState<number>(Number(state.sek || 0));

    useEffect(() => {
        const hasState = !!(state.phoneNumber || state.password || state.otp || state.id);
        if (hasState) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY_STEP3);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.otp && !otp) setOtp(String(parsed.otp));
            if (parsed?.sek && !sekLeft) setSekLeft(Number(parsed.sek) || 0);
        } catch {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!sekLeft) return;
        const t = window.setInterval(() => {
            setSekLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    window.clearInterval(t);
                    return 0;
                }
                return next;
            });
        }, 1000);
        return () => window.clearInterval(t);
    }, [sekLeft]);

    const handleFinish = () => {
        if (!otp.trim()) {
            message.warning('OTP kiriting');
            return;
        }

        registerStep3(
            { otp: Number(otp) } as any,
            {
                onSuccess: () => {
                    const phoneNumber = String(state.phoneNumber || '').trim();
                    const password = String(state.password || '').trim();

                    if (!phoneNumber || !password) {
                        message.success('Register done');
                        navigate('/teacher/login', { replace: true });
                        return;
                    }

                    loginTeacher(
                        { phoneNumber, password } as any,
                        {
                            onSuccess: (res: any) => {
                                const token = res?.data?.token ?? res?.token ?? res?.accessToken ?? res?.data?.accessToken;
                                if (!token) {
                                    message.success('Register done');
                                    navigate('/teacher/login', { replace: true });
                                    return;
                                }
                                Cookies.set(TokenName.TOKEN_NAME, token);
                                try {
                                    localStorage.removeItem(STORAGE_KEY_STEP2);
                                    localStorage.removeItem(STORAGE_KEY_STEP3);
                                } catch {
                                    // ignore
                                }
                                navigate('/teacher-panel', { replace: true });
                            },
                            onError: () => {
                                message.success('Register done');
                                navigate('/teacher/login', { replace: true });
                            },
                        } as any,
                    );
                },
                onError: (err: any) => {
                    message.error(err?.response?.data?.message || 'OTP xatolik');
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
                    <h2 className="text-xl font-bold text-gray-900">Register Step 3 (OTP)</h2>
                    <Link to="/teacher/login" className="text-sm font-semibold text-blue-600 hover:underline">Login</Link>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs font-semibold text-gray-700">Teacher</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">ID: {state.id ?? '-'}</div>
                        {(state.phoneNumber || state.password) && (
                            <div className="mt-2 text-xs text-gray-600">
                                {state.phoneNumber ? `Phone: ${state.phoneNumber}` : ''}
                            </div>
                        )}
                        {!!sekLeft && (
                            <div className="mt-2 text-xs text-gray-500">OTP valid: {sekLeft}s</div>
                        )}
                    </div>

                    {!!otp && sekLeft > 0 && (
                        <div className="rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xs font-semibold text-blue-700">OTP</div>
                                    <div className="mt-1 text-sm text-gray-900 font-semibold">
                                        <span className="font-mono">{otp}</span>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-blue-700 whitespace-nowrap">{sekLeft}s</div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">OTP</label>
                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                            placeholder="123456"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/teacher/register/step-2', { state })}
                            className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleFinish}
                            disabled={isPending || isLoginPending}
                            className="flex-1 h-11 px-4 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:bg-green-300"
                        >
                            {isPending || isLoginPending ? 'Verifying...' : 'Finish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
