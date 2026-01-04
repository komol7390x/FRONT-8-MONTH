import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export const BookedLessonStatus = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
} as const;

export type BookedLessonStatus = (typeof BookedLessonStatus)[keyof typeof BookedLessonStatus];

export interface LessonStudent {
    id: number;
    phoneNumber?: string;
    tgId?: string;
    lastName?: string;
    firstName?: string;
    role?: string;
    tgUsername?: string;
}

export interface LessonTemplateItem {
    id: number;
    teacherId: number;
    studentId: number | null;
    status: BookedLessonStatus;
    weekDays: string | null;
    isPaidToTeacher?: boolean;
    lessonName?: string;
    startTime?: string;
    endTime?: string;
    price?: string;
    meetLink?: string;
    student?: LessonStudent | null;
}

export interface LessonTemplateResponse {
    data: LessonTemplateItem[];
    meta?: {
        totalItems?: number;
        itemCount?: number;
        itemsPerPage?: number;
        totalPages?: number;
        currentPage?: number;
    };
    stats?: {
        active?: number;
        inactive?: number;
        deleted?: number;
    };
}

export interface LessonTemplateParams {
    status?: BookedLessonStatus;
    weekday?: string;
    isPaid?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export const useTeacherLessons = (teacherId: number | undefined, params: LessonTemplateParams = {}) => {
    return useQuery<LessonTemplateResponse>({
        queryKey: ['teacher-lessons', teacherId, params],
        enabled: !!teacherId,
        queryFn: async () => {
            const res = await request.get<LessonTemplateResponse>('/lesson-template', {
                params: {
                    teacherId,
                    status: params.status,
                    weekday: params.weekday,
                    isPaid: params.isPaid,
                    search: params.search,
                    page: params.page,
                    limit: params.limit
                }
            });
            return res.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false
    });
};
