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

        staleTime: Infinity, // Ma'lumot hech qachon "eski" bo'lmaydi (faqat refreshda yangilanadi)
        gcTime: 1000 * 60, // Keshda 1 soat davomida saqlanadi
        refetchOnWindowFocus: false, // Brauzer oynasiga qaytganda qayta so'rov yubormaydi
        refetchOnMount: false, // Komponent qayta render bo'lganda so'rov yubormaydi
        retry: 1,
    });
};