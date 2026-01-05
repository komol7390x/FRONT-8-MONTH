import React, { useState } from 'react';
import { Card, Input, Typography, message } from 'antd';
import { Save } from 'lucide-react';

import { request } from '../../../../config/request';

export const SettingsPage: React.FC = () => {
    const [form, setForm] = useState<{ username: string; fullname: string }>({
        username: '',
        fullname: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const onSave = async () => {
        try {
            setIsSaving(true);
            const res = await request.patch('/admin/update-details', {
                username: form.username,
                fullname: form.fullname,
            });
            message.success((res as any)?.data?.message || 'Updated');
        } catch (e: any) {
            message.error(e?.response?.data?.message || e?.message || 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <Typography.Title level={3} style={{ margin: 0 }}>
                Settings
            </Typography.Title>

            <Card>
                <div className="space-y-3">
                    <div>
                        <Typography.Text type="secondary">Username</Typography.Text>
                        <Input
                            value={form.username}
                            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                            placeholder="admin"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Typography.Text type="secondary">Fullname</Typography.Text>
                        <Input
                            value={form.fullname}
                            onChange={(e) => setForm((p) => ({ ...p, fullname: e.target.value }))}
                            placeholder="John Doe"
                            className="mt-1"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="h-11 px-5 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </Card>
        </div>
    );
};
