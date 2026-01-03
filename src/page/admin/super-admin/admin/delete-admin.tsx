import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SortEnum, useGetList, type Admin } from './service/useGetList';
import { useDeleteAdmin } from './service/useDeleteAdmin';
import { Header } from './components/header';
import { Sort } from './components/sort';
import { AdminCard } from './components/admin-card';
import { Pagination } from './components/pagantion';
import { AdminModals } from './components/modal';

interface SortState {
  field: typeof SortEnum[keyof typeof SortEnum];
  order: 'asc' | 'desc';
}

interface EditForm {
  username: string;
  fullname: string;
  phoneNumber: string;
  password: string;
}

type ModalType = 'delete' | 'more' | 'edit' | 'create' | '';

export const DeleteAdmin: React.FC = () => {
  const [page, setPage] = useState<number>(1);
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
    password: ''
  });
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
    if (type === 'edit') {
      setEditForm({
        username: admin.username,
        fullname: admin.fullname,
        phoneNumber: admin.phoneNumber,
        password: ''
      });
    }
    setShowModal(true);
  };


  const closeModal = (): void => {
    setShowModal(false);
    setSelectedAdmin(null);
    setEditForm({ username: '', fullname: '', phoneNumber: '', password: '' });
  };

  const handleEdit = async (): Promise<void> => {
    try {
      if (selectedAdmin) {
        // Edit functionality - not needed for deleted admins
      }
    } catch (e) {
      console.error('Edit error:', e);
    }
  };

  const handleSoftDelete = async (id: number): Promise<void> => {
    // Open delete confirmation modal
    const admin = admins.find(a => a.id === id);
    if (admin) {
      openModal('delete', admin);
    }
  };

  const handleBlock = (id: number): void => {
    // For deleted admins, show confirmation modal instead of direct confirmation
    // Find the admin from the current admins array
    const admin = admins.find(a => a.id === id);
    if (admin) {
      openModal('delete', admin);
    }
  };

  const getInitials = (name: string): string => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'AD';
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        <span className="ml-3 text-xl text-gray-600">Loading...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-900 mb-4">Error: {(error as Error)?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        <Header
          setPage={setPage}
          onSearch={setSearch}
          openCreateModal={() => { }}
          showAddAdmin={false}
        />

        <Sort
          sort={sort}
          handleSort={handleSort}
        />

        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <button
              type="button"
              onClick={() => {
                setPage(1);
              }}
              className="px-3 py-1.5 rounded text-sm font-medium border bg-red-600 text-white border-red-600 transition-colors"
            >
              Deleted
            </button>
          </div>
        </div>

        <AdminCard
          admins={admins}
          getInitials={getInitials}
          openModal={openModal}
          showMore={true}
          showEdit={false}
          showBlock={false}
          showDelete={true}
          handleSoftDelete={handleSoftDelete}
          handleBlock={handleBlock}
          isBlocking={isDeleting}
          isDeleting={isDeleting}
          page={page}
          limit={limit}
        />

        <Pagination
          page={page}
          limit={limit}
          totalPages={totalPages}
          totalCount={totalCount}
          admins={admins}
          setPage={setPage}
          handleLimitChange={handleLimitChange}
        />

        <AdminModals
          showModal={showModal}
          modalType={modalType as any}
          selectedAdmin={selectedAdmin}
          editForm={editForm}
          closeModal={closeModal}
          handleSoftDelete={handleSoftDelete}
          handleEdit={handleEdit}
          handleCreate={async () => { }}
          setEditForm={setEditForm}
          switchToEdit={() => setModalType('edit')}
          isUpdating={false}
          getInitials={getInitials}
          handleBlock={handleBlock}
          isBlocking={isDeleting}
          refetch={refetch}
          deleteAdmin={deleteAdmin}
          blockAdmin={() => { }}
        />
      </div>
    </div>
  );
};
