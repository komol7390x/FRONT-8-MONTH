import { Card, Typography } from 'antd';
import React from 'react';

export const PaymentPage: React.FC = () => {
    return (
        <div className="space-y-4">
            <Typography.Title level={3} style={{ margin: 0 }}>
                Payment
            </Typography.Title>

            <Card>
                <Typography.Text type="secondary">
                    Payment endpoint hali ulanmadi. Endpoint nomini bersangiz, shu page ichida list/table qilib chiqarib beraman.
                </Typography.Text>
            </Card>
        </div>
    );
};
