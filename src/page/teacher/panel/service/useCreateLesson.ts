import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export interface CreateLessonPayload {
    startTime: number;
    finishTime: number;
    lessonName: string;
    lessonPrice: number;
    teacherId: number;
}

export const useCreateLesson = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateLessonPayload) => {
            const res = await request.post('/lesson-template/create-lesson', payload);
            return res.data;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['teacher-lessons'] });
        },
    });
};
