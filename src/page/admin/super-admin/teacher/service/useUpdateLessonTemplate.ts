import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface UpdateLessonTemplatePayload {
    id: number;
    startTime: number;
    finishTime: number;
    lessonName?: string;
    lessonPrice?: number;
}

export const useUpdateLessonTemplate = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateLessonTemplatePayload) => {
            const { id, ...body } = payload;
            const filteredBody: any = {};
            Object.keys(body).forEach((k) => {
                const v: any = (body as any)[k];
                if (v !== undefined) filteredBody[k] = v;
            });
            const res = await request.patch(`/lesson-template/${id}`, filteredBody);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Lesson updated');
            client.invalidateQueries({ queryKey: ['teacher-lessons'] });
            client.invalidateQueries({ queryKey: ['student-lessons'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update lesson';
            message.error(errorMessage);
        },
    });
};
