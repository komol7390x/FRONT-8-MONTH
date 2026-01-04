import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import { message } from 'antd';

export interface UpdateCertificatePayload {
    id: number;
    specificationName: string;
    level: string;
    description: string;
    hourPrice: number;
    teacherId: number;
}

export const useUpdateCertificate = () => {
    return useMutation({
        mutationFn: async (payload: UpdateCertificatePayload) => {
            const { id, ...body } = payload;
            const res = await request.patch(`/certificate/${id}`, body);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Certificate updated');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update certificate';
            message.error(errorMessage);
        },
    });
};
