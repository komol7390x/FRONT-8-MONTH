import React, { useEffect, useMemo, useState } from 'react';
import { Award, Ban, BookOpen, BriefcaseBusiness, CalendarClock, ChevronDown, Clock, Copy, CreditCard, DollarSign, Edit, Hash, Link2, Loader2, Mail, MoreHorizontal, Phone, ShieldCheck, Star, Unlock, User, Wallet, X } from 'lucide-react';
import { message } from 'antd';
import { useGetTeachers, TeacherSort, LanguageLevel, type Teacher } from './service/useGetTeachers';
import { useTeacherIsActive } from './service/useTeacherIsActive';
import { useTeacherLessons, type LessonTemplateItem } from './service/useTeacherLessons';
import { Pagination } from '../super-admin/admin/components/pagantion';
import { useConfirmTelEmail } from './service/useConfirmTeacherOtp';
import { useCreateTeacher } from './service/useCreateTeacher';
import { useCreateCertificate } from './service/useCreateCertificate';
import { useUpdateTeacher } from './service/useUpdateTeacher';
import { useSoftDeleteTeacher } from './service/useSoftDeleteTeacher';
import { useHardDeleteTeacher } from './service/useHardDeleteTeacher';

type ModalType = 'more' | 'details' | 'create' | 'certificate' | '';

type PageMode = 'all' | 'blocked' | 'delete';

interface TeacherListProps {
    mode?: PageMode;
}

const getInitials = (name: string): string => {
    return name
        ? name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'TC';
};

