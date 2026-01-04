import { Select } from 'antd';
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
            <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-gray-700">Filters</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <Select
                        allowClear
                        value={sort.field}
                        onChange={(v) => handleSort(v as any)}
                        style={{ width: '100%' }}
                        placeholder="Sort"
                        options={[
                            { value: SortEnum.USERNAME, label: 'Username' },
                            { value: SortEnum.FULLNAME, label: 'Full name' },
                            { value: SortEnum.PHONENUMBER, label: 'Phone' },
                            { value: SortEnum.IS_ACTIVE, label: 'Status' },
                            { value: SortEnum.CREATED_AT, label: 'Created' },
                            { value: SortEnum.UPDATED_AT, label: 'Updated' },
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}
