import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../../../../config/request";
import { message } from "antd";
import type { Admin } from "./useGetList";

interface UpdateAdminPayload {
    username: string;
    fullname: string;
    phoneNumber: string;
    password?: string;
}

interface UpdateAdminResponse {
    data: Admin;
    message: string;
}

export const useUpdateAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateAdminPayload }) => {
            const response = await request.patch<UpdateAdminResponse>(
                `/admin/update-details/${id}`,
                payload
            );
            return response.data;
        },
        onSuccess: () => {
            message.success('Admin updated successfully');
            queryClient.invalidateQueries({ queryKey: ['getlist'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to update admin';
            message.error(errorMessage);
        },
    });
};
