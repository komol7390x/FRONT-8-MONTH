import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../../../../config/request";
import { message } from "antd";

interface CreateAdminPayload {
    phoneNumber: string;
    username: string;
    fullname: string;
    password: string;
}

interface CreateAdminResponse {
    data: {
        id: number;
        username: string;
        fullname: string;
        phoneNumber: string;
        role: string;
    };
    message: string;
}

export const useCreateAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateAdminPayload) => {
            const response = await request.post<CreateAdminResponse>(
                '/admin/create-admin',
                payload
            );
            return response.data;
        },
        onSuccess: () => {
            message.success('Admin created successfully');
            queryClient.invalidateQueries({ queryKey: ['getlist'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to create admin';
            message.error(errorMessage);
        },
    });
};

export const useSendOtp = () => {
    return useMutation({
        mutationFn: async (phoneNumber: string) => {
            const response = await request.post('/admin/confirm-tel', { phoneNumber });
            return response.data;
        },
        onSuccess: (data) => {
            message.success(`OTP sent! For testing: ${data.data.otp}`);
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to send OTP';
            message.error(errorMessage);
        },
    });
};

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
            const response = await request.post('/admin/confirm-otp', { phoneNumber, otp });
            return response.data;
        },
        onSuccess: () => {
            message.success('Phone number verified');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'OTP verification failed';
            message.error(errorMessage);
        },
    });
};
