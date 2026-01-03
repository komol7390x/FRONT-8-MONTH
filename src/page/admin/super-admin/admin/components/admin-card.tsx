import type React from 'react';
import { Phone } from 'lucide-react';
import type { Admin } from '../service/useGetList';

interface AdminCardProps {
    admins: Admin[];
    getInitials: (name: string) => string;
    openModal: (type: 'edit' | 'more' | '', admin: Admin) => void;
    handleDelete: (id: number) => Promise<void>;
    handleBlock: (id: number, currentActive: boolean) => void;
    isBlocking: boolean;
    page: number;
    limit: number;
}

export const AdminCard: React.FC<AdminCardProps> = ({ admins, getInitials, openModal, handleDelete, handleBlock, isBlocking, page, limit }) => {
    return (
        <div>
            {admins.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg">No admins found</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b border-gray-200 font-semibold text-sm text-gray-700">
                        <div className="col-span-1">№</div>
                        <div className="col-span-1">ID</div>
                        <div className="col-span-2">Name</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Phone</div>
                        <div className="col-span-4">Actions</div>
                    </div>

                    {/* Table Body */}
                    {admins.map((admin, index) => (
                        <div key={admin.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors">
                            {/* Number Column */}
                            <div className="col-span-1">
                                <span className="text-sm font-semibold text-gray-700">{((page - 1) * limit) + index + 1}</span>
                            </div>

                            {/* ID Column */}
                            <div className="col-span-1">
                                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{admin.id}</span>
                            </div>

                            {/* Name Column */}
                            <div className="col-span-2">
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
                            <div className="col-span-2">
                                {admin.isActive ? (
                                    <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                                        Blocked
                                    </span>
                                )}
                            </div>

                            {/* Phone Column */}
                            <div className="col-span-2">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Phone size={14} />
                                    <span>{admin.phoneNumber}</span>
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="col-span-3 flex items-center gap-2">
                                <button
                                    onClick={() => openModal('more', admin)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    More
                                </button>
                                <button
                                    onClick={() => openModal('edit', admin)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Edit
                                </button>
                                {admin.isActive ? (
                                    <button
                                        onClick={() => handleBlock(admin.id, admin.isActive)}
                                        disabled={isBlocking}
                                        className="flex-1 px-3 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
                                    >
                                        {isBlocking ? 'Jarayonda...' : 'Block'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBlock(admin.id, admin.isActive)}
                                        disabled={isBlocking}
                                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                    >
                                        {isBlocking ? 'Jarayonda...' : 'Active'}
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(admin.id)}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
};