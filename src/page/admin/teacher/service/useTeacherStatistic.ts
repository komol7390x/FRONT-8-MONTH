import { request } from '../../../../config/request';
import { useQuery } from '@tanstack/react-query';

export interface TeacherStats {
    all: number;
    active: number;
    inactive: number;
    deleted: number;
}

export const useTeacherStatistic = () => {
    return useQuery({
        queryKey: ['teacher-statistic'],
        queryFn: () => request.get('/statistica/teacher').then(res => res.data),
        select: (data) => data as TeacherStats,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });
};
