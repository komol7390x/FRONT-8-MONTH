import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Info, User, Phone, Wallet, Calendar, ShieldCheck, Globe } from 'lucide-react';
import { useGetStudentById } from '../admin/super-admin/student/service/useGetStudentById';
import { PageLoader } from '../../components/page-loader';

export const StudentProfilePage: React.FC = () => {
    const { studentId: paramId } = useParams<{ studentId: string }>();

    // 1. IDni aniqlash: Shell tomonidan saqlangan IDni birinchi ko'ramiz
    const readFromStorage = () => {
        try {
            return Number(localStorage.getItem('telegram_student_internal_id') || localStorage.getItem('telegram_student_id')) || 0;
        } catch {
            return 0;
        }
    };

    const [studentId, setStudentId] = useState<number>(() => {
        const fromParam = Number(paramId) || 0;
        return fromParam || readFromStorage() || 0;
    });

    useEffect(() => {
        const fromParam = Number(paramId) || 0;
        const next = fromParam || readFromStorage() || 0;
        if (next && next !== studentId) {
            setStudentId(next);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramId]);

    useEffect(() => {
        const handler = (e: any) => {
            const id = Number(e?.detail?.studentId);
            if (Number.isFinite(id) && id > 0) {
                setStudentId(prev => (prev === id ? prev : id));
            }
        };
        window.addEventListener('telegram-student-id-updated', handler as any);
        return () => window.removeEventListener('telegram-student-id-updated', handler as any);
    }, []);

    // 2. Ma'lumotlarni yuklash
    const { data: student, isPending } = useGetStudentById(studentId);

    const fullname = `${student?.firstName || ''} ${student?.lastName || ''}`.trim();

    if (isPending) return <PageLoader />;

    if (!student && !isPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <User size={40} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Ma'lumot topilmadi</h3>
                <p className="text-sm text-gray-500 mt-1">Sizning profilingiz bo'yicha ma'lumotlar bazadan topilmadi.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            {/* Profil Header - Modern Gradient */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-md mx-auto px-6 py-10 text-center">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-[2.5rem] mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-green-100 rotate-6">
                            <span className="-rotate-6">{fullname ? fullname.charAt(0).toUpperCase() : 'S'}</span>
                        </div>
                        {student?.isActive && (
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        )}
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mt-6 tracking-tight">
                        {fullname || 'Talaba'}
                    </h1>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full mt-2">
                        <span className="text-xs font-bold uppercase tracking-wider">
                            @{student?.tgUsername || 'username'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {/* Balans Kartasi */}
                <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 opacity-60 mb-1">
                            <Wallet size={16} />
                            <span className="text-xs font-medium uppercase tracking-widest">Mening balansim</span>
                        </div>
                        <div className="text-3xl font-black tabular-nums">
                            {Number(student?.wallet || 0).toLocaleString()} <span className="text-lg font-medium opacity-60">UZS</span>
                        </div>
                    </div>
                </div>

                {/* Shaxsiy ma'lumotlar ro'yxati */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2">
                    <div className="p-4 flex items-center gap-2 border-b border-gray-50">
                        <Info size={18} className="text-green-600" />
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Profil ma'lumotlari</span>
                    </div>

                    <div className="px-2">
                        <ProfileItem
                            icon={<User size={18} />}
                            label="Foydalanuvchi ID"
                            value={`#${student?.id}`}
                        />
                        <ProfileItem
                            icon={<Phone size={18} />}
                            label="Telefon raqami"
                            value={student?.phoneNumber}
                        />
                        <ProfileItem
                            icon={<ShieldCheck size={18} />}
                            label="Telegram ID"
                            value={student?.tgId}
                        />
                        <ProfileItem
                            icon={<Calendar size={18} />}
                            label="Ro'yxatdan o'tgan sana"
                            value={student?.createdAt ? new Date(student.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        />
                        <ProfileItem
                            icon={<Globe size={18} />}
                            label="Profil holati"
                            value={student?.isActive ? 'Faol foydalanuvchi' : 'Bloklangan'}
                            valueClass={student?.isActive ? 'text-green-600' : 'text-red-500'}
                        />
                    </div>
                </div>

                {/* Yordam bo'limi */}
                <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Ma'lumotlarni o'zgartirish</h4>
                        <p className="text-xs text-blue-700/70 mt-0.5 leading-relaxed">
                            Agar shaxsiy ma'lumotlaringizda xatolik bo'lsa, iltimos o'quv markazi administratsiyasi bilan bog'laning.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Yordamchi komponent
const ProfileItem = ({ icon, label, value, valueClass = "text-gray-900" }: any) => (
    <div className="flex justify-between items-center py-4 px-3 hover:bg-gray-50 rounded-2xl transition-colors">
        <div className="flex items-center gap-4">
            <div className="text-gray-400">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-1">{label}</span>
                <span className={`text-sm font-bold ${valueClass}`}>{value ?? 'Kiritilmagan'}</span>
            </div>
        </div>
    </div>
);