import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface CreateCertificatePayload {
    specificationName: string;
    level: string;
    description: string;
    hourPrice: number;
    teacherId: number;
}

export interface CreateCertificateResponse {
    statusCode: number;
    status: boolean;
    message: string;
    data: any;
}

export const useCreateCertificate = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateCertificatePayload) => {
            const res = await request.post<CreateCertificateResponse>('/certificate', payload);
            return res.data;
        },
        onSuccess: (data, variables) => {
            message.success(data?.message || 'Certificate created');
            client.invalidateQueries({ queryKey: ['teacher', variables.teacherId] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create certificate';
            message.error(errorMessage);
        },
    });
};
