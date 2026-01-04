import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../../config/request";
import { message } from "antd";

interface DeleteAdminResponse {
    message: string;
    success: boolean;
}

export const useDeleteAdmin = () => {
    return useMutation<DeleteAdminResponse, Error, number>({
        mutationFn: async (id: number) => {
            try {
                const res = await request.delete<DeleteAdminResponse>(`/admin/soft-delete/${id}`);
                return res.data;
            } catch (error: any) {
                const status = error?.response?.status;
                if (status === 405 || status === 404) {
                    const res = await request.patch<DeleteAdminResponse>(`/admin/soft-delete/${id}`);
                    return res.data;
                }
                throw error;
            }
        },
        onSuccess: (data) => {
            message.success(data?.message || 'Admin deleted successfully');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error deleting admin';
            message.error(errorMessage);
        }
    });
};
