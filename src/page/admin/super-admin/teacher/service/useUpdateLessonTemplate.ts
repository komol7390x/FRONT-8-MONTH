import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface UpdateLessonTemplatePayload {
    id: number;
    startTime: number;
    finishTime: number;
    lessonName: string;
    lessonPrice: number;
}

export const useUpdateLessonTemplate = () => {
    return useMutation({
        mutationFn: async (payload: UpdateLessonTemplatePayload) => {
            const { id, ...body } = payload;
            const res = await request.patch(`/lesson-template/${id}`, body);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Lesson updated');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update lesson';
            message.error(errorMessage);
        },
    });
};
