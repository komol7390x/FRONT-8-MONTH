import { useQuery } from '@tanstack/react-query';
import { request } from '../../../../config/request';
import type { Student } from './useGetStudents';

interface StudentByIdResponse {
    statusCode?: number;
    status?: boolean;
    message?: string;
    data: Student;
}

export const useGetStudentById = (id: number | undefined) => {
    return useQuery<Student>({
        queryKey: ['student-by-id', id],
        enabled: typeof id === 'number' && id > 0,
        queryFn: async () => {
            const res = await request.get<StudentByIdResponse>(`/student/${id}`);
            return res.data.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
