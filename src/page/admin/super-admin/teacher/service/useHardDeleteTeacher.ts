import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export const useHardDeleteTeacher = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await request.delete(`/teacher/delete/${id}`);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Teacher permanently deleted');
            client.invalidateQueries({ queryKey: ['teachers'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to hard delete teacher';
            message.error(errorMessage);
        },
    });
};
