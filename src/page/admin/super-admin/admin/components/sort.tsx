import { ChevronDown, ChevronUp } from 'lucide-react'
import { SortEnum } from '../service/useGetList'
import type React from 'react';

interface SortState {
    field: typeof SortEnum[keyof typeof SortEnum];
    order: 'asc' | 'desc';
}

interface SortProps {
    sort: SortState;
    handleSort: (field: typeof SortEnum[keyof typeof SortEnum]) => void;
}

export const Sort: React.FC<SortProps> = ({ sort, handleSort }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Sort by</span>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => handleSort(SortEnum.USERNAME)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${sort.field === SortEnum.USERNAME
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Username
                        {sort.field === SortEnum.USERNAME && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSort(SortEnum.FULLNAME)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${sort.field === SortEnum.FULLNAME
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Full Name
                        {sort.field === SortEnum.FULLNAME && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSort(SortEnum.PHONENUMBER)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${sort.field === SortEnum.PHONENUMBER
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Phone
                        {sort.field === SortEnum.PHONENUMBER && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSort(SortEnum.IS_ACTIVE)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${sort.field === SortEnum.IS_ACTIVE
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Status
                        {sort.field === SortEnum.IS_ACTIVE && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSort(SortEnum.CREATED_AT)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${sort.field === SortEnum.CREATED_AT
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Created
                        {sort.field === SortEnum.CREATED_AT && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSort(SortEnum.UPDATED_AT)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${sort.field === SortEnum.UPDATED_AT
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Updated
                        {sort.field === SortEnum.UPDATED_AT && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>
                </div>
            </div>
        </div>
    )
}
