
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { SortEnum, useGetList, type Admin } from './service/useGetList';
import { request } from '../../../../config/request';
import { Header } from './components/header';
import { Sort } from './components/sort';
import { AdminCard } from './components/admin-card';
import { Pagination } from './components/pagantion';
import { AdminModals } from './components/modal';

interface SortState {
  field: typeof SortEnum[keyof typeof SortEnum];
  order: 'asc' | 'desc';
}

type ModalType = 'more' | 'confirm' | '';

export const DeleteAdmin: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<SortState>({
    field: SortEnum.USERNAME,
    order: 'desc'
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number } | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');

  const { data, isPending, isError, error, refetch } = useGetList({
    limit,
    page,
    search,
    sort,
    isDeleted: true
  });

  const { mutate: hardDeleteAdmin, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await request.delete<{ message?: string }>(`/admin/delete/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      message.success(data?.message || 'Admin deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error deleting admin';
      message.error(errorMessage);
    }
  });

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
    setPendingDelete(null);
  };

  const handleHardDelete = async (id: number): Promise<void> => {
    const admin = admins.find(a => a.id === id) || selectedAdmin;
    if (admin) {
      setSelectedAdmin(admin);
    }
    setPendingDelete({ id });
    setModalType('confirm');
    setShowModal(true);
  };

  const confirmHardDelete = (): void => {
    if (!pendingDelete) return;

    hardDeleteAdmin(pendingDelete.id, {
      onSuccess: () => {
        closeModal();
        refetch();
      }
    } as any);
  };

  const getInitials = (name: string): string => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'AD';
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
    <div className="min-h-screen bg-gray-50 p-6">
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

        <AdminCard
          admins={admins}
          getInitials={getInitials}
          openModal={openModal as any}
          showMore={true}
          showEdit={false}
          showBlock={false}
          showDelete={true}
          handleSoftDelete={handleHardDelete}
          handleBlock={() => { }}
          isBlocking={false}
          isDeleting={isDeleting}
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
        />

        <AdminModals
          showModal={showModal}
          modalType={modalType as any}
          selectedAdmin={selectedAdmin}
          closeModal={closeModal}
          handleSoftDelete={handleHardDelete}
          handleEdit={async () => { }}
          handleCreate={async () => { }}
          setEditForm={() => { }}
          switchToEdit={() => { }}
          isUpdating={false}
          editForm={{ username: '', fullname: '', phoneNumber: '', password: '' } as any}
          getInitials={getInitials}
          handleBlock={() => { }}
          isBlocking={false}
          confirmMessage={pendingDelete ? 'Adminni delete qilishni tasdiqlaysizmi?' : ''}
          onConfirm={pendingDelete ? confirmHardDelete : undefined}
          confirmTone={pendingDelete ? 'danger' : undefined}
          otpSent={false}
          otpVerified={false}
          receivedOtp={''}
          otp={''}
          setOtpSent={() => { }}
          setOtpVerified={() => { }}
          setReceivedOtp={() => { }}
          setOtp={() => { }}
        />
      </div>
    </div>
  );
};
