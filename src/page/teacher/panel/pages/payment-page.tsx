import React, { useMemo } from 'react';
import { Alert, Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTeacherPayments, type TeacherPaymentItem } from '../service/useTeacherPayments';
import { PageLoader } from '../../../../components/page-loader';

export const TeacherPaymentPage: React.FC = () => {
    const query = useTeacherPayments();

    const dataSource = (query.data?.data || []).map((row: any, idx: number) => {
        const normalizedAmount = row?.amount ?? row?.price ?? row?.sum ?? row?.total ?? row?.paymentAmount ?? row?.value;
        return {
            key: row?.id ?? idx,
            ...row,
            amount: normalizedAmount,
        };
    });

    const columns: ColumnsType<TeacherPaymentItem> = useMemo(
        () => [
            { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
            { title: 'Status', dataIndex: 'status', key: 'status', width: 160, render: (v) => <Tag className="m-0" color="blue">{String(v ?? '-')}</Tag> },
            { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 160, render: (v) => <Tag className="m-0" color="gold">{v ?? '-'}</Tag> },
            { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 200, render: (v) => (v ? String(v) : '-') },
        ],
        [],
    );

    if (query.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    if (query.isError) {
        return (
            <Alert
                type="error"
                showIcon
                message="Payment yuklashda xatolik"
                description={(query.error as Error)?.message}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                <Card>
                    <Table columns={columns} dataSource={dataSource as any} pagination={false} bordered size="middle" />
                </Card>
            </div>
        </div>
    );
};
