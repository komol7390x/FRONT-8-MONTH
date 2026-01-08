import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export const useHardDeleteStudent = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await request.delete(`/student/delete/${id}`);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Student permanently deleted');
            client.invalidateQueries({ queryKey: ['students'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to hard delete student';
            message.error(errorMessage);
        },
    });
};
