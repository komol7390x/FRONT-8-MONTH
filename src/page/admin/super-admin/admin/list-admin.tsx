import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Select } from 'antd';
import { useLocation } from 'react-router-dom';
import { SortEnum, useGetList, type Admin, } from './service/useGetList';
import { useUpdateAdmin } from './service/useUpdateAdmin';
import { useBlockAdmin } from './service/useBlockAdmin';
import { useCreateAdmin } from './service/useCreateAdmin';
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

export const ListAdmin: React.FC = () => {
  const location = useLocation();
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<boolean | undefined>(undefined);
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);
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
    status,
    isDeleted
  });

  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin();
  const { mutate: blockAdmin, isPending: isBlocking } = useBlockAdmin();
  const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
  const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin();

  const admins: Admin[] = data?.data || [];
  const totalCount: number = data?.meta?.totalItems || 0;
  const totalPages: number = data?.meta?.totalPages || 0;

  const openAdminId = useMemo(() => {
    const raw = (location.state as any)?.openAdminId;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [location.state]);

  useEffect(() => {
    if (!openAdminId) return;
    const a = admins.find((x: any) => Number(x?.id) === openAdminId);
    if (!a) return;
    openModal('more', a);
  }, [admins, openAdminId]);

  const handleSort = (field: typeof SortEnum[keyof typeof SortEnum]): void => {
    setSort({ field, order: 'desc' });
    setPage(1);
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;

    deleteAdmin({ id: pendingDelete.id, status: true }, {
      onSuccess: () => {
        setDeletedIds(prev => (prev.includes(pendingDelete.id) ? prev : [...prev, pendingDelete.id]));
        closeModal();
      }
    } as any);
  };

  const handleLimitChange = (newLimit: string | number): void => {
    setLimit(Number(newLimit));
    setPage(1);
  };

  const openCreateModal = (): void => {
    setModalType('create');
    setSelectedAdmin(null);
    setEditForm({
      username: '',
      fullname: '',
      phoneNumber: '',
      password: ''
    });
    setOtpSent(false);
    setOtpVerified(false);
    setReceivedOtp('');
    setOtp('');
    setShowModal(true);
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
    setPendingBlock(null);
    setPendingDelete(null);
    setEditForm({ username: '', fullname: '', phoneNumber: '', password: '' });
    setOtpSent(false);
    setOtpVerified(false);
    setReceivedOtp('');
    setOtp('');
  };

  const handleCreate = async (): Promise<void> => {
    try {
      createAdmin({
        phoneNumber: editForm.phoneNumber,
        username: editForm.username,
        fullname: editForm.fullname,
        password: editForm.password
      }, {
        onSuccess: () => {
          closeModal();
        }
      } as any);
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const handleEdit = async (): Promise<void> => {
    try {
      if (selectedAdmin) {
        if (editForm.phoneNumber !== selectedAdmin.phoneNumber && !otpVerified) {
          alert('Phone number changed. Please verify the new phone number with OTP before saving.');
          return;
        }

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

        {/* Header */}
        <Header
          setPage={setPage}
          onSearch={setSearch}
          openCreateModal={openCreateModal}
          onClearExtras={() => {
            setStatus(undefined);
            setIsDeleted(undefined);
            setSort({ field: SortEnum.USERNAME, order: 'desc' });
          }}
        />

        {/* Sort Controls */}
        <Sort
          sort={sort}
          handleSort={handleSort}
        />

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <Select
              allowClear
              value={status === undefined ? undefined : status ? 'true' : 'false'}
              onChange={(v) => {
                setStatus(v === undefined ? undefined : v === 'true');
                setPage(1);
              }}
              placeholder="Status"
              style={{ width: '100%' }}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Blocked' },
              ]}
            />

            <Select
              allowClear
              value={isDeleted === undefined ? undefined : isDeleted ? 'true' : 'false'}
              onChange={(v) => {
                setIsDeleted(v === undefined ? undefined : v === 'true');
                setPage(1);
              }}
              placeholder="Deleted"
              style={{ width: '100%' }}
              options={[
                { value: 'true', label: 'Deleted' },
                { value: 'false', label: 'Not Deleted' },
              ]}
            />
          </div>
        </div>

        {/* Admin List */}
        <AdminCard
          admins={admins}
          deletedIds={deletedIds}
          getInitials={getInitials}
          openModal={openModal}
          showMore={true}
          showEdit={false}
          showBlock={false}
          showDelete={false}
          handleSoftDelete={handleSoftDelete}
          handleBlock={handleBlock}
          isBlocking={isBlocking}
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

        {/* Modal */}
        <AdminModals
          showModal={showModal}
          modalType={modalType}
          selectedAdmin={selectedAdmin}
          editForm={editForm}
          closeModal={closeModal}
          handleSoftDelete={handleSoftDelete}
          handleEdit={handleEdit}
          handleCreate={handleCreate}
          setEditForm={setEditForm}
          switchToEdit={switchToEdit}
          isUpdating={isUpdating || isCreating}
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
};
