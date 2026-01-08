import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export const useCertificateActive = () => {
    return useMutation({
        mutationFn: ({ id, active }: { id: number; active: boolean }) =>
            request.patch(`/certificate/is-active/${id}?active=${active}`),
        onSuccess: () => {
            message.success('Certificate status updated successfully');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error updating certificate status');
        },
    });
};
