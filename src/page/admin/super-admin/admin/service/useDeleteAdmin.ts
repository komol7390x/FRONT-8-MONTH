import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../../config/request";
import { message } from "antd";

interface DeleteAdminResponse {
    message: string;
    success: boolean;
}

export const useDeleteAdmin = () => {
    return useMutation<DeleteAdminResponse, Error, { id: number; status: boolean }>({
        mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
            try {
                const res = await request.delete<DeleteAdminResponse>(`/admin/soft-delete/${id}`,
                    {
                        params: { status: String(status) },
                    },
                );
                return res.data;
            } catch (error: any) {
                const httpStatus = error?.response?.status;
                if (httpStatus === 405 || httpStatus === 404) {
                    const res = await request.patch<DeleteAdminResponse>(`/admin/soft-delete/${id}`,
                        undefined,
                        {
                            params: { status: String(status) },
                        },
                    );
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
