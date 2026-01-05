import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../../config/request';

export const LanguageLevel = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
    C1: 'C1',
    C2: 'C2'
} as const;

export type LanguageLevel = (typeof LanguageLevel)[keyof typeof LanguageLevel];

export const TeacherSort = {
    FULLNAME: 'fullname',
    EMAIL: 'email',
    RATING: 'rating',
    CREATED_AT: 'createdAt'
} as const;

export type TeacherSort = (typeof TeacherSort)[keyof typeof TeacherSort];

export interface TeacherCertificate {
    specificationName?: string;
    level?: LanguageLevel;
}

export interface TeacherLesson {
    status?: string;
}

export interface Teacher {
    id: number;
    fullname: string;
    email: string;
    phoneNumber: string;
    expirence?: number;
    rating?: number;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    certificates?: TeacherCertificate[];
    lessons?: TeacherLesson[];
}

export interface GetTeachersParams {
    page?: number;
    limit?: number;
    search?: string;
    level?: LanguageLevel;
    sort?: TeacherSort;
    lang?: string;
    status?: boolean;
    isDeleted?: boolean;
}

export interface GetTeachersResponse {
    data: Teacher[];
    meta?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
    };
}

export const useGetTeachers = (params: GetTeachersParams = {}) => {
    return useQuery<GetTeachersResponse>({
        queryKey: ['teachers', params],
        queryFn: async () => {
            const queryParams: any = {
                page: params.page,
                limit: params.limit
            };

            if (params.search?.trim()) queryParams.search = params.search.trim();
            if (params.level) queryParams.level = params.level;
            if (params.sort) queryParams.sort = params.sort;
            if (params.lang?.trim()) queryParams.lang = params.lang.trim();
            if (typeof params.status === 'boolean') queryParams.status = params.status;
            if (typeof params.isDeleted === 'boolean') queryParams.isDeleted = params.isDeleted;

            const res = await request.get<GetTeachersResponse>('/teacher/all', {
                params: queryParams
            });

            return res.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always'
    });
};
