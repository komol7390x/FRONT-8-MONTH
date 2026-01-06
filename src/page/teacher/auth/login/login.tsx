import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { message } from 'antd';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { TokenName } from '../../../../config/enum';
import { config } from '../../../../config/config';
import { useTeacherLogin } from '../service/teacher-auth';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
const { Title } = Typography;

const formSchema = z.object({
    emailOrPhone: z.string().min(3, 'Kamida 3 ta belgi').max(128).trim(),
    password: z.string().min(3, 'Kamida 3 ta belgi').max(128).trim(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export const LoginTeacher = () => {
    const { mutate, isPending } = useTeacherLogin();
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            emailOrPhone: '',
            password: '',
        },
    });

    const onSubmit = (values: LoginFormValues) => {
        const raw = String(values.emailOrPhone || '').trim();
        const payload: any = {
            password: values.password,
        };
        if (raw.includes('@')) payload.email = raw;
        else payload.phoneNumber = raw;

        mutate(payload, {
            onSuccess: (res: any) => {
                const token = res?.data?.token ?? res?.token ?? res?.accessToken ?? res?.data?.accessToken;
                if (!token) {
                    message.error('Token topilmadi (backend response)');
                    return;
                }
                Cookies.set(TokenName.TOKEN_NAME, token);
                navigate('/teacher-panel');
            },
            onError: (err: any) => {
                console.error('Teacher login error:', err);
                message.error(err?.response?.data?.message || 'Login yoki parol xato');
            },
        } as any);
    };

    return (
        <div className="flex justify-center items-center min-height-screen h-screen bg-[#f0f2f5] p-4">
            <Card className="w-full max-w-100 shadow-lg rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>
                <div className="text-center mb-6">
                    <Title level={3} className="mb-0!">Teacher Panel</Title>
                </div>

                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Form.Item
                        label={<span className="font-medium">Email or Phone</span>}
                        validateStatus={errors.emailOrPhone ? 'error' : ''}
                        help={errors.emailOrPhone?.message}
                        className="mb-4"
                    >
                        <Controller
                            name="emailOrPhone"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="teacher@mail.com yoki +998901234567"
                                    size="large"
                                    className="rounded-md"
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-medium">Password</span>}
                        validateStatus={errors.password ? 'error' : ''}
                        help={errors.password?.message}
                        className="mb-6"
                    >
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    placeholder="Password"
                                    size="large"
                                    className="rounded-md"
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item className="mb-3">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={isPending}
                            className="h-12 text-base font-semibold rounded-md"
                        >
                            Tizimga kirish
                        </Button>
                    </Form.Item>

                    <Form.Item className="mb-3">
                        <Link to="/teacher/register" className="block">
                            <Button
                                block
                                size="large"
                                className="h-12 text-base font-semibold rounded-md"
                            >
                                Ro‘yxatdan o‘tish
                            </Button>
                        </Link>
                    </Form.Item>

                    <Form.Item className="mb-3">
                        <Button
                            block
                            size="large"
                            className="h-12 text-base font-semibold rounded-md flex items-center justify-center gap-3 border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-md"
                            onClick={() => {
                                window.location.href = `${config.BACKEND_URL}/auth/google`;
                            }}
                        >
                            <span className="inline-flex items-center justify-center w-5 h-5">
                                <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.62l6.9-6.9C36.03 2.38 30.42 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.02 6.23C12.46 13.6 17.77 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.1 24.5c0-1.7-.15-3.33-.43-4.9H24v9.27h12.4c-.53 2.8-2.13 5.17-4.53 6.77l6.92 5.37C43.2 37.1 46.1 31.35 46.1 24.5z" />
                                    <path fill="#FBBC05" d="M10.58 28.24c-.5-1.5-.78-3.1-.78-4.74 0-1.64.28-3.24.78-4.74l-8.02-6.23C.92 15.92 0 19.86 0 24c0 4.14.92 8.08 2.56 11.47l8.02-6.23z" />
                                    <path fill="#34A853" d="M24 48c6.42 0 12.03-2.12 16.79-5.92l-6.92-5.37c-1.92 1.3-4.38 2.07-7.87 2.07-6.23 0-11.54-4.1-13.42-9.95l-8.02 6.23C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                            </span>
                            Google bilan kirish
                        </Button>
                    </Form.Item>

                    <div className="relative my-6 text-center">
                        <p className='text-[12px]'>Teacher panel - Faqat ruxsat etilgan foydalanuvchilar uchun</p>
                    </div>
                </Form>
            </Card>
        </div>
    );
};
