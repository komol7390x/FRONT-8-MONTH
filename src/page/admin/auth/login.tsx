import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { message } from "antd";
import { useLogin } from './service/use-login';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie'
import { TokenName } from '../../../config/enum';
import { Roles } from '../../../config/roles';
import { Button, Card, Form, Input, Typography } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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
                if (res.data.user.role == Roles.SUPER_ADMIN) {
                    navigate('/super-admin/admin/statistics')
                }
                else if (res.data.user.role == Roles.ADMIN) {
                    navigate('/admin/teacher/all')
                } else {
                    navigate('/admin/login')
                }
            },

            onError: (err: any) => {
                console.error("3. Xatolik yuz berdi:", err);
                message.error(err?.response?.data?.message || "Login yoki parol xato");
            }
        });
    };

    return (
        <div className="flex justify-center items-center min-height-screen min-h-screen bg-[#f0f2f5] p-3 sm:p-4 md:p-6">
            <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg rounded-xl">
                <div >
                    <Link to='/'>
                        <Button style={{ fontSize: '15px', boxSizing: 'border-box', backgroundColor: 'green', color: 'white' }}>Back</Button>
                    </Link>
                </div>
                <div className="text-center mb-6">
                    <Title level={3} className="mb-0!">Admin Panel</Title>
                </div>

                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
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
                        <p className='text-[12px]'>Admin panel - Faqat ruxsat etilgan foydalanuvchilar uchun</p>
                    </div>
                </Form>
            </Card>
        </div>
    );
};