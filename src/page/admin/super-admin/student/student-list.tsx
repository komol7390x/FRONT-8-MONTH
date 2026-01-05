import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { Pagination } from '../admin/components/pagantion';
import { StudentFilters } from './components/student-filters';
import { StudentCreateModal } from './components/student-create-modal';
import { StudentMoreModal } from './components/student-more-modal';
import { StudentTable } from './components/student-table';
import { StudentSort, type Student } from './service/useGetStudents';
import { useGetStudents } from './service/useGetStudents';

export const StudentList: React.FC = () => {
    const location = useLocation();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>(StudentSort.CREATED_AT);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isDeletedFilter, setIsDeletedFilter] = useState<string>('');

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

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

    const statusParam = statusFilter === '' ? undefined : statusFilter === 'true';
    const isDeletedParam = isDeletedFilter === '' ? undefined : isDeletedFilter === 'true';

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

    const openStudentId = useMemo(() => {
        const raw = (location.state as any)?.openStudentId;
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : undefined;
    }, [location.state]);

    useEffect(() => {
        if (!openStudentId) return;
        const s = students.find((x: any) => Number(x?.id) === openStudentId);
        if (!s) return;
        setSelectedStudent(s);
        setIsMoreOpen(true);
    }, [openStudentId, students]);

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
                        <h1 className="text-3xl font-bold text-gray-900">Students</h1>

                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateOpen(true);
                            }}
                            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            Add Student
                        </button>
                    </div>

                    <StudentFilters
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        applySearchNow={applySearchNow}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        isDeletedFilter={isDeletedFilter}
                        setIsDeletedFilter={setIsDeletedFilter}
                        sort={sort}
                        setSort={setSort}
                        onResetPage={() => setPage(1)}
                        onClear={() => {
                            setSearchInput('');
                            setSearch('');
                            setStatusFilter('');
                            setIsDeletedFilter('');
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
                        setIsMoreOpen(true);
                    }}
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
                    onClose={() => setIsMoreOpen(false)}
                    onRefetch={() => refetch()}
                />

                <StudentCreateModal
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onCreated={() => {
                        setIsCreateOpen(false);
                        refetch();
                    }}
                />
            </div>
        </div>
    );
};
