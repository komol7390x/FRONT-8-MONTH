import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import { message } from 'antd';

export const useStudentIsActive = () => {
    return useMutation({
        mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
            const res = await request.patch(`/student/is-active/${id}`, undefined, {
                params: { active },
            });
            return res.data;
        },
        onSuccess: () => {
            message.success('Student status updated');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update status';
            message.error(errorMessage);
        },
    });
};
