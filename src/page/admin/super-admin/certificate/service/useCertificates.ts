import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../../config/request';

export interface CertificateListResponse {
    data: any[];
    meta?: {
        totalItems?: number;
        itemCount?: number;
        itemsPerPage?: number;
        totalPages?: number;
        currentPage?: number;
    };
}

export const useCertificates = (
    params: {
        page?: number;
        limit?: number;
        search?: string;
        active?: boolean;
        teacherId?: number;
        status?: boolean;
        isDeleted?: boolean;
    } = {},
) => {
    return useQuery<CertificateListResponse>({
        queryKey: ['certificate-list', params],
        queryFn: async () => {
            const queryParams: any = {
                page: params.page,
                limit: params.limit,
            };

            if (params.search?.trim()) queryParams.search = params.search.trim();
            const activeParam = typeof params.active === 'boolean' ? params.active : params.status;
            if (typeof activeParam === 'boolean') queryParams.active = activeParam;
            if (params.isDeleted !== undefined) queryParams.isDeleted = params.isDeleted;
            if (typeof params.teacherId === 'number') queryParams.teacherId = params.teacherId;

            const res = await request.get<any>('/certificate', { params: queryParams });
            const raw = res.data;
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
