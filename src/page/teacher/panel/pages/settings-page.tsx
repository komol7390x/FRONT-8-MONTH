import React, { useEffect } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, message } from 'antd';
import { useTeacherDetails, useUpdateTeacher } from '../service/useTeacherDetails';
import { PageLoader } from '../../../../components/page-loader';

export const TeacherSettingsPage: React.FC = () => {
    const details = useTeacherDetails();
    const updateTeacher = useUpdateTeacher();
    const [form] = Form.useForm();

    useEffect(() => {
        if (!details.data) return;
        form.setFieldsValue({
            fullname: details.data.fullname ?? '',
            expirence: details.data.expirence ?? undefined,
            portfolioLink: details.data.portfolioLink ?? '',
        });
    }, [details.data, form]);

    if (details.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    if (details.isError) {
        return (
            <Alert
                type="error"
                showIcon
                message="Teacher details yuklashda xatolik"
                description={(details.error as Error)?.message}
            />
        );
    }

    const onFinish = async (values: any) => {
        const id = details.data?.id;
        if (!id) {
            message.error('Teacher ID topilmadi');
            return;
        }

        try {
            await updateTeacher.mutateAsync({
                id,
                payload: {
                    fullname: values.fullname,
                    expirence: values.expirence,
                    portfolioLink: values.portfolioLink,
                },
            } as any);
            message.success('Saved');
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Update error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-3xl mx-auto">
                <Card title="Settings" className="rounded-2xl">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item label="Fullname" name="fullname" rules={[{ required: true, message: 'fullname required' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Expirence" name="expirence">
                            <InputNumber className="w-full" min={0} />
                        </Form.Item>
                        <Form.Item label="Portfolio link" name="portfolioLink">
                            <Input />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" loading={updateTeacher.isPending} className="h-11" block>
                            Save
                        </Button>
                    </Form>
                </Card>
            </div>
        </div>
    );
};
