import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export const useSoftDeleteTeacher = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
            const res = await request.delete(`/teacher/soft-delete/${id}`, {
                params: { status },
            });
            return res.data;
        },
        onSuccess: (data: any, variables) => {
            message.success(data?.message || 'Success');
            client.invalidateQueries({ queryKey: ['teachers'] });
            client.invalidateQueries({ queryKey: ['teacher', variables.id] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete teacher';
            message.error(errorMessage);
        },
    });
};
