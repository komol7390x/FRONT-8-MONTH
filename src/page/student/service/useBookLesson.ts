import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../config/request';
import { message } from 'antd';

interface BookLessonParams {
    studentId: number;
    lessonId: number;
}

export const useBookLesson = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({ studentId, lessonId }: BookLessonParams) => {
            // Based on user input: /lesson-template/booked-by-student/21?lessonId=21212
            // We assume 21 is studentId.
            const res = await request.post(`/lesson-template/booked-by-student/${studentId}`, null, {
                params: { lessonId }
            });
            return res.data;
        },
        onSuccess: () => {
            message.success('Lesson booked successfully');
            client.invalidateQueries({ queryKey: ['student-schedule'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to book lesson');
        }
    });
};
