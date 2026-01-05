import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface CreateLessonTemplatePayload {
    startTime: number;
    finishTime: number;
    lessonName: string;
    lessonPrice: number;
    teacherId: number;
}

export const useCreateLessonTemplate = () => {
    return useMutation({
        mutationFn: async (payload: CreateLessonTemplatePayload) => {
            const res = await request.post('/lesson-template/create-lesson', payload);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Lesson created');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create lesson';
            message.error(errorMessage);
        },
    });
};
