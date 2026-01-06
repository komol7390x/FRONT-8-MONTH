import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../../config/request';

export const StudentSort = {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    TG_USERNAME: 'tgUsername',
} as const;

export type StudentSort = (typeof StudentSort)[keyof typeof StudentSort];

export interface Student {
    id: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    phoneNumber: string;
    tgId: string;
    lastName: string;
    firstName: string;
    wallet: string;
    role: string;
    tgUsername: string;
    blockedAt: string | null;
    blockedReason: string | null;
}

export interface GetStudentsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: boolean;
    sort?: StudentSort;
    isDeleted?: boolean;
}

export interface GetStudentsResponse {
    data: Student[];
    meta?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
    };
    stats?: {
        active?: number;
        inactive?: number;
        deleted?: number;
    };
}

export const useGetStudents = (params: GetStudentsParams = {}) => {
    return useQuery<GetStudentsResponse>({
        queryKey: ['students', params],
        queryFn: async () => {
            const queryParams: any = {
                page: params.page,
                limit: params.limit,
            };

            if (params.search?.trim()) queryParams.search = params.search.trim();
            if (typeof params.status === 'boolean') queryParams.status = params.status;
            if (params.sort) queryParams.sort = params.sort;
            if (typeof params.isDeleted === 'boolean') queryParams.isDeleted = params.isDeleted;

            try {
                const res = await request.get<GetStudentsResponse>('/student', {
                    params: queryParams,
                });

                return res.data;
            } catch (err: any) {
                const status = err?.response?.status;
                if (status !== 403) throw err;

                const res = await request.get<GetStudentsResponse>('/admin/student', {
                    params: queryParams,
                });

                return res.data;
            }
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
