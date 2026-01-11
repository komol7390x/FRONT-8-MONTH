import React, { useEffect } from 'react';
import { Button, Card, Form, Input, InputNumber, Tag, message } from 'antd';
import { CalendarDays, Hash, Link2, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useTeacherDetails, useUpdateTeacher } from '../service/useTeacherDetails';
import { PageLoader } from '../../../../components/page-loader';

export const TeacherSettingsPage: React.FC = () => {
    const details = useTeacherDetails();
    const updateTeacher = useUpdateTeacher();
    const [form] = Form.useForm();

    const formatDateTime = (v: any) => {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        const day = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
        const date = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        return `${day} ${date} ${time}`;
    };

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
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
                <PageLoader />
            </div>
        );
    }

    if (details.isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="text-lg font-bold text-gray-900">Something went wrong</div>
                        <div className="mt-2 text-sm text-gray-600">Teacher details yuklashda xatolik</div>
                        <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                            {(details.error as Error)?.message}
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="h-11 px-5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800"
                            >
                                Reload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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

    const isBlocked = (details.data as any)?.isActive === false;

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-screen-2xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-cyan-700" />
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
                    </div>

                    {isBlocked && (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                            <div className="text-sm font-bold text-red-700">You are blocked</div>
                            <div className="mt-1 text-xs text-red-700/90">
                                Admin unblock qilmaguncha panelning boshqa bo'limlari ishlamaydi.
                            </div>
                        </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-1 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {String(details.data?.fullname || 'T')
                                        .split(' ')
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((s: string) => s[0])
                                        .join('')
                                        .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">{String(details.data?.fullname || '-')}</div>
                                    <div className="text-xs text-gray-600 truncate">{String(details.data?.email || '-')}</div>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2">
                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Hash size={14} className="text-sky-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{details.data?.id ?? '-'}</span>
                                    </div>
                                </div>

                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Phone size={14} className="text-emerald-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Phone</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String((details.data as any)?.phoneNumber || '-')}</span>
                                    </div>
                                </div>

                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <UserRound size={14} className="text-violet-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Role</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String((details.data as any)?.role || '-')}</span>
                                    </div>
                                </div>

                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Active</span>
                                        <div className="flex-1">
                                            {(details.data as any)?.isActive ? (
                                                <Tag className="m-0" color="green">Active</Tag>
                                            ) : (
                                                <Tag className="m-0" color="red">Blocked</Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Wallet</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{String((details.data as any)?.wallet ?? '-')}</span>
                                    </div>
                                </div>

                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <CalendarDays size={14} className="text-emerald-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-20 shrink-0">Created</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{formatDateTime((details.data as any)?.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <CalendarDays size={14} className="text-sky-700 shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 w-20 shrink-0">Updated</span>
                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate">{formatDateTime((details.data as any)?.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl" title={<span className="font-bold">Edit profile</span>}>
                                <Form form={form} layout="vertical" onFinish={onFinish}>
                                    <Form.Item label="Fullname" name="fullname" rules={[{ required: true, message: 'fullname required' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Expirence" name="expirence">
                                        <InputNumber className="w-full" min={0} />
                                    </Form.Item>
                                    <Form.Item label="Portfolio link" name="portfolioLink">
                                        <Input prefix={<Link2 size={14} />} />
                                    </Form.Item>

                                    <Button type="primary" htmlType="submit" loading={updateTeacher.isPending} className="h-11" block>
                                        Save
                                    </Button>
                                </Form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
