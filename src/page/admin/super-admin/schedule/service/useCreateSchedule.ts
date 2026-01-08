import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import { message } from 'antd';

export interface CreateSchedulePayload {
    startTime: number;
    finishTime: number;
    lessonName: string;
    lessonPrice: number;
    teacherId: number;
    studentId?: number;
}

export const useCreateSchedule = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateSchedulePayload) => {
            const res = await request.post('/schedule', payload);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Schedule created successfully');
            client.invalidateQueries({ queryKey: ['teacher-schedule'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create schedule';
            message.error(errorMessage);
        },
    });
};
