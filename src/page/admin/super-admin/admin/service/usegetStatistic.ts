import { request } from '../../../../../config/request';
import { useQuery } from '@tanstack/react-query';

interface UserStats {
    all: number;
    active: number;
    blocked: number;
    deleted: number;
}

export const useGetStatistic = () => {
    return useQuery({
        queryKey: ['getStatistic'],
        queryFn: () => request.get('/statistica/admin').then(res => res.data),
        select: (data) => data as UserStats,

        staleTime: Infinity,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });
}