import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../../config/request";

interface DeleteAdminResponse {
    message: string;
    success: boolean;
}

export const useDeleteAdmin = () => {
    return useMutation<DeleteAdminResponse, Error, number>({
        mutationFn: async (id: number) => {
            const res = await request.patch<DeleteAdminResponse>(`/admin/restore/${id}`);
            return res.data;
        },
        onSuccess: (data) => {
            console.log('Admin restored successfully:', data);
        },
        onError: (error) => {
            console.error('Error restoring admin:', error);
        }
    });
};
