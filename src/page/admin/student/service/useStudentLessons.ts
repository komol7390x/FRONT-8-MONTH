import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export interface LessonTemplateResponse {
    data: any[];
    meta?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
    };
}

export interface LessonTemplateParams {
    page?: number;
    limit?: number;
}

export const useStudentLessons = (studentId: number | undefined, params: LessonTemplateParams = {}) => {
    return useQuery<LessonTemplateResponse>({
        queryKey: ['student-lessons', studentId, params],
        enabled: !!studentId,
        queryFn: async () => {
            const res = await request.get<LessonTemplateResponse>('/lesson-template', {
                params: {
                    studentId,
                    page: params.page,
                    limit: params.limit,
                },
            });
            return res.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
};
