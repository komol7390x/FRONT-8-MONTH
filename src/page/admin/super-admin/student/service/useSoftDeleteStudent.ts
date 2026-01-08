import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export const useSoftDeleteStudent = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
            try {
                const res = await request.delete(`/student/soft-delete/${id}`, {
                    params: { status: String(status) },
                });
                return res.data;
            } catch (error: any) {
                const httpStatus = error?.response?.status;
                if (httpStatus === 404 || httpStatus === 405) {
                    try {
                        const resNoParams = await request.delete(`/student/soft-delete/${id}`);
                        return resNoParams.data;
                    } catch (error2: any) {
                        const httpStatus2 = error2?.response?.status;
                        if (httpStatus2 === 404 || httpStatus2 === 405) {
                            try {
                                const resPatch = await request.patch(`/student/soft-delete/${id}`, undefined, {
                                    params: { status: String(status) },
                                });
                                return resPatch.data;
                            } catch (_error3: any) {
                                const resPatchNoParams = await request.patch(`/student/soft-delete/${id}`);
                                return resPatchNoParams.data;
                            }
                        }
                        throw error2;
                    }
                }
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            message.success('Student updated');
            client.invalidateQueries({ queryKey: ['students'] });
            client.invalidateQueries({ queryKey: ['student', variables.id] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update student';
            message.error(errorMessage);
        },
    });
};
