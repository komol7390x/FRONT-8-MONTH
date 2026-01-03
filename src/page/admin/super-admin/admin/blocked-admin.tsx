import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { X, Phone, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { SortEnum, useGetList, type Admin, } from './service/useGetList';

interface SortState {
  field: typeof SortEnum[keyof typeof SortEnum];
  order: 'asc' | 'desc';
}

interface EditForm {
  username: string;
  fullname: string;
  phoneNumber: string;
  role: string;
}

type ModalType = 'edit' | 'more' | '';

const AdminPanel: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [sort, setSort] = useState<SortState>({
    field: SortEnum.USERNAME,
    order: 'desc'
  });
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    username: '',
    fullname: '',
    phoneNumber: '',
    role: ''
  });
  const [limit, setLimit] = useState<number>(10);

  const { data, isPending, isError, error, refetch } = useGetList({
    limit,
    page,
    search,
    sort
  });

  // Backend strukturasiga moslash (res.data ichida yana data massivi kelyapti)
  const admins: Admin[] = data?.data || [];
  const totalCount: number = data?.meta?.totalItems || 0;
  const totalPages: number = data?.meta?.totalPages || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

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
    if (type === 'edit') {
      setEditForm({
        username: admin.username,
        fullname: admin.fullname,
        phoneNumber: admin.phoneNumber,
        role: admin.role
      });
    }
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedAdmin(null);
    setEditForm({ username: '', fullname: '', phoneNumber: '', role: '' });
  };

  const handleEdit = async (): Promise<void> => {
    try {
      if (selectedAdmin) {
        console.log('Editing admin:', selectedAdmin.id, editForm);
        closeModal();
        refetch();
      }
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Adminni o\'chirmoqchimisiz?')) {
      try {
        console.log('Deleting admin:', id);
        refetch();
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

  const renderPaginationButtons = (): JSX.Element[] => {
    const buttons: JSX.Element[] = [];
    if (!data?.meta) return buttons;

    const { totalPages, currentPage } = data.meta;
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${currentPage === i
            ? 'bg-gray-900 text-white shadow-md'
            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          {i}
        </button>
      );
    }

    return buttons;
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Admins</h1>
            <button className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              <span className="text-xl">+</span>
              Add Admin
            </button>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Search by username, phone or role"
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-600 font-medium">Sort by:</span>
            <button
              onClick={() => handleSort(SortEnum.USERNAME)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Username
              {sort.field === SortEnum.USERNAME && (
                sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
            <button
              onClick={() => handleSort(SortEnum.CREATED_AT)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Created Date
              {sort.field === SortEnum.CREATED_AT && (
                sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
            <button
              onClick={() => handleSort(SortEnum.UPDATED_AT)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Updated Date
              {sort.field === SortEnum.UPDATED_AT && (
                sort.order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Admin List */}
        {admins.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No admins found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {admin.avatarUrl ? (
                        <img
                          src={admin.avatarUrl}
                          alt={admin.fullname}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : null}
                      <div
                        className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                        style={{ display: admin.avatarUrl ? 'none' : 'flex' }}
                      >
                        {getInitials(admin.fullname)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{admin.fullname}</h3>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${admin.role === 'SUPERADMIN'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {admin.role}
                        </span>
                        {!admin.isActive && (
                          <span className="px-3 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <Phone size={14} />
                        <span className="text-sm">{admin.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal('more', admin)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      More
                    </button>
                    <button
                      onClick={() => openModal('edit', admin)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                Showing {admins.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount} results
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">Show:</span>
                <select
                  value={limit}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLimitChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {[5, 10, 20, 50, 100].map((v) => (
                    <option key={v} value={v}>{v} per page</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {page > 3 && (
                  <>
                    <button
                      onClick={() => setPage(1)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </button>
                    {page > 4 && <span className="px-2 text-gray-500">...</span>}
                  </>
                )}

                {renderPaginationButtons()}

                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                    <button
                      onClick={() => setPage(totalPages)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedAdmin && (
          <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'edit' ? 'Edit Admin' : 'Admin Details'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

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
                      <h3 className="text-xl font-semibold text-gray-900">{selectedAdmin.fullname}</h3>
                      <p className="text-sm text-gray-600">@{selectedAdmin.username}</p>
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mt-1 ${selectedAdmin.role === 'SUPERADMIN'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {selectedAdmin.role}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <p className="text-lg font-medium text-gray-900">{selectedAdmin.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedAdmin.isActive ? '✅ Active' : '❌ Inactive'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Created At</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedAdmin.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        closeModal();
                        openModal('edit', selectedAdmin);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedAdmin.id);
                        closeModal();
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'edit' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullname}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, fullname: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={editForm.phoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPERADMIN">SUPERADMIN</option>
                    </select>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEdit}
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Save Changes
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

export default AdminPanel;