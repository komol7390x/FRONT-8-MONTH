import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../../config/request';

export const PaymentStatus = {
    PENDING: 'pending',
    PAID: 'paid',
    PENDING_CANCELED: 'pendingCanceled',
    PAID_CANCELED: 'paidCanceled',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface PaymentItem {
    id: number;
    active?: boolean;
    status?: PaymentStatus | string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export interface GetPaymentsParams {
    search?: string;
    active?: boolean;
    role?: string;
    status?: PaymentStatus | string;
    page?: number;
    limit?: number;
}

export interface GetPaymentsResponse {
    data: PaymentItem[];
    meta?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
    };
}

export const usePayments = (params: GetPaymentsParams = {}) => {
    return useQuery<GetPaymentsResponse>({
        queryKey: ['payments', params],
        queryFn: async () => {
            const queryParams: any = {
                page: params.page,
                limit: params.limit,
            };

            if (params.search?.trim()) queryParams.search = params.search.trim();
            if (typeof params.active === 'boolean') queryParams.active = params.active;
            if (params.role) queryParams.role = params.role;
            if (params.status) queryParams.status = params.status;

            const res = await request.get<GetPaymentsResponse>('/payment', { params: queryParams });
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
