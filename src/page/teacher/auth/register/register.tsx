import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Steps, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
    useTeacherConfirmTelEmail,
    useTeacherCreate,
    useTeacherRegisterStep2,
    useTeacherRegisterStep3,
} from '../service/teacher-auth';

const { Title } = Typography;

type Step1Values = {
    email: string;
    phoneNumber: string;
    fullname: string;
    password: string;
    expirence: number;
};

type Step2Values = {
    phoneNumber: string;
    password: string;
};

type Step3Values = {
    otp: number;
};

export const RegisterTeacher: React.FC = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [teacherId, setTeacherId] = useState<number | null>(null);

    const createTeacher = useTeacherCreate();
    const confirmTelEmail = useTeacherConfirmTelEmail();
    const step2 = useTeacherRegisterStep2();
    const step3 = useTeacherRegisterStep3();

    const [form1] = Form.useForm<Step1Values>();
    const [form2] = Form.useForm<Step2Values>();
    const [form3] = Form.useForm<Step3Values>();

    const steps = useMemo(
        () => [
            { title: 'Create' },
            { title: 'Step 2' },
            { title: 'OTP' },
        ],
        [],
    );

    const onStep1 = async (values: Step1Values) => {
        try {
            const res: any = await createTeacher.mutateAsync(values as any);
            const id = Number(res?.data?.id ?? res?.id ?? res?.data?.data?.id);
            if (!Number.isFinite(id) || id <= 0) {
                message.error('Teacher ID topilmadi (create response)');
                return;
            }
            setTeacherId(id);

            await confirmTelEmail.mutateAsync({
                phoneNumber: values.phoneNumber,
                email: values.email,
            });

            form2.setFieldsValue({ phoneNumber: values.phoneNumber, password: values.password });
            setCurrent(1);
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Register step1 xatolik');
        }
    };

    const onStep2 = async (values: Step2Values) => {
        if (!teacherId) {
            message.error('Teacher ID yo‘q. Step1 ni qayta bajaring');
            return;
        }
        try {
            await step2.mutateAsync({ id: teacherId, payload: values } as any);
            setCurrent(2);
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Register step2 xatolik');
        }
    };

    const onStep3 = async (values: Step3Values) => {
        if (!teacherId) {
            message.error('Teacher ID yo‘q. Step1 ni qayta bajaring');
            return;
        }
        try {
            await step3.mutateAsync({ id: teacherId, otp: Number(values.otp) } as any);
            message.success('Register done');
            navigate('/teacher/login', { replace: true });
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'OTP xatolik');
        }
    };

    return (
        <div className="flex justify-center items-center min-height-screen h-screen bg-[#f0f2f5] p-4">
            <Card className="w-full max-w-xl shadow-lg rounded-xl">
                <div className="text-center mb-6">
                    <Title level={3} className="mb-0!">Teacher Register</Title>
                </div>

                <Steps current={current} items={steps} className="mb-6" />

                {current === 0 && (
                    <Form layout="vertical" form={form1} onFinish={onStep1}>
                        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                            <Input placeholder="teacher@mail.com" />
                        </Form.Item>
                        <Form.Item name="phoneNumber" label="Phone" rules={[{ required: true }]}>
                            <Input placeholder="+998901234567" />
                        </Form.Item>
                        <Form.Item name="fullname" label="Fullname" rules={[{ required: true }]}>
                            <Input placeholder="Ali Valiyev" />
                        </Form.Item>
                        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                            <Input.Password placeholder="@Komol12345" />
                        </Form.Item>
                        <Form.Item name="expirence" label="Expirence" rules={[{ required: true }]}>
                            <InputNumber min={0} className="w-full" />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" block loading={createTeacher.isPending || confirmTelEmail.isPending} className="h-11">
                            Continue
                        </Button>
                    </Form>
                )}

                {current === 1 && (
                    <Form layout="vertical" form={form2} onFinish={onStep2}>
                        <Alert
                            type="info"
                            showIcon
                            className="mb-4"
                            message="Step2"
                            description="Telefon va parol yuboriladi. (Backend step2)"
                        />

                        <Form.Item name="phoneNumber" label="Phone" rules={[{ required: true }]}>
                            <Input placeholder="+998901234567" />
                        </Form.Item>
                        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                            <Input.Password placeholder="@Komol12345" />
                        </Form.Item>

                        <div className="flex gap-2">
                            <Button block className="h-11" onClick={() => setCurrent(0)}>
                                Back
                            </Button>
                            <Button type="primary" htmlType="submit" block loading={step2.isPending} className="h-11">
                                Continue
                            </Button>
                        </div>
                    </Form>
                )}

                {current === 2 && (
                    <Form layout="vertical" form={form3} onFinish={onStep3}>
                        <Alert
                            type="warning"
                            showIcon
                            className="mb-4"
                            message="OTP"
                            description="SMS/Email OTP kiriting"
                        />

                        <Form.Item name="otp" label="OTP" rules={[{ required: true }]}>
                            <InputNumber className="w-full" placeholder={123456 as any} />
                        </Form.Item>

                        <div className="flex gap-2">
                            <Button block className="h-11" onClick={() => setCurrent(1)}>
                                Back
                            </Button>
                            <Button type="primary" htmlType="submit" block loading={step3.isPending} className="h-11">
                                Finish
                            </Button>
                        </div>
                    </Form>
                )}

                <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600">Login page? </span>
                    <Link to="/teacher/login" className="text-sm font-semibold text-blue-600 hover:underline">Login</Link>
                </div>
            </Card>
        </div>
    );
};
