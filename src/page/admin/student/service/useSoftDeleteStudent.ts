import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import { message } from 'antd';

export const useSoftDeleteStudent = () => {
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
            const res = await request.delete(`/student/soft-delete/${id}`, {
                params: { status: String(status) },
            });
            return res.data;
        },
        onSuccess: () => {
            message.success('Student updated');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update student';
            message.error(errorMessage);
        },
    });
};
