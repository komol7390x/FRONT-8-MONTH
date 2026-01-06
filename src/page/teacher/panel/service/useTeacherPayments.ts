import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export interface TeacherPaymentItem {
    id: number;
    amount?: number;
    status?: string;
    createdAt?: string;
    [key: string]: any;
}

export interface TeacherPaymentsResponse {
    data: TeacherPaymentItem[];
    meta?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
    };
}

export interface TeacherPaymentsParams {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export const useTeacherPayments = (params: TeacherPaymentsParams = {}) => {
    return useQuery<TeacherPaymentsResponse>({
        queryKey: ['teacher-payments', params],
        queryFn: async () => {
            const res = await request.get<TeacherPaymentsResponse>('/payment/user', {
                params: {
                    status: params.status,
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
