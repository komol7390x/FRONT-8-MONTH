import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Typography, message } from 'antd';
import { Save } from 'lucide-react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import { request } from '../../../../config/request';

export const SettingsPage: React.FC = () => {
    const tokenInfo = useMemo(() => {
        const t = Cookies.get('frontToken');
        if (!t) return null;
        try {
            return jwtDecode<any>(t);
        } catch {
            return null;
        }
    }, []);

    const [form, setForm] = useState<{ username: string; fullname: string }>({
        username: '',
        fullname: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const username = String((tokenInfo as any)?.username || (tokenInfo as any)?.user?.username || '');
        const fullname = String((tokenInfo as any)?.fullname || (tokenInfo as any)?.fullName || (tokenInfo as any)?.user?.fullname || '');
        if (!username && !fullname) return;
        setForm({ username, fullname });
    }, [tokenInfo]);

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
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Settings
                </Typography.Title>

                <Card>
                    <div className="space-y-3">
                        {tokenInfo && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="text-xs text-gray-600">Your info</div>
                                <div className="mt-1 text-sm font-semibold text-gray-900 truncate">
                                    {String((tokenInfo as any)?.role || (tokenInfo as any)?.user?.role || '').toUpperCase()}
                                </div>
                            </div>
                        )}

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
        </div>
    );
};
