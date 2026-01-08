import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export interface TeacherLessonTemplate {
    id: number;
    lessonName?: string;
    lessonPrice?: number;
    weekday?: string;
    startTime?: number | string;
    finishTime?: number | string;
    status?: string;
    isPaid?: boolean;
    [key: string]: any;
}

export interface TeacherLessonsResponse {
    data: TeacherLessonTemplate[];
    meta?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
    };
}

export interface TeacherLessonsParams {
    status?: string;
    weekday?: string;
    isPaid?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export const useTeacherLessons = (params: TeacherLessonsParams = {}) => {
    return useQuery<TeacherLessonsResponse>({
        queryKey: ['teacher-lessons', params],
        queryFn: async () => {
            const res = await request.get<TeacherLessonsResponse>('/schedule/teacher', {
                params: {
                    status: params.status,
                    weekday: params.weekday,
                    isPaid: typeof params.isPaid === 'boolean' ? String(params.isPaid) : undefined,
                    search: params.search,
                    page: params.page,
                    limit: params.limit,
                },
            });

            const raw: any = res.data;
            const nested = raw?.data?.data ? raw.data : undefined;
            const dataArray = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.data)
                    ? raw.data
                    : Array.isArray(nested?.data)
                        ? nested.data
                        : [];

            const meta = raw?.meta || raw?.data?.meta || nested?.meta;

            return {
                data: dataArray,
                meta,
            };
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
