import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SortEnum, useGetList, type Admin } from './service/useGetList';
import { useUpdateAdmin } from './service/useUpdateAdmin';
import { useBlockAdmin } from './service/useBlockAdmin';
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

type ModalType = 'edit' | 'more' | 'create' | 'confirm' | '';

const AdminPanel: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const status: boolean = false;
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [sort, setSort] = useState<SortState>({
    field: SortEnum.USERNAME,
    order: 'desc'
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [pendingBlock, setPendingBlock] = useState<{ id: number; currentActive: boolean } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number } | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    username: '',
    fullname: '',
    phoneNumber: '',
    password: ''
  });
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [receivedOtp, setReceivedOtp] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const { data, isPending, isError, error, refetch } = useGetList({
    limit,
    page,
    search,
    sort,
    status
  });

  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin();
  const { mutate: blockAdmin, isPending: isBlocking } = useBlockAdmin();
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
      setOtpSent(false);
      setOtpVerified(false);
      setReceivedOtp('');
      setOtp('');
    }
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedAdmin(null);
    setPendingBlock(null);
    setPendingDelete(null);
    setEditForm({ username: '', fullname: '', phoneNumber: '', password: '' });
    setOtpSent(false);
    setOtpVerified(false);
    setReceivedOtp('');
    setOtp('');
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
    } catch (e) {
      console.error('Edit error:', e);
    }
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;

    deleteAdmin(pendingDelete.id, {
      onSuccess: () => {
        setDeletedIds(prev => (prev.includes(pendingDelete.id) ? prev : [...prev, pendingDelete.id]));
        closeModal();
      }
    } as any);
  };

  const handleSoftDelete = async (id: number): Promise<void> => {
    const admin = admins.find(a => a.id === id) || selectedAdmin;
    if (admin) {
      setSelectedAdmin(admin);
    }
    setPendingDelete({ id });
    setModalType('confirm');
    setShowModal(true);
  };

  const handleBlock = (id: number, currentActive: boolean): void => {
    const admin = admins.find(a => a.id === id) || selectedAdmin;
    if (admin) {
      setSelectedAdmin(admin);
    }
    setPendingBlock({ id, currentActive });
    setModalType('confirm');
    setShowModal(true);
  };

  const confirmBlock = (): void => {
    if (!pendingBlock) return;

    blockAdmin({ id: pendingBlock.id, active: !pendingBlock.currentActive }, {
      onSuccess: () => {
        closeModal();
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
          />
          Try Again
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

        <AdminCard
          admins={admins}
          deletedIds={deletedIds}
          getInitials={getInitials}
          openModal={openModal}
          showMore={true}
          showEdit={false}
          showBlock={true}
          showDelete={false}
          handleSoftDelete={handleSoftDelete}
          handleBlock={handleBlock}
          isBlocking={isBlocking}
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
          modalType={modalType}
          selectedAdmin={selectedAdmin}
          editForm={editForm}
          closeModal={closeModal}
          handleSoftDelete={handleSoftDelete}
          handleEdit={handleEdit}
          handleCreate={async () => { }}
          setEditForm={setEditForm}
          switchToEdit={switchToEdit}
          isUpdating={isUpdating}
          getInitials={getInitials}
          handleBlock={handleBlock}
          isBlocking={isBlocking}
          confirmMessage={
            pendingDelete
              ? 'Adminni delete qilishni tasdiqlaysizmi?'
              : pendingBlock
                ? `Adminni ${pendingBlock.currentActive ? 'block' : 'active'} qilishni tasdiqlaysizmi?`
                : ''
          }
          onConfirm={pendingDelete ? confirmDelete : confirmBlock}
          confirmTone={pendingDelete ? 'danger' : pendingBlock?.currentActive ? 'danger' : 'success'}
          otpSent={otpSent}
          otpVerified={otpVerified}
          receivedOtp={receivedOtp}
          otp={otp}
          setOtpSent={setOtpSent}
          setOtpVerified={setOtpVerified}
          setReceivedOtp={setReceivedOtp}
          setOtp={setOtp}
        />
      </div>
    </div>
  );
}
export default AdminPanel;