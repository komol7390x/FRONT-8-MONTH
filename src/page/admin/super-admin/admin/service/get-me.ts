import { useQuery } from "@tanstack/react-query"
import { request } from "../../../../../config/request";

interface UserData {
    id: number;
    username: string;
    fullname: string;
    role: string;
    avatarUrl: string;
    isActive: boolean;
}
export const useGetMe = () => {
    return useQuery({
        queryKey: ['getMe'],
        queryFn: () => request.get('/admin/details').then(res => res.data),
        select: (response) => response.data as UserData,

        staleTime: Infinity,
        gcTime: 1000 * 60,
        refetchOnWindowFocus: false, 
        refetchOnMount: false, 
        retry: 1,
    });
};