import React from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { TokenName } from '../../../../config/enum';
import { config } from '../../../../config/config';
import { useTeacherLogin } from '../service/teacher-auth';

const { Title } = Typography;

type LoginValues = {
    emailOrPhone: string;
    password: string;
};

export const LoginTeacher: React.FC = () => {
    const navigate = useNavigate();
    const { mutateAsync, isPending } = useTeacherLogin();

    const onSubmit = async (values: LoginValues) => {
        const raw = String(values.emailOrPhone || '').trim();
        const payload: any = {
            password: values.password,
        };

        // phone: +998..., email: contains @
        if (raw.includes('@')) payload.email = raw;
        else payload.phoneNumber = raw;

        try {
            const res: any = await mutateAsync(payload);
            const token = res?.data?.token ?? res?.token ?? res?.accessToken ?? res?.data?.accessToken;

            if (!token) {
                message.error('Token topilmadi (backend response)');
                return;
            }

            Cookies.set(TokenName.TOKEN_NAME, token);
            navigate('/teacher-panel', { replace: true });
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Login xatolik');
        }
    };

    return (
        <div className="flex justify-center items-center min-height-screen h-screen bg-[#f0f2f5] p-4">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <div className="text-center mb-6">
                    <Title level={3} className="mb-0!">Teacher Panel</Title>
                </div>

                <Form layout="vertical" onFinish={onSubmit}>
                    <Form.Item
                        label={<span className="font-medium">Email or Phone</span>}
                        name="emailOrPhone"
                        rules={[{ required: true, message: 'Email yoki phone kiriting' }]}
                    >
                        <Input placeholder="teacher@mail.com yoki +998901234567" size="large" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-medium">Password</span>}
                        name="password"
                        rules={[{ required: true, message: 'Password kiriting' }]}
                    >
                        <Input.Password placeholder="Password" size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" loading={isPending} className="h-12 text-base font-semibold rounded-md">
                        Login
                    </Button>

                    <Button
                        block
                        size="large"
                        className="h-12 text-base font-semibold rounded-md mt-3"
                        onClick={() => {
                            // Redirect to backend Google OAuth
                            window.location.href = `${config.BACKEND_URL}/auth/google`;
                        }}
                    >
                        Google
                    </Button>

                    <div className="mt-4 text-center">
                        <span className="text-sm text-gray-600">Register qilmoqchimisiz? </span>
                        <Link to="/teacher/register" className="text-sm font-semibold text-blue-600 hover:underline">Register</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};
