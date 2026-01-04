import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import { message } from 'antd';

export interface CreateStudentPayload {
    phoneNumber: string;
    tgId: string;
    lastName: string;
    firstName: string;
    tgUsername: string;
}

export const useCreateStudent = () => {
    return useMutation({
        mutationFn: async (payload: CreateStudentPayload) => {
            const res = await request.post('/student/crate-student', payload);
            return res.data;
        },
        onSuccess: () => {
            message.success('Student created');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create student';
            message.error(errorMessage);
        },
    });
};
