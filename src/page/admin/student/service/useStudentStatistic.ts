import { request } from '../../../../config/request';
import { useQuery } from '@tanstack/react-query';

export interface StudentStats {
    all: number;
    active: number;
    inactive: number;
    deleted: number;
}

export const useStudentStatistic = () => {
    return useQuery({
        queryKey: ['student-statistic'],
        queryFn: () => request.get('/statistica/student').then((res) => res.data),
        select: (data) => data as StudentStats,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });
};
