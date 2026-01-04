
import React, { useState } from 'react';
import { Loader2, Trash2, X, Copy, Shield } from 'lucide-react';
import { SortEnum, useGetList, type Admin } from './service/useGetList';
import { useDeleteAdmin } from './service/useDeleteAdmin';
import { Header } from './components/header';
import { Sort } from './components/sort';
import { Pagination } from './components/pagantion';

interface SortState {
  field: typeof SortEnum[keyof typeof SortEnum];
  order: 'asc' | 'desc';
}

type ModalType = 'delete' | 'more' | '';

export const DeleteAdmin: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<SortState>({
    field: SortEnum.USERNAME,
    order: 'desc'
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');

  const { data, isPending, isError, error, refetch } = useGetList({
    limit,
    page,
    search,
    sort,
    isDeleted: true
  });

  const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin();

  const admins: Admin[] = data?.data || [];
  const totalCount: number = data?.meta?.totalItems || 0;
  const totalPages: number = data?.meta?.totalPages || 0;

  const handleSort = (field: typeof SortEnum[keyof typeof SortEnum]): void => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  const handleLimitChange = (newLimit: string | number): void => {
    setLimit(Number(newLimit));
    setPage(1);
  };

  const openModal = (type: ModalType, admin: Admin): void => {
    setModalType(type);
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedAdmin(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (selectedAdmin) {
      try {
        await deleteAdmin(selectedAdmin.id, {
          onSuccess: () => {
            closeModal();
            refetch();
          }
        } as any);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const getInitials = (name: string): string => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'AD';
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Error: {(error as Error)?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          setPage={setPage}
          onSearch={setSearch}
          openCreateModal={() => { }}
          showAddAdmin={false}
        />

        {/* Sort Controls */}
        <Sort
          sort={sort}
          handleSort={handleSort}
        />

        {/* Admin List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {admin.avatarUrl ? (
                      <img
                        src={admin.avatarUrl}
                        alt={admin.fullname}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-linear-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {getInitials(admin.fullname)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{admin.fullname}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${admin.role === 'SUPERADMIN'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {admin.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">@{admin.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${admin.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {admin.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Phone:</span>
                    <span>{admin.phoneNumber}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">ID:</span>
                    <span>{admin.id}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('more', admin)}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 5a3 3 0 00-3 3m6 0a3 3 0 00-3 3m-3 3v6m6-6v6" />
                    </svg>
                    More
                  </button>
                  <button
                    onClick={() => openModal('delete', admin)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalPages={totalPages}
          totalCount={totalCount}
          admins={admins}
          setPage={setPage}
          handleLimitChange={handleLimitChange}
        />

        {/* Modal */}
        {showModal && selectedAdmin && (
          <div
            className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'delete' ? 'Delete Admin' : 'Admin Details'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {modalType === 'delete' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 size={32} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Delete {selectedAdmin.fullname}?
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      This action cannot be undone.
                    </p>
                    <p className="text-xs text-gray-500">
                      Admin ID: {selectedAdmin.id}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      {selectedAdmin.avatarUrl ? (
                        <img
                          src={selectedAdmin.avatarUrl}
                          alt={selectedAdmin.fullname}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(selectedAdmin.fullname)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{selectedAdmin.fullname}</p>
                        <p className="text-sm text-gray-600">@{selectedAdmin.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={closeModal}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete Admin
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'more' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    {selectedAdmin.avatarUrl ? (
                      <img
                        src={selectedAdmin.avatarUrl}
                        alt={selectedAdmin.fullname}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                        {getInitials(selectedAdmin.fullname)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{selectedAdmin.id}</span>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedAdmin.fullname}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">@{selectedAdmin.username}</p>
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mt-2 ${selectedAdmin.role === 'SUPERADMIN'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {selectedAdmin.role}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="group flex items-center justify-between p-2.5 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-sm transition-all duration-200">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-0.5">ID</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedAdmin.id}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedAdmin.id?.toString() || '')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-all duration-200"
                        title="Copy ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <div className="group flex items-center justify-between p-2.5 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-sm transition-all duration-200">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-600 mb-0.5">Full Name</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedAdmin.fullname}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedAdmin.fullname || '')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-400 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200"
                        title="Copy Full Name"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <div className="group flex items-center justify-between p-2.5 bg-linear-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-sm transition-all duration-200">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-purple-600 mb-0.5">Username</p>
                        <p className="text-sm font-semibold text-gray-900">@{selectedAdmin.username}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedAdmin.username || '')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-purple-400 hover:text-purple-600 hover:bg-white rounded-md transition-all duration-200"
                        title="Copy Username"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <div className="group flex items-center justify-between p-2.5 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-sm transition-all duration-200">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-600 mb-0.5">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedAdmin.phoneNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedAdmin.phoneNumber || '')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-green-400 hover:text-green-600 hover:bg-white rounded-md transition-all duration-200"
                        title="Copy Phone Number"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-linear-to-r from-orange-50 to-red-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-orange-600 mb-0.5">Role</p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${selectedAdmin.role === 'SUPERADMIN'
                          ? 'bg-linear-to-r from-red-500 to-pink-500 text-white'
                          : 'bg-linear-to-r from-blue-500 to-cyan-500 text-white'
                          }`}>
                          {selectedAdmin.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-linear-to-r from-teal-50 to-cyan-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-teal-600 mb-0.5">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${selectedAdmin.isActive
                          ? 'bg-linear-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-linear-to-r from-red-500 to-rose-500 text-white'
                          }`}>
                          {selectedAdmin.isActive ? '✓ Active' : '✗ Blocked'}
                        </span>
                      </div>
                    </div>

                    <div className="group flex items-center justify-between p-2.5 bg-linear-to-r from-gray-50 to-slate-50 rounded-lg hover:shadow-sm transition-all duration-200">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-0.5">Created At</p>
                        <p className="text-xs font-medium text-gray-700">
                          {new Date(selectedAdmin.createdAt || '').toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(new Date(selectedAdmin.createdAt || '').toLocaleString())}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-all duration-200"
                        title="Copy Created At"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        setModalType('delete');
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Shield size={16} />
                      Block
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
