import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Typography, message } from 'antd';
import { Copy, Save } from 'lucide-react';
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
    const [details, setDetails] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        const username = String((tokenInfo as any)?.username || (tokenInfo as any)?.user?.username || '');
        const fullname = String((tokenInfo as any)?.fullname || (tokenInfo as any)?.fullName || (tokenInfo as any)?.user?.fullname || '');
        if (!username && !fullname) return;
        setForm({ username, fullname });
    }, [tokenInfo]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoadingDetails(true);
                const res = await request.get('/admin/details');
                const raw: any = (res as any)?.data;
                const data = raw?.data ?? raw;
                setDetails(data);

                const username = String(data?.username || '');
                const fullname = String(data?.fullname || data?.fullName || '');
                if (username || fullname) {
                    setForm({ username, fullname });
                }
            } catch (e: any) {
                message.error(e?.response?.data?.message || e?.message || 'Failed to load details');
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();
    }, []);

    const copy = async (v: any) => {
        try {
            await navigator.clipboard.writeText(String(v ?? ''));
            message.success('Copied');
        } catch {
            message.error('Copy failed');
        }
    };

    const formatDateTime = (v: any) => {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        return d.toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

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
                <div className="flex items-center justify-between gap-3">
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        Settings
                    </Typography.Title>
                    {isLoadingDetails && (
                        <div className="text-sm text-gray-500">Loading...</div>
                    )}
                </div>

                <Card>
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="text-xs text-gray-600">Role</div>
                                <div className="mt-1 text-sm font-semibold text-gray-900 truncate">
                                    {String(details?.role || (tokenInfo as any)?.role || (tokenInfo as any)?.user?.role || '').toUpperCase() || '-'}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="text-xs text-gray-600">ID</div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900 truncate">{details?.id ?? '-'}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copy(details?.id)}
                                    className="h-9 w-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                                    aria-label="Copy id"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="text-xs text-gray-600">Active</div>
                                <div className="mt-1">
                                    <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium text-white min-w-22 text-center ${(details?.isActive ?? true) ? 'bg-green-600' : 'bg-red-600'}`}>
                                        {(details?.isActive ?? true) ? 'Active' : 'Blocked'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="text-xs text-gray-600">Deleted</div>
                                <div className="mt-1">
                                    <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium text-white min-w-22 text-center ${details?.isDeleted ? 'bg-red-600' : 'bg-green-600'}`}>
                                        {details?.isDeleted ? 'Deleted' : 'Not deleted'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="text-xs text-gray-600">Created</div>
                                <div className="mt-1 text-sm font-semibold text-gray-900 truncate">{formatDateTime(details?.createdAt)}</div>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="text-xs text-gray-600">Updated</div>
                                <div className="mt-1 text-sm font-semibold text-gray-900 truncate">{formatDateTime(details?.updatedAt)}</div>
                            </div>
                        </div>

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
