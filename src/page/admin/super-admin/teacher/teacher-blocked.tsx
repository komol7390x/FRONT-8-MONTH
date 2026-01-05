import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useGetTeachers, TeacherSort, type Teacher } from './service/useGetTeachers';
import { Pagination } from '../admin/components/pagantion';
import { TeacherFilters } from './components/teacher-filters';
import { TeacherTable } from './components/teacher-table';
import { TeacherMoreModal } from './components/teacher-more-modal';
import { TeacherEditModal } from './components/teacher-edit-modal';

export const TeacherBlocked: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>(TeacherSort.FULLNAME);
    const [level, setLevel] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isDeletedFilter, setIsDeletedFilter] = useState<string>('');

    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

    const applySearchNow = () => {
        setSearch(searchInput);
        setPage(1);
    };

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 1000);
        return () => clearTimeout(t);
    }, [searchInput]);

    const statusParam = false;
    const isDeletedParam = isDeletedFilter === '' ? undefined : isDeletedFilter === 'true';

    const { data, isPending, isError, error, refetch } = useGetTeachers({
        page,
        limit,
        search,
        sort: sort as any,
        level: (level as any) || undefined,
        status: statusParam,
        isDeleted: isDeletedParam,
    });

    const teachers = data?.data || [];
    const totalCount = data?.meta?.totalItems || teachers.length;
    const totalPages = data?.meta?.totalPages || 0;

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                <span className="ml-3 text-xl text-gray-600">Loading...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center">
                <p className="text-xl text-red-600 mb-4">Error: {(error as Error)?.message}</p>
                <button onClick={() => refetch()} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Blocked Teachers</h1>
                    </div>

                    <TeacherFilters
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        applySearchNow={applySearchNow}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        isDeletedFilter={isDeletedFilter}
                        setIsDeletedFilter={setIsDeletedFilter}
                        disableStatus={true}
                        sort={sort}
                        setSort={setSort}
                        level={level}
                        setLevel={setLevel}
                        onResetPage={() => setPage(1)}
                        onClear={() => {
                            setSearchInput('');
                            setSearch('');
                            setStatusFilter('');
                            setIsDeletedFilter('');
                            setSort(TeacherSort.FULLNAME);
                            setLevel('');
                            setPage(1);
                        }}
                    />
                </div>

                <TeacherTable
                    teachers={teachers}
                    page={page}
                    limit={limit}
                    onMore={(t) => {
                        setSelectedTeacher(t);
                        setIsMoreOpen(true);
                    }}
                />

                <Pagination
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    admins={teachers as any}
                    setPage={setPage}
                    handleLimitChange={handleLimitChange}
                />

                <TeacherMoreModal
                    open={isMoreOpen}
                    teacher={selectedTeacher}
                    onClose={() => {
                        setIsMoreOpen(false);
                    }}
                    onEdit={() => {
                        setIsMoreOpen(false);
                        setIsEditOpen(true);
                    }}
                    onRefetch={() => refetch()}
                />

                <TeacherEditModal
                    open={isEditOpen}
                    teacher={selectedTeacher}
                    onClose={() => setIsEditOpen(false)}
                    onUpdated={() => {
                        setIsEditOpen(false);
                        refetch();
                    }}
                />
            </div>
        </div>
    );
};
