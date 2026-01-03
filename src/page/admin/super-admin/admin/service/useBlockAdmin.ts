import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../../../../config/request";
import { message } from "antd";

interface BlockAdminResponse {
    data: any;
    message: string;
}

export const useBlockAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
            const response = await request.patch<BlockAdminResponse>(
                `/admin/is-active/${id}?active=${active}`
            );
            return response.data;
        },
        onSuccess: (_data, variables) => {
            const actionText = variables.active ? 'unblocked' : 'blocked';
            message.success(`Admin ${actionText} successfully`);
            queryClient.invalidateQueries({ queryKey: ['getlist'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to update admin status';
            message.error(errorMessage);
        },
    });
};