export const TeacherList: React.FC<TeacherListProps> = ({ mode = 'all' }) => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>(TeacherSort.FULLNAME);
    const [level, setLevel] = useState<string>('');
    const [lang, setLang] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isDeletedFilter, setIsDeletedFilter] = useState<string>('');

    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<ModalType>('');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const [activeTab, setActiveTab] = useState<'info' | 'certificates' | 'lessons' | 'students'>('info');
    const [lessonStatusFilter, setLessonStatusFilter] = useState<string>('');

    const applySearchNow = () => {
        setSearch(searchInput);
        setPage(1);
    };

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 1000);
        return () => clearTimeout(t);
    }, [searchInput]);

    const statusParam = mode === 'blocked'
        ? false
        : statusFilter === ''
            ? undefined
            : statusFilter === 'true';

    const isDeletedParam = mode === 'delete'
        ? true
        : isDeletedFilter === ''
            ? undefined
            : isDeletedFilter === 'true';

    const { data, isPending, isError, error, refetch } = useGetTeachers({
        page,
        limit,
        search,
        sort: sort as any,
        level: (level as any) || undefined,
        lang: lang || undefined,
        status: statusParam,
        isDeleted: isDeletedParam,
    });

    const { mutate: setActive, isPending: isBlocking } = useTeacherIsActive();

    const { mutate: sendTelEmailOtp, isPending: isSendingOtp } = useConfirmTelEmail();
    const { mutate: createTeacher, isPending: isCreatingTeacher } = useCreateTeacher();
    const { mutate: createCertificate, isPending: isCreatingCertificate } = useCreateCertificate();
    const { mutate: updateTeacher, isPending: isUpdatingTeacher } = useUpdateTeacher();
    const { mutate: softDeleteTeacher, isPending: isSoftDeletingTeacher } = useSoftDeleteTeacher();
    const { mutate: hardDeleteTeacher, isPending: isHardDeletingTeacher } = useHardDeleteTeacher();

    const [createForm, setCreateForm] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        password: '',
        expirence: 0,
    });
    const [receivedPhoneOtp, setReceivedPhoneOtp] = useState<string>('');
    const [receivedEmailOtp, setReceivedEmailOtp] = useState<string>('');
    const [phoneOtp, setPhoneOtp] = useState<string>('');
    const [emailOtp, setEmailOtp] = useState<string>('');
    const [otpSent, setOtpSent] = useState<boolean>(false);

    const [certificateForm, setCertificateForm] = useState({
        specificationName: '',
        level: 'B2',
        description: '',
        hourPrice: 0,
        teacherId: 0,
    });

    const [editForm, setEditForm] = useState({
        email: '',
        phoneNumber: '',
        fullname: '',
        password: '',
        expirence: 0,
        cardNumber: '',
        portfolioLink: '',
    });

    const [editOriginal, setEditOriginal] = useState({
        email: '',
        phoneNumber: '',
    });

    const [receivedEditPhoneOtp, setReceivedEditPhoneOtp] = useState<string>('');
    const [receivedEditEmailOtp, setReceivedEditEmailOtp] = useState<string>('');
    const [editPhoneOtp, setEditPhoneOtp] = useState<string>('');
    const [editEmailOtp, setEditEmailOtp] = useState<string>('');
    const [editPhoneOtpSent, setEditPhoneOtpSent] = useState<boolean>(false);
    const [editEmailOtpSent, setEditEmailOtpSent] = useState<boolean>(false);

    const [confirmHardDelete, setConfirmHardDelete] = useState<boolean>(false);

    const teachersRaw = data?.data || [];
    const totalCount = data?.meta?.totalItems || teachersRaw.length;
    const totalPages = data?.meta?.totalPages || 0;

    const teachers = teachersRaw;

    const openModal = (type: ModalType, teacher: Teacher) => {
        setModalType(type);
        setSelectedTeacher(teacher);
        if (type === 'details' || type === 'more') {
            setActiveTab('info');
            setLessonStatusFilter('');
        }
        if (type === 'details') {
            setConfirmHardDelete(false);
        }
        setShowModal(true);
    };

    const openCreateModal = () => {
        setModalType('create');
        setSelectedTeacher(null);
        setCreateForm({ fullname: '', email: '', phoneNumber: '', password: '', expirence: 0 });
        setReceivedPhoneOtp('');
        setReceivedEmailOtp('');
        setPhoneOtp('');
        setEmailOtp('');
        setOtpSent(false);
        setShowModal(true);
    };

    const openCertificateModal = () => {
        setModalType('certificate');
        setSelectedTeacher(null);
        setCertificateForm({
            specificationName: '',
            level: 'B2',
            description: '',
            hourPrice: 0,
            teacherId: 0,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setSelectedTeacher(null);
        setConfirmHardDelete(false);
    };

    const openEditFromMore = () => {
        if (!selectedTeacher?.id) return;
        const originalEmail = selectedTeacher.email || '';
        const originalPhone = selectedTeacher.phoneNumber || '';
        setEditForm({
            email: originalEmail,
            phoneNumber: originalPhone,
            fullname: selectedTeacher.fullname || '',
            password: '',
            expirence: Number((selectedTeacher as any).expirence || 0),
            cardNumber: String((selectedTeacher as any).cardNumber || ''),
            portfolioLink: String((selectedTeacher as any).portfolioLink || ''),
        });
        setEditOriginal({ email: originalEmail, phoneNumber: originalPhone });
        setReceivedEditPhoneOtp('');
        setReceivedEditEmailOtp('');
        setEditPhoneOtp('');
        setEditEmailOtp('');
        setEditPhoneOtpSent(false);
        setEditEmailOtpSent(false);
        setModalType('details');
        setConfirmHardDelete(false);
    };

    const editEmailChanged = (editForm.email || '') !== (editOriginal.email || '');
    const editPhoneChanged = (editForm.phoneNumber || '') !== (editOriginal.phoneNumber || '');
    const editRequiresOtp = editEmailChanged || editPhoneChanged;
    const editPhoneVerified = useMemo(
        () => {
            if (!editPhoneChanged) return true;
            // OTP is optional: only require verification if OTP was requested and backend returned OTP
            if (!editPhoneOtpSent || !receivedEditPhoneOtp) return true;
            return editPhoneOtp === receivedEditPhoneOtp;
        },
        [editPhoneChanged, editPhoneOtpSent, receivedEditPhoneOtp, editPhoneOtp],
    );
    const editEmailVerified = useMemo(
        () => {
            if (!editEmailChanged) return true;
            // OTP is optional: only require verification if OTP was requested and backend returned OTP
            if (!editEmailOtpSent || !receivedEditEmailOtp) return true;
            return editEmailOtp === receivedEditEmailOtp;
        },
        [editEmailChanged, editEmailOtpSent, receivedEditEmailOtp, editEmailOtp],
    );

    const handleSendEditPhoneOtp = () => {
        if (!editForm.phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        if (!editForm.email.trim()) {
            message.warning('Email is required');
            return;
        }
        sendTelEmailOtp(
            { email: editForm.email, phoneNumber: editForm.phoneNumber },
            {
                onSuccess: (data: any) => {
                    setReceivedEditPhoneOtp(data?.data?.phoneOtp || '');
                    setEditPhoneOtpSent(true);
                },
            } as any,
        );
    };

    const handleSendEditEmailOtp = () => {
        if (!editForm.email.trim()) {
            message.warning('Email is required');
            return;
        }
        if (!editForm.phoneNumber.trim()) {
            message.warning('Phone is required');
            return;
        }
        sendTelEmailOtp(
            { email: editForm.email, phoneNumber: editForm.phoneNumber },
            {
                onSuccess: (data: any) => {
                    setReceivedEditEmailOtp(data?.data?.emailOtp || '');
                    setEditEmailOtpSent(true);
                },
            } as any,
        );
    };

    const handleUpdateTeacher = () => {
        if (!selectedTeacher?.id) return;
        if (!editForm.fullname.trim()) {
            message.warning('fullname is required');
            return;
        }
        if (!editForm.email.trim()) {
            message.warning('email is required');
            return;
        }
        if (!editForm.phoneNumber.trim()) {
            message.warning('phoneNumber is required');
            return;
        }

        // OTP ixtiyoriy: faqat siz "Send OTP" bosgan bo'lsangizgina tekshiramiz
        if ((editPhoneOtpSent && !editPhoneVerified) || (editEmailOtpSent && !editEmailVerified)) {
            message.warning('OTP noto\'g\'ri yoki kiritilmagan. Iltimos OTP ni to\'g\'ri kiriting.');
            return;
        }

        updateTeacher(
            {
                id: selectedTeacher.id,
                payload: {
                    email: editForm.email,
                    phoneNumber: editForm.phoneNumber,
                    fullname: editForm.fullname,
                    ...(editForm.password?.trim() ? { password: editForm.password } : {}),
                    expirence: Number(editForm.expirence || 0),
                    cardNumber: editForm.cardNumber || undefined,
                    portfolioLink: editForm.portfolioLink || undefined,
                },
            } as any,
            {
                onSuccess: () => {
                    closeModal();
                    refetch();
                },
            } as any,
        );
    };

    const toDisplay = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    };

    const copyToClipboard = async (value: unknown) => {
        const text = toDisplay(value);
        try {
            await navigator.clipboard.writeText(text);
            message.success('Copied');
        } catch {
            message.error('Copy failed');
        }
    };

    const formatDateTime = (value: unknown): string => {
        const raw = toDisplay(value);
        if (!raw) return '';
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return raw;
        return d.toLocaleString();
    };

    const formatNumber = (value: unknown): string => {
        if (value === null || value === undefined || value === '') return '';
        const n = typeof value === 'number' ? value : Number(value);
        if (Number.isNaN(n)) return toDisplay(value);
        return new Intl.NumberFormat().format(n);
    };

    const handleCreateCertificate = () => {
        if (!certificateForm.specificationName.trim()) {
            message.warning('specificationName is required');
            return;
        }
        if (!certificateForm.level) {
            message.warning('level is required');
            return;
        }
        if (!certificateForm.description.trim()) {
            message.warning('description is required');
            return;
        }
        if (!certificateForm.teacherId) {
            message.warning('teacherId is required');
            return;
        }

        createCertificate(
            {
                specificationName: certificateForm.specificationName,
                level: certificateForm.level,
                description: certificateForm.description,
                hourPrice: Number(certificateForm.hourPrice) || 0,
                teacherId: Number(certificateForm.teacherId),
            },
            {
                onSuccess: () => {
                    closeModal();
                    refetch();
                },
            } as any,
        );
    };

    const phoneVerified = otpSent && !!receivedPhoneOtp && phoneOtp === receivedPhoneOtp;
    const emailVerified = otpSent && !!receivedEmailOtp && emailOtp === receivedEmailOtp;
    const otpVerified = phoneVerified && emailVerified;

    const handleSendOtp = () => {
        if (!createForm.phoneNumber.trim() || !createForm.email.trim()) {
            message.warning('Phone number and email are required');
            return;
        }

        sendTelEmailOtp(
            { phoneNumber: createForm.phoneNumber, email: createForm.email },
            {
                onSuccess: (data: any) => {
                    setOtpSent(true);
                    setReceivedPhoneOtp(data?.data?.phoneOtp || '');
                    setReceivedEmailOtp(data?.data?.emailOtp || '');
                },
            } as any,
        );
    };

    const handleCreateTeacher = () => {
        if (!otpVerified) {
            message.warning('Please verify OTP first');
            return;
        }

        createTeacher(
            {
                fullname: createForm.fullname,
                email: createForm.email,
                phoneNumber: createForm.phoneNumber,
                password: createForm.password,
                expirence: Number(createForm.expirence) || 0,
            },
            {
                onSuccess: () => {
                    closeModal();
                    refetch();
                },
            } as any,
        );
    };

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const lessonsQuery = useTeacherLessons(selectedTeacher?.id, {
        page: 1,
        limit: 100,
    });

    const lessons: LessonTemplateItem[] = lessonsQuery.data?.data || [];

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
            <div className="text-center">
                <p className="text-xl text-red-600 mb-4">Error: {(error as Error)?.message}</p>
                <button onClick={() => refetch()} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                    Try Again
                </button>
            </div>
        );
    }

    const title = mode === 'blocked' ? 'Blocked Teachers' : mode === 'delete' ? 'Deleted Teachers' : 'Teachers';

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        {mode === 'all' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={openCertificateModal}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Create Certificate
                                </button>
                                <button
                                    onClick={openCreateModal}
                                    className="bg-green-600 text-white px-6 py-2.5 rounded font-medium hover:bg-green-700 transition-colors"
                                >
                                    Add Teacher
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by fullname/email/phone/id"
                                    value={searchInput}
                                    onChange={(e) => {
                                        setSearchInput(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applySearchNow();
                                        }
                                    }}
                                    className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={applySearchNow}
                                className="h-11 px-5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors shadow-sm"
                            >
                                Search
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    disabled={mode === 'blocked'}
                                    className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-xl bg-white disabled:bg-gray-100 text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Status: All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Blocked</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={isDeletedFilter}
                                    onChange={(e) => {
                                        setIsDeletedFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    disabled={mode === 'delete'}
                                    className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-xl bg-white disabled:bg-gray-100 text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Deleted: All</option>
                                    <option value="true">Deleted</option>
                                    <option value="false">Not Deleted</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-xl bg-white text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value={TeacherSort.FULLNAME}>Sort: Fullname</option>
                                    <option value={TeacherSort.EMAIL}>Sort: Email</option>
                                    <option value={TeacherSort.RATING}>Sort: Rating</option>
                                    <option value={TeacherSort.CREATED_AT}>Sort: Created</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={level}
                                    onChange={(e) => {
                                        setLevel(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-xl bg-white text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Level: All</option>
                                    {Object.values(LanguageLevel).map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            <input
                                type="text"
                                placeholder="lang (e.g. s)"
                                value={lang}
                                onChange={(e) => {
                                    setLang(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full h-10 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="grid grid-cols-8 px-3 sm:px-4 bg-gray-50 py-3 sm:py-4 border-b border-gray-200 font-semibold text-sm text-gray-700">
                        <div className="col-span-1 pr-5">№</div>
                        <div className="col-span-1 pr-5">ID</div>
                        <div className="col-span-1 pr-5">Name</div>
                        <div className="col-span-1 pr-5">Status</div>
                        <div className="col-span-1 pr-5">Email</div>
                        <div className="col-span-1 pr-5">Phone</div>
                        <div className="col-span-1 pr-2 sm:pr-4 lg:pr-6">Created At</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {teachers.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No teachers found</div>
                    ) : (
                        teachers.map((t, idx) => {
                            const isDeletedRow = !!t.isDeleted;
                            const createdAt = t.createdAt
                                ? new Date(t.createdAt).toLocaleDateString('uz-UZ', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : '-';

                            return (
                                <div
                                    key={t.id}
                                    className={`grid grid-cols-8 px-3 sm:px-4 py-3 sm:py-4 border-b items-center transition-colors cursor-pointer ${isDeletedRow
                                        ? 'bg-red-50 border-red-200'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => openModal('more', t)}
                                >
                                    <div className="col-span-1 pr-5">
                                        <span className="text-sm font-semibold text-gray-700">{((page - 1) * limit) + idx + 1}</span>
                                    </div>

                                    <div className="col-span-1 pr-5">
                                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">ID:{t.id}</span>
                                    </div>

                                    <div className="col-span-1 pr-5 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                                                {getInitials(t.fullname)}
                                            </div>
                                            <div className="leading-tight min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{t.fullname}</p>
                                                <p className="text-xs text-gray-500 truncate">{t.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1 pr-5">
                                        {isDeletedRow ? (
                                            <span className="inline-block px-3 py-1.5 rounded text-sm font-medium bg-red-700 text-white min-w-22 text-center">
                                                Deleted
                                            </span>
                                        ) : t.isActive ? (
                                            <span className="inline-block px-3 py-1.5 rounded text-sm font-medium bg-green-600 text-white min-w-22 text-center">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-block px-3 py-1.5 rounded text-sm font-medium bg-red-600 text-white min-w-22 text-center">
                                                Blocked
                                            </span>
                                        )}
                                    </div>

                                    <div className="col-span-1 pr-5 min-w-0">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                                            <Mail size={14} className="shrink-0" />
                                            <span className="flex-1 min-w-0 truncate">{t.email}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-1 pr-5 min-w-0">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                                            <Phone size={14} className="shrink-0" />
                                            <span className="flex-1 min-w-0 truncate">{t.phoneNumber}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-1 pr-2 sm:pr-4 lg:pr-6">
                                        <span className="text-xs text-gray-700 font-medium">{createdAt}</span>
                                    </div>

                                    <div className="col-span-1 flex justify-end items-center gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal('more', t);
                                            }}
                                            className="px-3 py-1.5 bg-sky-500 text-white rounded text-sm font-medium hover:bg-sky-600 transition-colors flex items-center gap-2"
                                        >
                                            <MoreHorizontal size={12} />
                                            More
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <Pagination
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    admins={teachers as any}
                    setPage={setPage}
                    handleLimitChange={handleLimitChange}
                />

                {showModal && selectedTeacher && modalType === 'more' && (
                    <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Teacher Details</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {getInitials(selectedTeacher.fullname)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{selectedTeacher.fullname}</p>
                                        <p className="text-xs text-gray-600 truncate">{selectedTeacher.email}</p>
                                        <p className="text-xs text-gray-600 truncate">{selectedTeacher.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('info')}
                                    className={`px-3 py-2 rounded text-sm font-semibold border ${activeTab === 'info' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Info
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('certificates')}
                                    className={`px-3 py-2 rounded text-sm font-semibold border ${activeTab === 'certificates' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Certificates
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('lessons')}
                                    className={`px-3 py-2 rounded text-sm font-semibold border ${activeTab === 'lessons' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Lessons
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                {activeTab === 'info' && (
                                    <div className="space-y-2">
                                        <div className="px-3 py-2 border rounded-lg bg-gray-50 border-gray-200">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-gray-700">Status</span>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-1 rounded ${(selectedTeacher as any).isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {(selectedTeacher as any).isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-1 rounded ${(selectedTeacher as any).isDeleted
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {(selectedTeacher as any).isDeleted ? 'Deleted' : 'Not Deleted'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {(
                                            [
                                                { label: 'ID', value: selectedTeacher.id, copy: true, icon: <Hash size={14} className="text-sky-700" /> },
                                                { label: 'Fullname', value: selectedTeacher.fullname, icon: <User size={14} className="text-emerald-700" /> },
                                                { label: 'Email', value: selectedTeacher.email, copy: true, icon: <Mail size={14} className="text-violet-700" /> },
                                                { label: 'Phone', value: selectedTeacher.phoneNumber, copy: true, icon: <Phone size={14} className="text-amber-700" /> },
                                                { label: 'Role', value: (selectedTeacher as any).role, icon: <ShieldCheck size={14} className="text-rose-700" /> },
                                                { label: 'Rating', value: formatNumber((selectedTeacher as any).rating ?? 0), icon: <Star size={14} className="text-yellow-700" /> },
                                                { label: 'Experience', value: formatNumber((selectedTeacher as any).expirence ?? 0), icon: <BriefcaseBusiness size={14} className="text-sky-700" /> },
                                                { label: 'Wallet', value: formatNumber((selectedTeacher as any).wallet ?? ''), icon: <Wallet size={14} className="text-emerald-700" /> },
                                                { label: 'Card Number', value: (selectedTeacher as any).cardNumber, copy: true, icon: <CreditCard size={14} className="text-violet-700" /> },
                                                { label: 'Portfolio', value: (selectedTeacher as any).portfolioLink, copy: true, icon: <Link2 size={14} className="text-amber-700" /> },
                                                { label: 'Created At', value: formatDateTime((selectedTeacher as any).createdAt), icon: <CalendarClock size={14} className="text-rose-700" /> },
                                                { label: 'Updated At', value: formatDateTime((selectedTeacher as any).updatedAt), icon: <CalendarClock size={14} className="text-rose-700" /> },
                                            ] as Array<{ label: string; value: unknown; copy?: boolean; icon?: React.ReactNode }>
                                        ).map((item) => {
                                            const displayValue = toDisplay(item.value);
                                            return (
                                                <div key={item.label} className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="shrink-0">{item.icon}</span>
                                                        <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">{item.label}</span>
                                                        <span className="text-xs font-medium text-gray-900 min-w-0 flex-1 truncate" title={displayValue}>
                                                            {displayValue}
                                                        </span>
                                                        {item.copy && !!displayValue && (
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(item.value)}
                                                                className="shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                                title="Copy"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeTab === 'certificates' && (
                                    <div className="space-y-2">
                                        {(selectedTeacher.certificates || []).length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">No certificates</div>
                                        ) : (
                                            (selectedTeacher.certificates || []).map((c: any, idx: number) => {
                                                const badgeActive = c?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                                                const badgeDeleted = c?.isDeleted ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700';
                                                const cardStyles = [
                                                    'bg-sky-50 border-sky-200',
                                                    'bg-emerald-50 border-emerald-200',
                                                    'bg-violet-50 border-violet-200',
                                                    'bg-amber-50 border-amber-200',
                                                    'bg-rose-50 border-rose-200',
                                                ];
                                                return (
                                                    <div key={c.id || `${c.specificationName}-${c.level}-${idx}`} className={`p-3 border rounded-lg ${cardStyles[idx % cardStyles.length]}`}>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <Award size={16} className="text-gray-700 shrink-0" />
                                                                    <p className="text-sm font-semibold text-gray-900 truncate" title={toDisplay(c?.specificationName)}>
                                                                        {toDisplay(c?.specificationName)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-700 mt-1 truncate" title={toDisplay(c?.description)}>
                                                                    {toDisplay(c?.description)}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeActive}`}>{c?.isActive ? 'Active' : 'Inactive'}</span>
                                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeDeleted}`}>{c?.isDeleted ? 'Deleted' : 'OK'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 space-y-2">
                                                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <Hash size={14} className="text-sky-700 shrink-0" />
                                                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                                                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay(c?.id)}>{toDisplay(c?.id)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                                                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Level</span>
                                                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay(c?.level)}>{toDisplay(c?.level)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <DollarSign size={14} className="text-violet-700 shrink-0" />
                                                                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Hour Price</span>
                                                                    <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatNumber(c?.hourPrice)}>{formatNumber(c?.hourPrice)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <CalendarClock size={14} className="text-amber-700 shrink-0" />
                                                                        <span className="text-xs font-semibold text-gray-700 w-20 shrink-0">Created</span>
                                                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime(c?.createdAt)}>{formatDateTime(c?.createdAt)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <CalendarClock size={14} className="text-rose-700 shrink-0" />
                                                                        <span className="text-xs font-semibold text-gray-700 w-20 shrink-0">Updated</span>
                                                                        <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime(c?.updatedAt)}>{formatDateTime(c?.updatedAt)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}

                                {activeTab === 'lessons' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-gray-700">Lessons</p>
                                            <div className="relative w-44">
                                                <select
                                                    value={lessonStatusFilter}
                                                    onChange={(e) => setLessonStatusFilter(e.target.value)}
                                                    className="w-full h-9 pl-3 pr-9 border border-gray-200 rounded-xl bg-white text-xs shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                                                >
                                                    <option value="">All statuses</option>
                                                    <option value="available">available</option>
                                                    <option value="booked">booked</option>
                                                    <option value="completed">completed</option>
                                                    <option value="cancelled">cancelled</option>
                                                    <option value="expired">expired</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>

                                        {lessonsQuery.isPending ? (
                                            <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Loading lessons...</div>
                                        ) : lessons.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">No lessons</div>
                                        ) : lessons
                                            .filter((l) => {
                                                if (!lessonStatusFilter) return true;
                                                return String((l as any).status || '').toLowerCase() === lessonStatusFilter;
                                            })
                                            .map((l) => (
                                                <div key={l.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <BookOpen size={16} className="text-gray-700 shrink-0" />
                                                                <p className="text-sm font-semibold text-gray-900 truncate" title={toDisplay((l as any).lessonName || 'Lesson')}>
                                                                    {toDisplay((l as any).lessonName || 'Lesson')}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-700 mt-1 truncate" title={toDisplay((l as any).googleEventId)}>
                                                                {toDisplay((l as any).googleEventId)}
                                                            </p>
                                                        </div>
                                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 shrink-0">
                                                            {toDisplay((l as any).status)}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 space-y-2">
                                                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Hash size={14} className="text-sky-700 shrink-0" />
                                                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">ID</span>
                                                                <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay((l as any).id)}>{toDisplay((l as any).id)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Clock size={14} className="text-emerald-700 shrink-0" />
                                                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Start</span>
                                                                <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime((l as any).startTime)}>{formatDateTime((l as any).startTime)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Clock size={14} className="text-violet-700 shrink-0" />
                                                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">End</span>
                                                                <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatDateTime((l as any).endTime)}>{formatDateTime((l as any).endTime)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <DollarSign size={14} className="text-amber-700 shrink-0" />
                                                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Price</span>
                                                                <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={formatNumber((l as any).price)}>{formatNumber((l as any).price)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="px-3 py-2 border rounded-lg bg-white border-gray-200">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Link2 size={14} className="text-rose-700 shrink-0" />
                                                                <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">Meet</span>
                                                                <span className="text-xs font-medium text-gray-900 flex-1 truncate" title={toDisplay((l as any).meetLink)}>
                                                                    {toDisplay((l as any).meetLink)}
                                                                </span>
                                                                {!!toDisplay((l as any).meetLink) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyToClipboard((l as any).meetLink)}
                                                                        className="shrink-0 p-1.5 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                                        title="Copy meet link"
                                                                    >
                                                                        <Copy size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={openEditFromMore}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedTeacher?.id) return;
                                            if (selectedTeacher.isDeleted) return;
                                            const current = !!selectedTeacher.isActive;
                                            setActive(
                                                { id: selectedTeacher.id, active: !current },
                                                {
                                                    onSuccess: () => {
                                                        closeModal();
                                                        refetch();
                                                    },
                                                } as any,
                                            );
                                        }}
                                        disabled={isBlocking || !!selectedTeacher.isDeleted}
                                        className={`flex-1 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${selectedTeacher.isActive
                                            ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
                                            : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300'
                                            }`}
                                    >
                                        {selectedTeacher.isActive ? <Ban size={16} /> : <Unlock size={16} />}
                                        {isBlocking ? 'Processing...' : selectedTeacher.isActive ? 'Block' : 'Unblock'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!selectedTeacher?.id) return;

                                        // If teacher is already deleted -> show hard delete flow instead of soft delete
                                        if (mode === 'delete' || !!selectedTeacher.isDeleted) {
                                            setModalType('details');
                                            setConfirmHardDelete(true);
                                            return;
                                        }
                                        softDeleteTeacher(
                                            { id: selectedTeacher.id, status: true },
                                            {
                                                onSuccess: () => {
                                                    closeModal();
                                                    refetch();
                                                },
                                            } as any,
                                        );
                                    }}
                                    disabled={isSoftDeletingTeacher || isHardDeletingTeacher}
                                    className="w-full px-4 py-2.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-red-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    {(mode === 'delete' || !!selectedTeacher.isDeleted)
                                        ? isHardDeletingTeacher
                                            ? 'Deleting...'
                                            : 'Hard Delete'
                                        : isSoftDeletingTeacher
                                            ? 'Deleting...'
                                            : 'Delete'}
                                </button>

                                {(mode === 'delete' || !!selectedTeacher.isDeleted) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedTeacher?.id) return;
                                            softDeleteTeacher(
                                                { id: selectedTeacher.id, status: false },
                                                {
                                                    onSuccess: () => {
                                                        closeModal();
                                                        refetch();
                                                    },
                                                } as any,
                                            );
                                        }}
                                        disabled={isSoftDeletingTeacher}
                                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Unlock size={16} />
                                        {isSoftDeletingTeacher ? 'Resetting...' : 'Reset (Restore)'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showModal && selectedTeacher && modalType === 'details' && (
                    <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{confirmHardDelete || mode === 'delete' ? 'Confirm Hard Delete' : 'Edit Teacher'}</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {(confirmHardDelete || mode === 'delete') ? (
                                <div className="space-y-4">
                                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                        <p className="text-sm font-semibold text-red-800">This action will permanently delete this teacher.</p>
                                        <p className="text-xs text-red-700 mt-1">Teacher: {selectedTeacher.fullname} (ID: {selectedTeacher.id})</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isHardDeletingTeacher}
                                            onClick={() => {
                                                if (!selectedTeacher?.id) return;
                                                hardDeleteTeacher(selectedTeacher.id, {
                                                    onSuccess: () => {
                                                        closeModal();
                                                        refetch();
                                                    },
                                                } as any);
                                            }}
                                            className="flex-1 px-4 py-2.5 bg-red-700 text-white rounded text-sm font-medium hover:bg-red-800 disabled:bg-red-300 transition-colors"
                                        >
                                            {isHardDeletingTeacher ? 'Deleting...' : 'Confirm Hard Delete'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-xs font-semibold text-purple-600 mb-1.5">Fullname</label>
                                            <input
                                                value={editForm.fullname}
                                                onChange={(e) => setEditForm((p) => ({ ...p, fullname: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200"
                                                placeholder="Ali Valiyev"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-semibold text-sky-600 mb-1.5">Experience</label>
                                            <input
                                                type="number"
                                                value={editForm.expirence}
                                                onChange={(e) => setEditForm((p) => ({ ...p, expirence: Number(e.target.value) }))}
                                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition-all duration-200"
                                                placeholder="3"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-semibold text-blue-600 mb-1.5">Email</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                                                    className={`flex-1 px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 ${editEmailChanged ? 'ring-2 ring-orange-300' : ''}`}
                                                    placeholder="teacher@mail.com"
                                                />
                                                {editEmailChanged && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSendEditEmailOtp}
                                                        disabled={isSendingOtp}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                                    >
                                                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                                                    </button>
                                                )}
                                            </div>
                                            {editEmailChanged && (
                                                <p className="text-xs text-orange-600 mt-1">⚠️ Email changed - verification required</p>
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-semibold text-green-600 mb-1.5">Phone Number</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={editForm.phoneNumber}
                                                    onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                                                    className={`flex-1 px-3.5 py-2.5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 ${editPhoneChanged ? 'ring-2 ring-orange-300' : ''}`}
                                                    placeholder="+998901234567"
                                                />
                                                {editPhoneChanged && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSendEditPhoneOtp}
                                                        disabled={isSendingOtp}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                                    >
                                                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                                                    </button>
                                                )}
                                            </div>
                                            {editPhoneChanged && (
                                                <p className="text-xs text-orange-600 mt-1">⚠️ Phone changed - verification required</p>
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-semibold text-orange-600 mb-1.5">Password</label>
                                            <input
                                                type="password"
                                                value={editForm.password}
                                                onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200"
                                                placeholder="@Komol12345"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-semibold text-violet-600 mb-1.5">Card Number</label>
                                            <input
                                                value={editForm.cardNumber}
                                                onChange={(e) => setEditForm((p) => ({ ...p, cardNumber: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all duration-200"
                                                placeholder="8600123412341234"
                                            />
                                        </div>

                                        <div className="md:col-span-2 group">
                                            <label className="block text-xs font-semibold text-amber-600 mb-1.5">Portfolio Link</label>
                                            <input
                                                value={editForm.portfolioLink}
                                                onChange={(e) => setEditForm((p) => ({ ...p, portfolioLink: e.target.value }))}
                                                className="w-full px-3.5 py-2.5 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-200"
                                                placeholder="https://github.com/teacher"
                                            />
                                        </div>
                                    </div>

                                    {editRequiresOtp && (editPhoneOtpSent || editEmailOtpSent) && (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <p className="text-sm font-semibold text-gray-900">OTP Verification</p>
                                                <p className="text-xs text-gray-600 mt-1">Email/Phone o'zgargan bo'lsa OTP kiritish kerak.</p>
                                            </div>

                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-xs font-semibold text-yellow-900">Test OTP</p>
                                                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <div className="text-xs text-yellow-900">
                                                        <span className="font-semibold">Phone OTP:</span>{' '}
                                                        <span className="font-mono">{receivedEditPhoneOtp || '-'}</span>
                                                    </div>
                                                    <div className="text-xs text-yellow-900">
                                                        <span className="font-semibold">Email OTP:</span>{' '}
                                                        <span className="font-mono">{receivedEditEmailOtp || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {editPhoneChanged && (
                                                    <div className="p-3 border border-gray-200 rounded-lg bg-white">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-semibold text-gray-900">Phone OTP</p>
                                                            {editPhoneVerified ? (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Verified</span>
                                                            ) : (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">Pending</span>
                                                            )}
                                                        </div>
                                                        <input
                                                            value={editPhoneOtp}
                                                            onChange={(e) => setEditPhoneOtp(e.target.value)}
                                                            placeholder="Enter phone OTP"
                                                            className="mt-2 w-full px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                )}

                                                {editEmailChanged && (
                                                    <div className="p-3 border border-gray-200 rounded-lg bg-white">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-semibold text-gray-900">Email OTP</p>
                                                            {editEmailVerified ? (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">Verified</span>
                                                            ) : (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">Pending</span>
                                                            )}
                                                        </div>
                                                        <input
                                                            value={editEmailOtp}
                                                            onChange={(e) => setEditEmailOtp(e.target.value)}
                                                            placeholder="Enter email OTP"
                                                            className="mt-2 w-full px-3.5 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={isUpdatingTeacher}
                                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUpdateTeacher}
                                            disabled={isUpdatingTeacher || (editPhoneOtpSent && !editPhoneVerified) || (editEmailOtpSent && !editEmailVerified)}
                                            className="flex-1 px-4 py-2.5 bg-linear-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-semibold hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            {isUpdatingTeacher ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showModal && modalType === 'create' && (
                    <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Teacher</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                                        disabled={otpVerified}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                                        placeholder="teacher@mail.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        value={createForm.phoneNumber}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                                        disabled={otpVerified}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                                        placeholder="+998901234567"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpVerified || isSendingOtp || !createForm.phoneNumber || !createForm.email}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                                >
                                    {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                                </button>

                                {otpSent && !otpVerified && (
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            {receivedPhoneOtp && (
                                                <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                                                    Phone Test OTP: <span className="font-mono font-bold">{receivedPhoneOtp}</span>
                                                </div>
                                            )}
                                            <input
                                                value={phoneOtp}
                                                onChange={(e) => setPhoneOtp(e.target.value)}
                                                placeholder="Enter phone OTP"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                            />
                                        </div>

                                        <div>
                                            {receivedEmailOtp && (
                                                <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                                                    Email Test OTP: <span className="font-mono font-bold">{receivedEmailOtp}</span>
                                                </div>
                                            )}
                                            <input
                                                value={emailOtp}
                                                onChange={(e) => setEmailOtp(e.target.value)}
                                                placeholder="Enter email OTP"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                            />
                                        </div>
                                    </div>
                                )}

                                {otpVerified && (
                                    <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                        ✅ Email & Phone verified
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        value={createForm.fullname}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, fullname: e.target.value }))}
                                        disabled={!otpVerified}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                                        placeholder="Ali Valiyev"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                                        disabled={!otpVerified}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                                        placeholder="@Komol12345"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expirence (years)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={createForm.expirence}
                                        onChange={(e) => setCreateForm((p) => ({ ...p, expirence: Number(e.target.value) }))}
                                        disabled={!otpVerified}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                                    />
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isCreatingTeacher}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateTeacher}
                                        disabled={isCreatingTeacher || !otpVerified}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-300"
                                    >
                                        {isCreatingTeacher ? 'Creating...' : 'Create Teacher'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showModal && modalType === 'certificate' && (
                    <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Create Certificate</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specification Name</label>
                                    <input
                                        value={certificateForm.specificationName}
                                        onChange={(e) => setCertificateForm((p) => ({ ...p, specificationName: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        placeholder="IELTS Preparation"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                    <select
                                        value={certificateForm.level}
                                        onChange={(e) => setCertificateForm((p) => ({ ...p, level: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                    >
                                        {Object.values(LanguageLevel).map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={certificateForm.description}
                                        onChange={(e) => setCertificateForm((p) => ({ ...p, description: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        rows={3}
                                        placeholder="Advanced level language course description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hour Price</label>
                                    <input
                                        type="number"
                                        value={certificateForm.hourPrice}
                                        onChange={(e) => setCertificateForm((p) => ({ ...p, hourPrice: Number(e.target.value) }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        placeholder="50000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID</label>
                                    <input
                                        type="number"
                                        value={certificateForm.teacherId}
                                        onChange={(e) => setCertificateForm((p) => ({ ...p, teacherId: Number(e.target.value) }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        placeholder="1"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCreateCertificate}
                                    disabled={isCreatingCertificate}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                                >
                                    {isCreatingCertificate ? 'Creating...' : 'Create Certificate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );

};
