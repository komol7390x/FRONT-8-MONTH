import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../../config/request";

export const SortEnum = {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    USERNAME: 'username',
    FULLNAME: 'fullname',
    PHONENUMBER: 'phoneNumber',
    IS_ACTIVE: 'isActive'
} as const;

type SortType = typeof SortEnum[keyof typeof SortEnum];

export interface Admin {
    id: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    username: string;
    fullname: string;
    password: string;
    phoneNumber: string;
    avatarUrl: string;
    role: 'ADMIN' | 'SUPERADMIN';
}

export interface GetListResponse {
    admins: Admin[];
    totalCount: number;
    page: number;
    limit: number;
}

export interface GetListParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: {
        field: SortType;
        order: 'asc' | 'desc';
    };
    status?: boolean;
    isDeleted?: boolean;
}

export interface GetListResponse {
    data: Admin[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    stats: {
        active: number;
        blocked: number;
        deleted: number;
    };
}

export const useGetList = (params: GetListParams = {}) => {
    return useQuery<GetListResponse>({
        queryKey: ['getlist', params],
        queryFn: async () => {
            const queryParams: any = {
                page: params.page,
                limit: params.limit,
            };

            if (params.search?.trim()) {
                queryParams.search = params.search.trim();
            }

            if (params.sort) {
                queryParams.sortField = params.sort.field;
                queryParams.sortOrder = params.sort.order;
            }

            if (params.status !== undefined) {
                queryParams.status = params.status;
            }

            if (params.isDeleted !== undefined) {
                queryParams.isDeleted = params.isDeleted;
            }

            console.log('API Request Params:', queryParams);

            const res = await request.get<GetListResponse>('/admin/all', {
                params: queryParams
            });

            console.log('API Response:', res.data);

            return res.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
}