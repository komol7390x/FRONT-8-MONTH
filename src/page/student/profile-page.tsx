import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Info, User, Phone, Wallet, Calendar, ShieldCheck } from 'lucide-react';
import { useGetStudentById } from '../admin/super-admin/student/service/useGetStudentById';
import { PageLoader } from '../../components/page-loader';
import { TelegramStudentBottomNav } from './components/telegram-student-bottom-nav';

export const StudentProfilePage: React.FC = () => {
    const { studentId: paramId } = useParams<{ studentId: string }>();

    // 1. IDni aniqlash: Avval URLdan, bo'lmasa storage'dan olamiz
    const id = useMemo(() => {
        return Number(paramId) || Number(localStorage.getItem('telegram_student_id')) || 0;
    }, [paramId]);

    // 2. Ma'lumotlarni yuklash
    const { data: student, isPending } = useGetStudentById(id);

    const fullname = `${student?.firstName || ''} ${student?.lastName || ''}`.trim();

    if (isPending) return <PageLoader />;

    if (!student && !isPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
                <User size={48} className="mb-2 opacity-20" />
                <p>Talaba ma'lumotlari topilmadi</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Profil Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto px-6 py-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3 rotate-3">
                        <span className="-rotate-3">{fullname ? fullname.charAt(0).toUpperCase() : 'S'}</span>
                    </div>
                    <h1 className="text-xl font-extrabold text-gray-900">{fullname || 'Talaba'}</h1>
                    <p className="text-sm text-blue-500 font-medium">@{student?.tgUsername || 'username'}</p>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {/* Asosiy ma'lumotlar kartasi */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                        <Info size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-gray-700">Shaxsiy ma'lumotlar</span>
                    </div>

                    <div className="p-4 divide-y divide-gray-50">
                        <ProfileItem icon={<User size={16} />} label="ID" value={student?.id} />
                        <ProfileItem icon={<Phone size={16} />} label="Telefon" value={student?.phoneNumber} />
                        <ProfileItem icon={<ShieldCheck size={16} />} label="Telegram ID" value={student?.tgId} />
                        <ProfileItem
                            icon={<Wallet size={16} />}
                            label="Balans"
                            value={`${Number(student?.wallet || 0).toLocaleString()} UZS`}
                            valueClass="text-green-600 font-bold"
                        />
                        <ProfileItem
                            icon={<ShieldCheck size={16} />}
                            label="Holati"
                            value={student?.isActive ? 'Faol' : 'Bloklangan'}
                            valueClass={student?.isActive ? 'text-green-500' : 'text-red-500'}
                        />
                        <ProfileItem
                            icon={<Calendar size={16} />}
                            label="Ro'yxatdan o'tdi"
                            value={student?.createdAt ? new Date(student.createdAt).toLocaleDateString('uz-UZ') : '-'}
                        />
                    </div>
                </div>
            </div>

            <TelegramStudentBottomNav studentId={id} />
        </div>
    );
};

// Yordamchi komponent kodni qisqartirish uchun
const ProfileItem = ({ icon, label, value, valueClass = "text-gray-900" }: any) => (
    <div className="flex justify-between items-center py-3">
        <div className="flex items-center gap-3 text-gray-500">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${valueClass}`}>{value ?? '-'}</span>
    </div>
);