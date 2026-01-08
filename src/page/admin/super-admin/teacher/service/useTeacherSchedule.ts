import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../../config/request';

export const WeekDays = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
} as const;

export type WeekDays = (typeof WeekDays)[keyof typeof WeekDays];

export interface ScheduleParams {
    teacherId?: number;
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    day?: string;
}

export const useTeacherSchedule = (params: ScheduleParams) => {
    return useQuery({
        queryKey: ['teacher-schedule', params],
        queryFn: async () => {
            const { teacherId, active, search, page, limit, day } = params;
            const queryParams = new URLSearchParams();
            if (teacherId) queryParams.append('teacherId', String(teacherId));
            if (active !== undefined) queryParams.append('active', String(active));
            if (search) queryParams.append('search', search);
            if (page) queryParams.append('page', String(page));
            if (limit) queryParams.append('limit', String(limit));
            if (day) queryParams.append('day', day);

            const res = await request.get(`/schedule?${queryParams.toString()}`);
            return res.data;
        },
    });
};
