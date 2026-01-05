import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Pagination } from '../admin/components/pagantion';
import { StudentFilters } from './components/student-filters';
import { StudentMoreModal } from './components/student-more-modal';
import { StudentTable } from './components/student-table';
import { StudentSort, type Student } from './service/useGetStudents';
import { useGetStudents } from './service/useGetStudents';
import Cookies from 'js-cookie';
import { TokenName } from '../../../../config/enum';
import { jwtDecode } from 'jwt-decode';
import { Roles } from '../../../../config/roles';

export const StudentDelete: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>(StudentSort.CREATED_AT);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isDeletedFilter, setIsDeletedFilter] = useState<string>('');

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

    const [initialAction, setInitialAction] = useState<any>(null);

    const token = Cookies.get(TokenName.TOKEN_NAME);
    let role: string | undefined;
    try {
        role = token ? (jwtDecode<any>(token) as any)?.role : undefined;
    } catch {
        role = undefined;
    }
    const isAdminRole = String(role || '').toUpperCase() === String(Roles.ADMIN).toUpperCase();

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

    const statusParam = undefined;
    const isDeletedParam = true;

    const { data, isPending, isError, error, refetch } = useGetStudents({
        page,
        limit,
        search,
        sort: sort as any,
        status: statusParam,
        isDeleted: isDeletedParam,
    });

    const students = data?.data || [];
    const totalCount = data?.meta?.totalItems || students.length;
    const totalPages = data?.meta?.totalPages || 0;

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const handleRecover = (id: number) => {
        if (isAdminRole) return;
        const s = students.find((x) => x.id === id);
        if (!s) return;
        setSelectedStudent(s);
        setInitialAction('restore');
        setIsMoreOpen(true);
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
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Deleted Students</h1>
                    </div>

                    <StudentFilters
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        applySearchNow={applySearchNow}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        isDeletedFilter={isDeletedFilter}
                        setIsDeletedFilter={setIsDeletedFilter}
                        disableStatus={true}
                        disableDeleted={true}
                        sort={sort}
                        setSort={setSort}
                        onResetPage={() => setPage(1)}
                        onClear={() => {
                            setSearchInput('');
                            setSearch('');
                            setSort(StudentSort.CREATED_AT);
                            setPage(1);
                        }}
                    />
                </div>

                <StudentTable
                    students={students}
                    page={page}
                    limit={limit}
                    onMore={(s) => {
                        setSelectedStudent(s);
                        setInitialAction(null);
                        setIsMoreOpen(true);
                    }}
                    showRecover={!isAdminRole}
                    onRecover={handleRecover}
                    isRecovering={false}
                />

                <Pagination
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    admins={students as any}
                    setPage={setPage}
                    handleLimitChange={handleLimitChange}
                />

                <StudentMoreModal
                    open={isMoreOpen}
                    student={selectedStudent}
                    deleteMode={true}
                    onClose={() => setIsMoreOpen(false)}
                    onRefetch={() => refetch()}
                    initialAction={initialAction}
                />
            </div>
        </div>
    );
};
