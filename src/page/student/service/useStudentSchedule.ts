import { useQuery } from '@tanstack/react-query';
import { request } from '../../../config/request';

export interface StudentScheduleParams {
    teacherId?: number;
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    day?: string;
}

export interface StudentScheduleResponse {
    data: any[];
    meta?: {
        totalItems?: number;
        itemCount?: number;
        itemsPerPage?: number;
        totalPages?: number;
        currentPage?: number;
    };
    stats?: {
        active?: number;
        blocked?: number;
        [key: string]: any;
    };
}

export const useStudentSchedule = (params: StudentScheduleParams = {}) => {
    return useQuery<StudentScheduleResponse>({
        queryKey: ['student-schedule', params],
        queryFn: async () => {
            const res = await request.get('/schedule', {
                params: {
                    teacherId: params.teacherId,
                    active: params.active,
                    search: params.search,
                    page: params.page,
                    limit: params.limit,
                    day: params.day,
                },
            });

            const raw: any = res.data;
            const dataArray = Array.isArray(raw?.data) ? raw.data : [];
            const meta = raw?.meta;

            return {
                data: dataArray,
                meta,
            };
        },
    });
};
