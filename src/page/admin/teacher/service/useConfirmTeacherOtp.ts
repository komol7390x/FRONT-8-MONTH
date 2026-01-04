import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import { message } from 'antd';

export interface ConfirmTelEmailPayload {
    phoneNumber: string;
    email: string;
}

export interface ConfirmTelEmailResponse {
    statusCode: number;
    status: boolean;
    message: string;
    data: {
        phoneOtp: string;
        emailOtp: string;
        sek: number;
    };
}

export const useConfirmTelEmail = () => {
    return useMutation({
        mutationFn: async (payload: ConfirmTelEmailPayload) => {
            const res = await request.post<ConfirmTelEmailResponse>('/teacher/confirm-tel-email', payload);
            return res.data;
        },
        onSuccess: (data) => {
            message.success(data?.message || 'OTP sent');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send OTP';
            message.error(errorMessage);
        }
    });
};
