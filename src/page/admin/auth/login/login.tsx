import { z } from 'zod';
import { useLogin } from './service/use-login';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie'
import { TokenName } from '../../../../config/enum';
const { Title } = Typography;

const formSchema = z.object({
    username: z.string().min(3, "Kamida 3 ta belgi").max(128).trim(),
    password: z.string().min(3, "Kamida 3 ta belgi").max(128).trim(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export const LoginAdmin = () => {
    const { mutate, isPending } = useLogin();
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "Komol",
            password: "@Komol7390x",
        }
    });

    const onSubmit = (values: LoginFormValues) => {
        mutate(values, {
            onSuccess: (res) => {
                Cookies.set(TokenName.TOKEN_NAME, res.data.token)
                navigate('/admin/dashboard');
            },
            onError: (err: any) => {
                console.error("3. Xatolik yuz berdi:", err);
                message.error(err?.response?.data?.message || "Login yoki parol xato");
            }
        });
    };

    return (
        <div className="flex justify-center items-center min-height-screen h-screen bg-[#f0f2f5] p-4">
            <Card className="w-full max-w-100 shadow-lg rounded-xl">

                <div className="text-center mb-6">
                    <Title level={3} className="mb-0!">Admin Panel</Title>
                </div>

                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

                    {/* Username Field */}
                    <Form.Item
                        label={<span className="font-medium">Username</span>}
                        validateStatus={errors.username ? 'error' : ''}
                        help={errors.username?.message}
                        className="mb-4"
                    >
                        <Controller
                            name="username"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="Username"
                                    size="large"
                                    className="rounded-md"
                                />
                            )}
                        />
                    </Form.Item>

                    {/* Password Field */}
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

                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300"></span>
                        </div>
                        <span className="relative px-2 bg-white text-gray-500 text-sm italic">yoki</span>
                    </div>

                </Form>
            </Card>
        </div>
    );
};