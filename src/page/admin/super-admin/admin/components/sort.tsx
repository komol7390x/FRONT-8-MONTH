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
        <div>
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .sort-container {
                    animation: slideDown 0.8s ease-out;
                }
            `}</style>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 sort-container">
                <div className="flex items-center gap-6 text-sm flex-wrap">
                    <span style={{ animation: 'fadeIn 0.6s ease-out 0s forwards' }} className="text-gray-600 font-medium">Sort by:</span>

                    <button
                        onClick={() => handleSort(SortEnum.USERNAME)}
                        style={{ animation: 'fadeIn 0.6s ease-out 0.1s forwards' }}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-110"
                    >
                        Username
                        {sort.field === SortEnum.USERNAME && (
                            <span className="transition-transform duration-300">
                                {sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleSort(SortEnum.FULLNAME)}
                        style={{ animation: 'fadeIn 0.6s ease-out 0.2s forwards' }}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-110"
                    >
                        Full Name
                        {sort.field === SortEnum.FULLNAME && (
                            <span className="transition-transform duration-300">
                                {sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleSort(SortEnum.PHONENUMBER)}
                        style={{ animation: 'fadeIn 0.6s ease-out 0.3s forwards' }}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-110"
                    >
                        Phone Number
                        {sort.field === SortEnum.PHONENUMBER && (
                            <span className="transition-transform duration-300">
                                {sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleSort(SortEnum.CREATED_AT)}
                        style={{ animation: 'fadeIn 0.6s ease-out 0.4s forwards' }}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-110"
                    >
                        Created Date
                        {sort.field === SortEnum.CREATED_AT && (
                            <span className="transition-transform duration-300">
                                {sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => handleSort(SortEnum.UPDATED_AT)}
                        style={{ animation: 'fadeIn 0.6s ease-out 0.5s forwards' }}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-110"
                    >
                        Updated Date
                        {sort.field === SortEnum.UPDATED_AT && (
                            <span className="transition-transform duration-300">
                                {sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
