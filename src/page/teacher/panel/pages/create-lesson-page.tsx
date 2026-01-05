import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message } from 'antd';
import { useTeacherDetails } from '../service/useTeacherDetails';
import { useCreateLesson } from '../service/useCreateLesson';

export const TeacherCreateLessonPage: React.FC = () => {
    const details = useTeacherDetails();
    const createLesson = useCreateLesson();

    const teacherId = details.data?.id;

    const initialValues = useMemo(() => {
        return {
            lessonName: '',
            lessonPrice: 50000,
            startTime: undefined,
            finishTime: undefined,
        };
    }, []);

    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values: any) => {
        if (!teacherId) {
            message.error('Teacher ID topilmadi');
            return;
        }

        const payload = {
            startTime: Number(values.startTime),
            finishTime: Number(values.finishTime),
            lessonName: String(values.lessonName || '').trim(),
            lessonPrice: Number(values.lessonPrice),
            teacherId: Number(teacherId),
        };

        setSubmitting(true);
        try {
            await createLesson.mutateAsync(payload as any);
            message.success('Lesson created');
            form.resetFields();
        } catch (e: any) {
            message.error(e?.response?.data?.message || 'Create lesson error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-3xl mx-auto">
                <Card title="Create Lesson" className="rounded-2xl">
                    <Form layout="vertical" form={form} initialValues={initialValues} onFinish={onFinish}>
                        <Form.Item name="lessonName" label="Lesson name" rules={[{ required: true, message: 'Lesson name required' }]}>
                            <Input placeholder="Fizika" />
                        </Form.Item>

                        <Form.Item name="lessonPrice" label="Lesson price" rules={[{ required: true, message: 'Lesson price required' }]}>
                            <InputNumber min={0} className="w-full" />
                        </Form.Item>

                        <Form.Item name="startTime" label="Start time" rules={[{ required: true, message: 'Start time required' }]}>
                            <InputNumber className="w-full" placeholder="175554484" />
                        </Form.Item>

                        <Form.Item name="finishTime" label="Finish time" rules={[{ required: true, message: 'Finish time required' }]}>
                            <InputNumber className="w-full" placeholder="175554484" />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting || createLesson.isPending}
                            disabled={details.isPending}
                            className="h-11"
                            block
                        >
                            Create
                        </Button>
                    </Form>
                </Card>
            </div>
        </div>
    );
};
