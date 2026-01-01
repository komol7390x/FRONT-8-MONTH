import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../../config/request";



export const SortEnum = {
    CREATED_AT: 'createdAt',
    USERNAME: 'username',
    FULLNAME: 'fullname',
    PHONENUMBER: 'phoneNumber'
} as const;

type SortType = typeof SortEnum[keyof typeof SortEnum];

export interface GetListParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: SortType;
    status?: boolean;
}

export const useGetList = (params: GetListParams = {}) => {
    return useQuery({
        queryKey: ['getlist', params],
        queryFn: async () => {
            const res = await request.get('/admin/all', {
                params: {
                    page: params.page,
                    limit: params.limit,
                    search: params.search || undefined,
                    sort: params.sort,
                    status: params.status
                }
            });
            console.log("Backend response:", res.data);
            return res.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
}