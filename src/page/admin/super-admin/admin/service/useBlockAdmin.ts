import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from "../../../../../config/request";
import { message } from "antd";

interface BlockAdminParams {
    id: number;
    active: boolean;
}

export const useBlockAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, active }: BlockAdminParams) => {
            const response = await request.patch(
                `/admin/is-active/${id}`,
                {},
                { params: { active } }
            );
            return response.data;
        },
        onSuccess: (_, variables) => {
            message.success(variables.active ? 'Admin faollashtirildi' : 'Admin blokirovka qilindi');
            queryClient.invalidateQueries({ queryKey: ['getlist'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to update admin status';
            message.error(errorMessage);
            console.error('Block/Unblock admin error:', error);
        }
    });
};
