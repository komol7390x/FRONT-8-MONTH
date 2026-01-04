import type React from 'react';
import { ChevronDown, Search } from 'lucide-react';
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
}) => {
    return (
        <div className="mt-4 space-y-3">
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
                        className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                    />
                </div>

                <button
                    type="button"
                    onClick={applySearchNow}
                    className="h-11 px-5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                    <Search size={16} />
                    Search
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            onResetPage();
                        }}
                        disabled={!!disableStatus}
                        className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-xl bg-white disabled:bg-gray-100 text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="">Status: All</option>
                        <option value="true">Active</option>
                        <option value="false">Blocked</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={isDeletedFilter}
                        onChange={(e) => {
                            setIsDeletedFilter(e.target.value);
                            onResetPage();
                        }}
                        disabled={!!disableDeleted}
                        className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-xl bg-white disabled:bg-gray-100 text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="">Deleted: All</option>
                        <option value="true">Deleted</option>
                        <option value="false">Not Deleted</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            onResetPage();
                        }}
                        className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-xl bg-white text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value={StudentSort.CREATED_AT}>Sort: Created</option>
                        <option value={StudentSort.UPDATED_AT}>Sort: Updated</option>
                        <option value={StudentSort.FIRST_NAME}>Sort: First name</option>
                        <option value={StudentSort.LAST_NAME}>Sort: Last name</option>
                        <option value={StudentSort.TG_USERNAME}>Sort: Tg username</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
            </div>
        </div>
    );
};
