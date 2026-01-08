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

export const useStudentSchedule = (params: StudentScheduleParams = {}) => {
    return useQuery({
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
            return res.data;
        },
    });
};
