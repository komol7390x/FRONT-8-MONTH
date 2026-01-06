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
            const res = await request.post('/teacher/signin', payload, {
                withCredentials: true,
            });
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
            const res = await request.post('/teacher/create', payload, {
                withCredentials: true,
            });
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
            const res = await request.post('/teacher/confirm-tel-email', payload, {
                withCredentials: true,
            });
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
        mutationFn: async (payload: TeacherRegisterStep2Payload) => {
            const res = await request.post('/teacher/register-step2', payload, {
                withCredentials: true,
            });
            return res.data;
        },
    });
};

export const useTeacherRegisterStep3 = () => {
    return useMutation({
        mutationFn: async ({ otp }: { otp: number }) => {
            const res = await request.post('/teacher/register-step3', undefined, {
                params: { otp },
                withCredentials: true,
            });
            return res.data;
        },
    });
};
