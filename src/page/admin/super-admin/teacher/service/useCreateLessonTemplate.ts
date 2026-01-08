import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface CreateLessonTemplatePayload {
    startTime: number;
    finishTime: number;
    lessonName: string;
    lessonPrice: number;
    teacherId: number;
    studentId?: number;
}

export const useCreateLessonTemplate = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateLessonTemplatePayload) => {
            const res = await request.post('/lesson-template/create-lesson', payload);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Lesson created');
            client.invalidateQueries({ queryKey: ['teacher-lessons'] });
            client.invalidateQueries({ queryKey: ['student-lessons'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create lesson';
            message.error(errorMessage);
        },
    });
};
