import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../../config/request';

export interface LessonTemplateParams {
    status?: string;
    weekday?: string;
    teacherId?: number;
    studentId?: number;
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface LessonTemplateResponse {
    data: any[];
    meta?: {
        totalItems?: number;
        itemCount?: number;
        itemsPerPage?: number;
        totalPages?: number;
        currentPage?: number;
    };
}

export const useLessonTemplates = (params: LessonTemplateParams = {}) => {
    return useQuery<LessonTemplateResponse>({
        queryKey: ['lesson-template', params],
        queryFn: async () => {
            const res = await request.get<LessonTemplateResponse>('/lesson-template', {
                params: {
                    status: params.status,
                    weekday: params.weekday,
                    teacherId: params.teacherId,
                    studentId: params.studentId,
                    active: params.active,
                    search: params.search,
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
