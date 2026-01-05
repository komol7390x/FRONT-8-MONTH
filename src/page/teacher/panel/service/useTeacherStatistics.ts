import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export interface TeacherStatisticsResponse {
    lesson?: number;
    payment?: number;
    [key: string]: any;
}

export const useTeacherStatistics = (teacherId: number | undefined) => {
    return useQuery<TeacherStatisticsResponse>({
        queryKey: ['teacher-statistics', teacherId],
        enabled: typeof teacherId === 'number' && teacherId > 0,
        queryFn: async () => {
            const res = await request.get(`/statistica/teacher/${teacherId}`);
            const raw: any = res.data;
            return (raw?.data ?? raw) as TeacherStatisticsResponse;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
