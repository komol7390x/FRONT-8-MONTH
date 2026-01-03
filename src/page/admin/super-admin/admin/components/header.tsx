import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
    setPage: (page: number) => void;
    onSearch: (value: string) => void; // Parentdagi search state'ni yangilash uchun
    openCreateModal: () => void; // Create modalini ochish uchun
    showAddAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ setPage, onSearch, openCreateModal, showAddAdmin = true }) => {
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
                {showAddAdmin && (
                    <button onClick={openCreateModal} className="bg-green-600 text-white px-6 py-2.5 rounded font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                        <Plus size={16} />
                        Add Admin
                    </button>
                )}
            </div>

            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Search by username, phone or role"
                    value={localSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLocalSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
            </div>
        </div>
    );
};