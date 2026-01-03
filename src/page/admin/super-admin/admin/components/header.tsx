import React, { useEffect, useState } from 'react';

interface HeaderProps {
    setPage: (page: number) => void;
    onSearch: (value: string) => void; // Parentdagi search state'ni yangilash uchun
}

export const Header: React.FC<HeaderProps> = ({ setPage, onSearch }) => {
    const [localSearch, setLocalSearch] = useState<string>('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(localSearch); // Debounce tugagach parentdagi searchni yangilaymiz
        }, 500);

        return () => clearTimeout(timer);
    }, [localSearch]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Admins</h1>
                <button className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <span className="text-xl">+</span>
                    Add Admin
                </button>
            </div>

            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Search by username, phone or role"
                    value={localSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLocalSearch(e.target.value);
                        setPage(1); // Qidiruv o'zgarganda birinchi sahifaga qaytaramiz
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
            </div>
        </div>
    );
};