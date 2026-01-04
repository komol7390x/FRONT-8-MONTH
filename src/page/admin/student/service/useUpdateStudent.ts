import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import { message } from 'antd';

export interface UpdateStudentPayload {
    phoneNumber?: string;
    tgId?: string;
    lastName?: string;
    firstName?: string;
    tgUsername?: string;
    blockedReason?: string;
}

export const useUpdateStudent = () => {
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateStudentPayload }) => {
            const res = await request.patch(`/student/update/${id}`, payload);
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
