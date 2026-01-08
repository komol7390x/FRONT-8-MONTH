import React, { useState } from 'react';
import { Button, InputNumber, message } from 'antd';
import { DollarSign, X } from 'lucide-react';
import { request } from '../../../../../config/request';
import type { Student } from '../service/useGetStudents';

interface AddBalanceModalProps {
    open: boolean;
    student: Student | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
    open,
    student,
    onClose,
    onSuccess,
}) => {
    const [balance, setBalance] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!open || !student) return null;

    const handleSubmit = async () => {
        if (!student.id || balance <= 0) {
            message.warning('Please enter a valid balance amount');
            return;
        }

        setIsSubmitting(true);
        try {
            await request.patch(`/student/add-balance/${student.id}`, null, {
                params: { balance }
            });
            message.success('Balance added successfully');
            setBalance(0);
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to add balance');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentBalance = Number(student.wallet) || 0;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900">Add Balance</h2>
                    </div>
                    <button
                        onClick={onClose}
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
                            value={student.id}
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
                            style={{width: '100%', height: '40px'}}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                            placeholder="Enter amount"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={onClose}
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
            </div>
        </div>
    );
};
