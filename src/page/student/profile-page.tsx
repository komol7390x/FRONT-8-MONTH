import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useGetStudentById } from '../admin/super-admin/student/service/useGetStudentById';
import { PageLoader } from '../../components/page-loader';
import { message } from 'antd';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentProfilePage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const id = Number(studentId) || 1;

    const { data: student, isPending } = useGetStudentById(id);

    useEffect(() => {
        if (!id) {
            message.error('Student ID not found');
        }
    }, [id]);

    const fullname = `${student?.firstName || ''} ${student?.lastName || ''}`.trim();

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {fullname ? fullname.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{fullname || 'Student'}</h1>
                            <p className="text-xs text-gray-500">@{student?.tgUsername || 'student'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {isPending && (
                    <div className="flex justify-center py-10">
                        <PageLoader />
                    </div>
                )}

                {!isPending && !student && (
                    <div className="text-center py-10 text-gray-600">Student not found</div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Info size={20} className="text-blue-600" />
                        Student Information
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">ID</span>
                            <span className="text-sm font-semibold text-gray-900">{student?.id ?? '-'}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Name</span>
                            <span className="text-sm font-semibold text-gray-900">{fullname || '-'}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Phone</span>
                            <span className="text-sm font-semibold text-gray-900">{student?.phoneNumber || '-'}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Telegram ID</span>
                            <span className="text-sm font-semibold text-gray-900">{student?.tgId || '-'}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Username</span>
                            <span className="text-sm font-semibold text-gray-900">@{student?.tgUsername || '-'}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Balance</span>
                            <span className="text-sm font-semibold text-green-600">{Number(student?.wallet || 0).toLocaleString()} UZS</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <span className={`text-sm font-semibold ${student?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {student?.isActive ? 'Active' : 'Blocked'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-gray-600">Created</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {student?.createdAt
                                    ? new Date(student.createdAt).toLocaleDateString('uz-UZ', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : '-'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <TelegramStudentBottomNav studentId={id} />
        </div>
    );
};
