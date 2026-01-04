import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';

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

            <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by username, phone or role"
                            value={localSearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setLocalSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onSearch(localSearch);
                                setPage(1);
                            }}
                            className="h-11 px-5 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <Search size={16} />
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLocalSearch('');
                                onSearch('');
                                setPage(1);
                            }}
                            className="h-11 px-5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};