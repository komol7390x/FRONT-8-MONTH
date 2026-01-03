import React, { useState } from 'react';
import type { JSX } from 'react';
import { Loader2 } from 'lucide-react';
import { SortEnum, useGetList, type Admin, } from './service/useGetList';
import { useUpdateAdmin } from './service/useUpdateAdmin';
import { useBlockAdmin } from './service/useBlockAdmin';
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

type ModalType = 'edit' | 'more' | '';

export const ListAdmin: React.FC = () => {
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
    sort
  });

  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin();
  const { mutate: blockAdmin, isPending: isBlocking } = useBlockAdmin();

  // Backend strukturasiga moslash (res.data ichida yana data massivi kelyapti)
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

  const switchToEdit = (): void => {
    if (selectedAdmin) {
      setEditForm({
        username: selectedAdmin.username,
        fullname: selectedAdmin.fullname,
        phoneNumber: selectedAdmin.phoneNumber,
        password: ''
      });
      setModalType('edit');
    }
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedAdmin(null);
    setEditForm({ username: '', fullname: '', phoneNumber: '', password: '' });
  };

  const handleEdit = async (): Promise<void> => {
    try {
      if (selectedAdmin) {
        updateAdmin({
          id: selectedAdmin.id,
          payload: {
            username: editForm.username,
            fullname: editForm.fullname,
            phoneNumber: editForm.phoneNumber,
            ...(editForm.password && { password: editForm.password })
          }
        }, {
          onSuccess: () => {
            closeModal();
          }
        } as any);
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

  const handleBlock = (id: number, currentActive: boolean): void => {
    const actionText = currentActive ? 'blokirovka qilmoqchimisiz?' : 'unblok qilmoqchimisiz?';
    if (window.confirm(`Adminni ${actionText}`)) {
      blockAdmin({ id, active: !currentActive }, {
        onSuccess: () => {
          closeModal();
        }
      } as any);
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
        <Header
          setPage={setPage}
          onSearch={setSearch}
        />

        {/* Sort Controls */}
        <Sort
          sort={sort}
          handleSort={handleSort}
        />

        {/* Admin List */}
        <AdminCard
          admins={admins}
          getInitials={getInitials}
          openModal={openModal}
          handleDelete={handleDelete}
          handleBlock={handleBlock}
          isBlocking={isBlocking}
          page={page}
          limit={limit}
        />

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalPages={totalPages}
          totalCount={totalCount}
          admins={admins}
          setPage={setPage}
          handleLimitChange={handleLimitChange}
          renderPaginationButtons={renderPaginationButtons}
        />

        {/* Modal */}
        <AdminModals
          showModal={showModal}
          modalType={modalType}
          selectedAdmin={selectedAdmin}
          editForm={editForm}
          closeModal={closeModal}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          setEditForm={setEditForm}
          switchToEdit={switchToEdit}
          isUpdating={isUpdating}
          getInitials={getInitials}
          handleBlock={handleBlock}
          isBlocking={isBlocking}
        />
      </div>
    </div>
  );
};