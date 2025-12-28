import { useEffect, useState } from 'react';
import { BookOpen, Award, Clock, TrendingUp, User } from 'lucide-react';

export const MainStudent = () => {
    const [tgObject, setTgObject] = useState<any>(null);

    useEffect(() => {
        // window.Telegram.WebApp mavjudligini tekshirish
        const tg = (window as any).Telegram?.WebApp;

        if (tg) {
            tg.ready();
            tg.expand(); // Ilovani darhol yoyish

            // Ranglarni qat'iy belgilash
            tg.setHeaderColor('secondary_bg_color');
            tg.setBackgroundColor('secondary_bg_color');

            setTgObject(tg);
        }
    }, []);

    const stats = [
        { id: 1, label: 'Davomat', value: '92%', icon: <Clock size={20} />, color: 'bg-blue-500' },
        { id: 2, label: 'O‘rtacha ball', value: '4.8', icon: <TrendingUp size={20} />, color: 'bg-green-500' },
        { id: 3, label: 'Kurslar', value: '6 ta', icon: <BookOpen size={20} />, color: 'bg-purple-500' },
        { id: 4, label: 'Yutuqlar', value: '12 ta', icon: <Award size={20} />, color: 'bg-yellow-500' },
    ];

    return (
        /* To'liq ekran bo'lishi uchun h-screen o'rniga inline style ishlatamiz */
        <div
            style={{ minHeight: '100vh' }}
            className="w-full bg-[#f4f4f7] dark:bg-[#1c1c1d] p-4 font-sans text-slate-900 dark:text-white overflow-y-auto"
        >
            {/* Profil qismi */}
            <div className="flex items-center space-x-4 mb-6 bg-white dark:bg-[#2c2c2e] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-md font-bold">
                    {tgObject?.initDataUnsafe?.user?.photo_url ? (
                        <img src={tgObject.initDataUnsafe.user.photo_url} className="rounded-full" alt="" />
                    ) : <User size={28} />}
                </div>
                <div>
                    <h2 className="text-lg font-bold">
                        {tgObject?.initDataUnsafe?.user?.first_name || "Talaba"} {tgObject?.initDataUnsafe?.user?.last_name || ""}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{tgObject?.initDataUnsafe?.user?.username || "student"}</p>
                </div>
            </div>

            {/* Statistika Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-[#2c2c2e] border border-gray-100 dark:border-gray-800 flex flex-col items-start space-y-2 active:opacity-80 transition-opacity select-none">
                        <div className={`${item.color} p-2 rounded-lg text-white`}>
                            {item.icon}
                        </div>
                        <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">{item.label}</span>
                        <span className="text-xl font-black">{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Progress Card */}
            <div className="bg-white dark:bg-[#2c2c2e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">O'zlashtirish</h3>
                    <span className="text-blue-500 font-bold">75%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out" style={{ width: '75%' }}></div>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => tgObject?.HapticFeedback.impactOccurred('medium')}
                className="w-full py-4 bg-[#0088cc] text-white font-bold rounded-2xl shadow-lg active:scale-[0.97] transition-all"
            >
                Batafsil ma'lumot
            </button>
        </div>
    );
};