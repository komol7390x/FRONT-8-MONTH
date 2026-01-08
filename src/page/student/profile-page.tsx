import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, PlusCircle, List, Info } from 'lucide-react';
import { useGetStudentById } from '../admin/super-admin/student/service/useGetStudentById';
import { PageLoader } from '../../components/page-loader';
import { message } from 'antd';
import { StudentScheduleContent } from './components/schedule-content';
import { StudentLessonsContent } from './components/lessons-content';


type TabType = 'create' | 'lessons' | 'info';

export const StudentProfilePage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const id = Number(studentId) || 0;
    const [activeTab, setActiveTab] = useState<TabType>('create');

    const { data: student, isPending } = useGetStudentById(id);

    useEffect(() => {
        if (!id) {
            message.error('Student ID not found');
        }
    }, [id]);

    if (isPending && !student) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <PageLoader />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Student not found</p>
                </div>
            </div>
        );
    }

    const fullname = `${student.firstName || ''} ${student.lastName || ''}`.trim();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {fullname ? fullname.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{fullname || 'Student'}</h1>
                            <p className="text-xs text-gray-500">@{student.tgUsername || 'student'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-md mx-auto">
                {activeTab === 'create' && (
                    <div className="p-4">
                        <StudentScheduleContent studentId={id} />
                    </div>
                )}
                
                {activeTab === 'lessons' && (
                    <div className="p-4">
                        <StudentLessonsContent />
                    </div>
                )}
                
                {activeTab === 'info' && (
                    <div className="p-4 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Info size={20} className="text-blue-600" />
                                Student Information
                            </h2>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">ID</span>
                                    <span className="text-sm font-semibold text-gray-900">{student.id}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Name</span>
                                    <span className="text-sm font-semibold text-gray-900">{fullname || '-'}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Phone</span>
                                    <span className="text-sm font-semibold text-gray-900">{student.phoneNumber || '-'}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Telegram ID</span>
                                    <span className="text-sm font-semibold text-gray-900">{student.tgId || '-'}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Username</span>
                                    <span className="text-sm font-semibold text-gray-900">@{student.tgUsername || '-'}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Balance</span>
                                    <span className="text-sm font-semibold text-green-600">{Number(student.wallet || 0).toLocaleString()} UZS</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Status</span>
                                    <span className={`text-sm font-semibold ${student.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {student.isActive ? 'Active' : 'Blocked'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm font-medium text-gray-600">Created</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {student.createdAt 
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
                )}
            </div>

            {/* Instagram-style Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-around py-2">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'create'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                            }`}
                        >
                            <PlusCircle size={24} className={activeTab === 'create' ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="text-xs font-medium">Create</span>
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('lessons')}
                            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'lessons'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                            }`}
                        >
                            <List size={24} className={activeTab === 'lessons' ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="text-xs font-medium">Lessons</span>
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'info'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                            }`}
                        >
                            <User size={24} className={activeTab === 'info' ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="text-xs font-medium">Info</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
