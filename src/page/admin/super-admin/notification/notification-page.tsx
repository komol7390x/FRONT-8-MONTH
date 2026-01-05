import React from 'react';
import { Card, Typography } from 'antd';

export const NotificationPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Notification
                </Typography.Title>

                <Card>
                    <div className="text-sm text-gray-600">No notifications yet.</div>
                </Card>
            </div>
        </div>
    );
};
