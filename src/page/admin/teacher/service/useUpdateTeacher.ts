import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import { message } from 'antd';

export interface UpdateTeacherPayload {
    id: number;
    email: string;
    phoneNumber: string;
    fullname: string;
    password: string;
    expirence: number;
    cardNumber?: string;
    portfolioLink?: string;
}

export const useUpdateTeacher = () => {
    return useMutation({
        mutationFn: async (payload: UpdateTeacherPayload) => {
            const { id, ...body } = payload;
            const res = await request.patch(`/teacher/${id}`, body);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Teacher updated');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update teacher';
            message.error(errorMessage);
        },
    });
};
