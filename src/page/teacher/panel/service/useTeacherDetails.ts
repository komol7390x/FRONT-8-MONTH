import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export interface TeacherDetails {
    id: number;
    fullname?: string;
    expirence?: number;
    portfolioLink?: string;
    phoneNumber?: string;
    email?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

interface TeacherDetailsResponse {
    data: TeacherDetails;
    [key: string]: any;
}

export const useTeacherDetails = () => {
    return useQuery<TeacherDetails>({
        queryKey: ['teacher-details'],
        queryFn: async () => {
            const res = await request.get<TeacherDetailsResponse>('/teacher/details');
            const raw: any = res.data;
            return (raw?.data ?? raw) as TeacherDetails;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};

export interface UpdateTeacherPayload {
    fullname?: string;
    expirence?: number;
    portfolioLink?: string;
}

export const useUpdateTeacher = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateTeacherPayload }) => {
            const res = await request.patch(`/teacher/${id}`, payload);
            return res.data;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['teacher-details'] });
        },
    });
};
