import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConfirmTelEmail } from './service/useConfirmTeacherOtp';

type LocationState = {
    email?: string;
    phoneNumber?: string;
};

export const TeacherConfirm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state || {}) as LocationState;

    const email = state.email || '';
    const phoneNumber = state.phoneNumber || '';

    const { mutate: sendOtp, isPending: isSending } = useConfirmTelEmail();

    const [receivedPhoneOtp, setReceivedPhoneOtp] = useState<string>('');
    const [receivedEmailOtp, setReceivedEmailOtp] = useState<string>('');
    const [sek, setSek] = useState<number>(0);

    const [phoneOtp, setPhoneOtp] = useState<string>('');
    const [emailOtp, setEmailOtp] = useState<string>('');

    const phoneVerified = useMemo(() => !!receivedPhoneOtp && phoneOtp === receivedPhoneOtp, [phoneOtp, receivedPhoneOtp]);
    const emailVerified = useMemo(() => !!receivedEmailOtp && emailOtp === receivedEmailOtp, [emailOtp, receivedEmailOtp]);
    const allVerified = phoneVerified && emailVerified;

    useEffect(() => {
        if (!email || !phoneNumber) {
            navigate('/super-admin/teacher/create', { replace: true });
        }
    }, [email, phoneNumber, navigate]);

    const handleSend = () => {
        if (!email || !phoneNumber) return;
        sendOtp(
            { email, phoneNumber },
            {
                onSuccess: (data: any) => {
                    setReceivedPhoneOtp(data?.data?.phoneOtp || '');
                    setReceivedEmailOtp(data?.data?.emailOtp || '');
                    setSek(Number(data?.data?.sek || 0));
                },
            } as any,
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Confirm Teacher</h1>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold">Teacher Info</p>
                            <p className="mt-1"><span className="font-medium">Email:</span> {email}</p>
                            <p><span className="font-medium">Phone:</span> {phoneNumber}</p>
                            {sek > 0 && <p className="text-xs text-gray-500 mt-2">OTP valid: {sek}s</p>}
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isSending}
                            className="w-full px-4 py-2.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSending ? 'Sending OTP...' : 'Send OTP (Phone + Email)'}
                        </button>

                        {(receivedPhoneOtp || receivedEmailOtp) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900">Phone OTP</p>
                                        {phoneVerified ? (
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Verified</span>
                                        ) : (
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">Pending</span>
                                        )}
                                    </div>
                                    {receivedPhoneOtp && (
                                        <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                                            Test OTP: <span className="font-mono font-bold">{receivedPhoneOtp}</span>
                                        </div>
                                    )}
                                    <input
                                        value={phoneOtp}
                                        onChange={(e) => setPhoneOtp(e.target.value)}
                                        placeholder="Enter phone OTP"
                                        className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>

                                <div className="p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900">Email OTP</p>
                                        {emailVerified ? (
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Verified</span>
                                        ) : (
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">Pending</span>
                                        )}
                                    </div>
                                    {receivedEmailOtp && (
                                        <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                                            Test OTP: <span className="font-mono font-bold">{receivedEmailOtp}</span>
                                        </div>
                                    )}
                                    <input
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value)}
                                        placeholder="Enter email OTP"
                                        className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/super-admin/teacher/create')}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={!allVerified}
                                onClick={() => navigate('/super-admin/teacher/all')}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
