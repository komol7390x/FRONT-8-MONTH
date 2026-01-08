import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface CreateTeacherPayload {
    email: string;
    phoneNumber: string;
    fullname: string;
    password: string;
    expirence: number;
}

export interface CreateTeacherResponse {
    statusCode?: number;
    status?: boolean;
    message?: string;
    data?: {
        id?: number;
    };
}

export const useCreateTeacher = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateTeacherPayload) => {
            const res = await request.post<CreateTeacherResponse>('/teacher/create', payload);
            return res.data;
        },
        onSuccess: (data) => {
            message.success(data?.message || 'Teacher created');
            client.invalidateQueries({ queryKey: ['teachers'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create teacher';
            message.error(errorMessage);
        }
    });
};
