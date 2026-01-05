import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../../config/request';
import type { Teacher } from './useGetTeachers';

interface TeacherByIdResponse {
    statusCode?: number;
    status?: boolean;
    message?: string;
    data: Teacher;
}

export const useGetTeacherById = (id: number | undefined) => {
    return useQuery<Teacher>({
        queryKey: ['teacher-by-id', id],
        enabled: typeof id === 'number' && id > 0,
        queryFn: async () => {
            const res = await request.get<TeacherByIdResponse>(`/teacher/${id}`);
            return res.data.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
