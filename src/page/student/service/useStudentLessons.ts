import { useQuery } from '@tanstack/react-query';
import { request } from '../../../config/request';

export interface StudentLessonsParams {
    status?: string;
    weekday?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface StudentLesson {
    id: number;
    lessonName?: string;
    lessonPrice?: number;
    weekday?: string;
    startTime?: number | string;
    finishTime?: number | string;
    endTime?: number | string;
    status?: string;
    isPaid?: boolean;
    meetLink?: string;
    teacherId?: number;
    [key: string]: any;
}

export interface StudentLessonsResponse {
    data: StudentLesson[];
    meta?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
    };
}

export const useStudentLessons = (studentId: number | undefined, params: StudentLessonsParams = {}) => {
    return useQuery<StudentLessonsResponse>({
        queryKey: ['student-lessons', studentId, params],
        enabled: typeof studentId === 'number' && studentId > 0,
        queryFn: async () => {
            const res = await request.get<StudentLessonsResponse>(`/lesson-template/student/${studentId}`, {
                params: {
                    status: params.status,
                    weekday: params.weekday,
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
