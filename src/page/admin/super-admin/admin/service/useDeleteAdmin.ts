import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../../config/request";

interface DeleteAdminResponse {
    message: string;
    success: boolean;
}

export const useDeleteAdmin = () => {
    return useMutation<DeleteAdminResponse, Error, number>({
        mutationFn: async (id: number) => {
            const res = await request.delete<DeleteAdminResponse>(`/admin/delete/${id}`);
            return res.data;
        },
        onSuccess: (data) => {
            console.log('Admin deleted successfully:', data);
        },
        onError: (error) => {
            console.error('Error deleting admin:', error);
        }
    });
};
