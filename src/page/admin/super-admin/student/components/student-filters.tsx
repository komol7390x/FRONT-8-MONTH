import type React from 'react';
import { Search } from 'lucide-react';
import { Select } from 'antd';
import { StudentSort } from '../service/useGetStudents';

interface StudentFiltersProps {
    searchInput: string;
    setSearchInput: (v: string) => void;
    applySearchNow: () => void;

    statusFilter: string;
    setStatusFilter: (v: string) => void;
    isDeletedFilter: string;
    setIsDeletedFilter: (v: string) => void;
    disableStatus?: boolean;
    disableDeleted?: boolean;

    sort: string;
    setSort: (v: string) => void;

    onResetPage: () => void;
    onClear?: () => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
    searchInput,
    setSearchInput,
    applySearchNow,

    statusFilter,
    setStatusFilter,
    isDeletedFilter,
    setIsDeletedFilter,
    disableStatus,
    disableDeleted,

    sort,
    setSort,

    onResetPage,
    onClear,
}) => {
    return (
        <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by firstname/lastname/phone/tg/id"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') applySearchNow();
                        }}
                        className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm shadow-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={applySearchNow}
                        className="h-11 px-5 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <Search size={16} />
                        Search
                    </button>
                    {!!onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="h-11 px-5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Select
                    allowClear
                    disabled={!!disableStatus}
                    value={statusFilter || undefined}
                    onChange={(v) => {
                        setStatusFilter(v ?? '');
                        onResetPage();
                    }}
                    placeholder="Status"
                    style={{ width: '100%' }}
                    options={[
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Blocked' },
                    ]}
                />

                <Select
                    allowClear
                    disabled={!!disableDeleted}
                    value={isDeletedFilter || undefined}
                    onChange={(v) => {
                        setIsDeletedFilter(v ?? '');
                        onResetPage();
                    }}
                    placeholder="Deleted"
                    style={{ width: '100%' }}
                    options={[
                        { value: 'true', label: 'Deleted' },
                        { value: 'false', label: 'Not Deleted' },
                    ]}
                />

                <Select
                    allowClear
                    value={sort}
                    onChange={(v) => {
                        setSort(v);
                        onResetPage();
                    }}
                    placeholder="Sort"
                    style={{ width: '100%' }}
                    options={[
                        { value: StudentSort.CREATED_AT, label: 'Created' },
                        { value: StudentSort.UPDATED_AT, label: 'Updated' },
                        { value: StudentSort.FIRST_NAME, label: 'First name' },
                        { value: StudentSort.LAST_NAME, label: 'Last name' },
                        { value: StudentSort.TG_USERNAME, label: 'Tg username' },
                    ]}
                />
            </div>
        </div>
    );
};
