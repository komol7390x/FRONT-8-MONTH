import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SortEnum, useGetList, type Admin } from './service/useGetList';
import { Header } from './components/header';
import { Sort } from './components/sort';
import { AdminCard } from './components/admin-card';
import { Pagination } from './components/pagantion';

interface SortState {
    field: typeof SortEnum[keyof typeof SortEnum];
    order: 'asc' | 'desc';
}

export const ListAdmin: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [status, setStatus] = useState<boolean | undefined>(undefined);
    const [sort, setSort] = useState<SortState>({
        field: SortEnum.USERNAME,
        order: 'desc'
    });

    const [limit, setLimit] = useState<number>(10);
    const [search, setSearch] = useState<string>('');

    const { data, isPending, isError, error, refetch } = useGetList({
        limit,
        page,
        search,
        sort,
        status
    });

    const admins: Admin[] = data?.data || [];
    const totalCount: number = data?.meta?.totalItems || 0;
    const totalPages: number = data?.meta?.totalPages || 0;

    const handleSort = (field: typeof SortEnum[keyof typeof SortEnum]): void => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
        setPage(1);
    };

    const handleLimitChange = (newLimit: string | number): void => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const openModal = (type: 'edit' | 'more' | '', admin: Admin): void => {
        // Modal ochish funksiyasi - hozircha bo'sh
        console.log('Opening modal for admin:', admin.id, type);
    };

    const handleSoftDelete = async (id: number): Promise<void> => {
        if (window.confirm('Adminni o\'chirishni tasdiqlaysizmi?')) {
            console.log('Deleting admin:', id);
        }
    };

    const getInitials = (name: string): string => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : 'AD';
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                <span className="ml-3 text-xl text-gray-600">Loading...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-900 mb-4">Error: {(error as Error)?.message}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">

                <Header
                    setPage={setPage}
                    onSearch={setSearch}
                    openCreateModal={() => { }}
                />

                <Sort
                    sort={sort}
                    handleSort={handleSort}
                />

                <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <button
                            type="button"
                            onClick={() => {
                                setStatus(undefined);
                                setPage(1);
                            }}
                            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${status === undefined
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStatus(true);
                                setPage(1);
                            }}
                            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${status === true
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStatus(false);
                                setPage(1);
                            }}
                            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${status === false
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Blocked
                        </button>
                    </div>
                </div>

                <AdminCard
                    admins={admins}
                    getInitials={getInitials}
                    openModal={openModal}
                    showMore={true}
                    showEdit={false}
                    showBlock={false}
                    showDelete={false}
                    handleSoftDelete={handleSoftDelete}
                    isDeleting={false}
                    page={page}
                    limit={limit}
                />

                <Pagination
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    admins={admins}
                    setPage={setPage}
                    handleLimitChange={handleLimitChange}
                />
            </div>
        </div>
    );
};
