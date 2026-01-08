import React, { useEffect, useState } from 'react';
import { Button, Card, InputNumber, message } from 'antd';
import { DollarSign, X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { request } from '../../../../config/request';

export const AddBalancePage: React.FC = () => {
    const navigate = useNavigate();
    const { studentId: studentIdParam } = useParams<{ studentId: string }>();
    const [searchParams] = useSearchParams();
    const studentId = Number(studentIdParam) || 0;
    const currentBalance = Number(searchParams.get('balance')) || 0;
    const [balance, setBalance] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!studentId) {
            message.error('Student ID not found');
            navigate(-1);
        }
    }, [studentId, navigate]);

    const handleSubmit = async () => {
        if (!studentId || balance <= 0) {
            message.warning('Please enter a valid balance amount');
            return;
        }

        setIsSubmitting(true);
        try {
            await request.post(`/student/add-balance/${studentId}`, null, {
                params: { balance }
            });
            message.success('Balance added successfully');
            navigate(-1);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to add balance');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!studentId) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900">Add Balance</h2>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student ID
                        </label>
                        <input
                            type="text"
                            value={studentId}
                            disabled
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Balance
                        </label>
                        <input
                            type="text"
                            value={`${currentBalance.toLocaleString()} UZS`}
                            disabled
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Add
                        </label>
                        <InputNumber
                            value={balance}
                            onChange={(value) => setBalance(Number(value) || 0)}
                            min={0}
                            max={100000000}
                            className="w-full"
                            size="large"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                            placeholder="Enter amount"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => navigate(-1)}
                            className="flex-1"
                            size="large"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            disabled={balance <= 0}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="large"
                        >
                            Add Balance
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
