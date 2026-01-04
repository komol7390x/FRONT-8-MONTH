import { Card, Typography } from 'antd';
import React from 'react';

export const SettingsPage: React.FC = () => {
    return (
        <div className="space-y-4">
            <Typography.Title level={3} style={{ margin: 0 }}>
                Settings
            </Typography.Title>

            <Card>
                <Typography.Text type="secondary">
                    Settings page.
                </Typography.Text>
            </Card>
        </div>
    );
};
