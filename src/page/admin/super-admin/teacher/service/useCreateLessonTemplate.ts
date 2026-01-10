import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface CreateLessonTemplatePayload {
    lessonId: number;
    startTime: number;
    finishTime: number;
    studentId: number;
}

export const useCreateLessonTemplate = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateLessonTemplatePayload) => {
            console.log(11111,payload);
            const res = await request.post(`/lesson-template/booked-by-student/${payload.studentId}`, {
                startTime: payload.startTime,
                finishTime: payload.finishTime,
            }, {
                params: {
                    lessonId: payload.lessonId,
                },
            });
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Weekly lessons created successfully');
            client.invalidateQueries({ queryKey: ['lesson-template'] });
            client.invalidateQueries({ queryKey: ['teacher-lessons'] });
            client.invalidateQueries({ queryKey: ['student-lessons'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create weekly lessons';
            message.error(errorMessage);
        },
    });
};
