import type React from 'react';
import { Phone, MoreHorizontal, Edit, Ban, Unlock, Trash2 } from 'lucide-react';
import type { Admin } from '../service/useGetList';

interface AdminCardProps {
    admins: Admin[];
    getInitials: (name: string) => string;
    openModal: (type: 'edit' | 'more' | '', admin: Admin) => void;
    showMore?: boolean;
    showDelete?: boolean;
    showEdit?: boolean;
    showBlock?: boolean;
    handleSoftDelete: (id: number) => Promise<void>;
    handleBlock?: (id: number) => void;
    isBlocking?: boolean;
    isDeleting?: boolean;

    page: number;
    limit: number;
}

export const AdminCard: React.FC<AdminCardProps> = ({ admins, getInitials, openModal, showMore = true, showDelete = true, showEdit = true, showBlock = true, handleSoftDelete, handleBlock, isBlocking, isDeleting = false, page, limit }) => {
    return (
        <div>
            {admins.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg">No admins found</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Table Header: 7 equal columns for consistent spacing */}
                        <div className="grid grid-cols-7 gap-x-10 px-4 bg-gray-50 p-4 border-b border-gray-200 font-semibold text-sm text-gray-700">
                            <div className="col-span-1">№</div>
                            <div className="col-span-1">ID</div>
                            <div className="col-span-1">Name</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-1">Phone</div>
                            <div className="col-span-1">Created At</div>
                            <div className="col-span-1 text-right pr-2">Action</div>
                        </div>

                        {/* Table Body */}
                        {admins.map((admin, index) => (
                            <div key={admin.id} className="grid grid-cols-7 gap-x-10 px-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors">
                                {/* Number Column */}
                                <div className="col-span-1">
                                    <span className="text-sm font-semibold text-gray-700">{((page - 1) * limit) + index + 1}</span>
                                </div>

                                {/* ID Column */}
                                <div className="col-span-1">
                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{admin.id}</span>
                                </div>

                                {/* Name Column */}
                                <div className="col-span-1">
                                    <div className="flex items-center gap-2">
                                        {admin.avatarUrl ? (
                                            <img
                                                src={admin.avatarUrl}
                                                alt={admin.fullname}
                                                className="w-8 h-8 rounded-full object-cover"
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
                                        ) : (
                                            <div
                                                className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                                            >
                                                {getInitials(admin.fullname)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{admin.fullname}</p>
                                            <p className="text-xs text-gray-500">@{admin.username}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Column */}
                                <div className="col-span-1">
                                    {admin.isActive ? (
                                        <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-green-600 text-white min-w-22 text-center">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-red-600 text-white min-w-22 text-center">
                                            Blocked
                                        </span>
                                    )}
                                </div>

                                {/* Phone Column */}
                                <div className="col-span-1 min-w-0">
                                    <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                                        <Phone size={14} className="shrink-0" />
                                        <span className="flex-1 min-w-0 truncate">{admin.phoneNumber}</span>
                                    </div>
                                </div>

                                {/* Created At Column */}
                                <div className="col-span-1">
                                    <span className="text-xs font-medium text-emerald-700 whitespace-nowrap">
                                        {new Date(admin.createdAt || '').toLocaleString('uz-UZ', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                {/* Actions Column */}
                                <div className="col-span-1 flex justify-end items-center gap-1 pr-2">
                                    {showMore && (
                                        <button
                                            onClick={() => openModal('more', admin)}
                                            className="px-3 py-1.5 bg-sky-500 text-white rounded text-sm font-medium hover:bg-sky-600 transition-colors flex items-center gap-2"
                                        >
                                            <MoreHorizontal size={12} />
                                            More
                                        </button>
                                    )}
                                    {showEdit && (
                                        <button
                                            onClick={() => openModal('edit', admin)}
                                            className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Edit size={12} />
                                            Edit
                                        </button>
                                    )}
                                    {showBlock && (
                                        <>
                                            {admin.isActive ? (
                                                <button
                                                    onClick={() => handleBlock?.(admin.id)}
                                                    disabled={isBlocking}
                                                    className="flex-1 px-2 py-1.5 bg-orange-500 text-white rounded text-sm font-medium hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Ban size={12} />
                                                    {isBlocking ? 'Processing...' : 'Block'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlock?.(admin.id)}
                                                    disabled={isBlocking}
                                                    className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Unlock size={12} />
                                                    {isBlocking ? 'Bajarilmoqda...' : 'Active'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {showDelete && (
                                        <button
                                            onClick={() => handleSoftDelete(admin.id)}
                                            disabled={isDeleting}
                                            className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Trash2 size={12} />
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
};