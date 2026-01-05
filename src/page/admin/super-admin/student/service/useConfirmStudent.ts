import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface ConfirmStudentPayload {
    phoneNumber: string;
}

export const useConfirmStudent = () => {
    return useMutation({
        mutationFn: async (payload: ConfirmStudentPayload) => {
            const res = await request.post('/student/confirm', payload);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Phone confirmed');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to confirm phone';
            message.error(errorMessage);
        },
    });
};
