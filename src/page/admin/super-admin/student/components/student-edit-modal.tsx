import React, { useEffect, useState } from 'react';
import { Hash, Phone, User, X } from 'lucide-react';
import { message } from 'antd';

import type { Student } from '../service/useGetStudents';
import { useUpdateStudent } from '../service/useUpdateStudent';

interface StudentEditModalProps {
    open: boolean;
    student: Student | null;
    onClose: () => void;
    onUpdated: () => void;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({ open, student, onClose, onUpdated }) => {
    const { mutate: updateStudent, isPending } = useUpdateStudent();

    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [tgId, setTgId] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [tgUsername, setTgUsername] = useState<string>('');
    const [blockedReason, setBlockedReason] = useState<string>('');

    useEffect(() => {
        if (!open || !student) return;
        setPhoneNumber(student.phoneNumber || '');
        setTgId(student.tgId || '');
        setLastName(student.lastName || '');
        setFirstName(student.firstName || '');
        setTgUsername(student.tgUsername || '');
        setBlockedReason(student.blockedReason || '');
    }, [open, student]);

    const handleSave = () => {
        if (!student?.id) return;
        if (!phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        if (!tgId.trim()) {
            message.warning('tgId is required');
            return;
        }
        if (!firstName.trim() || !lastName.trim()) {
            message.warning('Firstname/Lastname is required');
            return;
        }
        if (!tgUsername.trim()) {
            message.warning('tgUsername is required');
            return;
        }

        updateStudent(
            {
                id: student.id,
                payload: {
                    phoneNumber,
                    tgId,
                    lastName,
                    firstName,
                    tgUsername,
                    blockedReason: blockedReason.trim() ? blockedReason.trim() : undefined,
                },
            },
            {
                onSuccess: () => {
                    onClose();
                    onUpdated();
                },
            } as any,
        );
    };

    if (!open || !student) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Student</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                    <div className="group">
                        <label className="block text-xs font-semibold text-green-700 mb-1.5">Phone</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700" />
                            <input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
                                placeholder="+998901234567"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-blue-700 mb-1.5">tgId</label>
                        <div className="relative">
                            <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" />
                            <input
                                value={tgId}
                                onChange={(e) => setTgId(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                placeholder="123456789"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-purple-700 mb-1.5">First name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-700" />
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                placeholder="Ali"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-purple-700 mb-1.5">Last name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-700" />
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                placeholder="Aliyev"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-sky-700 mb-1.5">tgUsername</label>
                        <input
                            value={tgUsername}
                            onChange={(e) => setTgUsername(e.target.value)}
                            className="w-full h-11 px-4 bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                            placeholder="ali_dev"
                        />
                    </div>

                    <div className="group lg:col-span-5">
                        <label className="block text-xs font-semibold text-amber-700 mb-1.5">Blocked reason (optional)</label>
                        <input
                            value={blockedReason}
                            onChange={(e) => setBlockedReason(e.target.value)}
                            className="w-full h-11 px-4 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            placeholder="Qoidabuzarlik"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex-1 h-11 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isPending ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};
