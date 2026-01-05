import { useMutation } from '@tanstack/react-query';
import { request } from '../../../../config/request';

export interface TeacherLoginPayload {
    email?: string;
    phoneNumber?: string;
    password: string;
}

export const useTeacherLogin = () => {
    return useMutation({
        mutationFn: async (payload: TeacherLoginPayload) => {
            // Backend endpoint name is not explicitly provided; this follows common pattern.
            const res = await request.post('/teacher/signin', payload);
            return res.data;
        },
    });
};

export interface TeacherCreatePayload {
    email: string;
    phoneNumber: string;
    fullname: string;
    password: string;
    expirence: number;
}

export const useTeacherCreate = () => {
    return useMutation({
        mutationFn: async (payload: TeacherCreatePayload) => {
            const res = await request.post('/teacher/create', payload);
            return res.data;
        },
    });
};

export interface TeacherConfirmTelEmailPayload {
    phoneNumber: string;
    email: string;
}

export const useTeacherConfirmTelEmail = () => {
    return useMutation({
        mutationFn: async (payload: TeacherConfirmTelEmailPayload) => {
            const res = await request.post('/teacher/confirm-tel-email', payload);
            return res.data;
        },
    });
};

export interface TeacherRegisterStep2Payload {
    phoneNumber: string;
    password: string;
}

export const useTeacherRegisterStep2 = () => {
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: TeacherRegisterStep2Payload }) => {
            const res = await request.post(`/teacher/register-step2/${id}`, payload);
            return res.data;
        },
    });
};

export const useTeacherRegisterStep3 = () => {
    return useMutation({
        mutationFn: async ({ id, otp }: { id: number; otp: number }) => {
            const res = await request.post(`/teacher/register-step3/${id}`, undefined, {
                params: { otp },
            });
            return res.data;
        },
    });
};
