import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MoreHorizontal, Ban, Unlock, Trash2, Edit, Phone, Mail } from 'lucide-react';
import { message } from 'antd';
import { useGetTeachers, TeacherSort, LanguageLevel, type Teacher } from './service/useGetTeachers';
import { useTeacherIsActive } from './service/useTeacherIsActive';
import { useTeacherLessons, BookedLessonStatus, type LessonTemplateItem } from './service/useTeacherLessons';
import { Pagination } from '../super-admin/admin/components/pagantion';

type ModalType = 'more' | 'details' | '';

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
    const navigate = useNavigate();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>(TeacherSort.FULLNAME);
    const [level, setLevel] = useState<string>('');
    const [lang, setLang] = useState<string>('');

    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<ModalType>('');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const [activeTab, setActiveTab] = useState<'info' | 'certificates' | 'lessons' | 'students'>('info');

    const { data, isPending, isError, error, refetch } = useGetTeachers({
        page,
        limit,
        search,
        sort: sort as any,
        level: (level as any) || undefined,
        lang: lang || undefined,
    });

    const { mutate: setActive, isPending: isBlocking } = useTeacherIsActive();

    const teachersRaw = data?.data || [];
    const totalCount = data?.meta?.totalItems || teachersRaw.length;
    const totalPages = data?.meta?.totalPages || 0;

    const teachers = useMemo(() => {
        if (mode === 'delete') return teachersRaw.filter(t => !!t.isDeleted);
        if (mode === 'blocked') return teachersRaw.filter(t => !t.isDeleted && !t.isActive);
        return teachersRaw.filter(t => !t.isDeleted);
    }, [mode, teachersRaw]);

    const openModal = (type: ModalType, teacher: Teacher) => {
        setModalType(type);
        setSelectedTeacher(teacher);
        if (type === 'details') {
            setActiveTab('info');
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setSelectedTeacher(null);
    };

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const certificatesText = useMemo(() => {
        const certs = selectedTeacher?.certificates || [];
        if (certs.length === 0) return '-';
        return certs
            .slice(0, 3)
            .map((c) => `${c.specificationName || '-'} (${c.level || '-'})`)
            .join(', ');
    }, [selectedTeacher]);

    const lessonsQuery = useTeacherLessons(selectedTeacher?.id, {
        status: BookedLessonStatus.AVAILABLE,
        page: 1,
        limit: 111,
    });

    const lessons: LessonTemplateItem[] = lessonsQuery.data?.data || [];
    const students = useMemo(() => {
        const map = new Map<number, NonNullable<LessonTemplateItem['student']>>();
        lessons.forEach(l => {
            if (l.student && typeof l.student.id === 'number') {
                map.set(l.student.id, l.student);
            }
        });
        return Array.from(map.values());
    }, [lessons]);

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
                            <button
                                onClick={() => navigate('/super-admin/teacher/create')}
                                className="bg-green-600 text-white px-6 py-2.5 rounded font-medium hover:bg-green-700 transition-colors"
                            >
                                Add Teacher
                            </button>
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            type="text"
                            placeholder="Search by fullname/email/phone"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />

                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value={TeacherSort.FULLNAME}>Sort: Fullname</option>
                            <option value={TeacherSort.EMAIL}>Sort: Email</option>
                            <option value={TeacherSort.RATING}>Sort: Rating</option>
                            <option value={TeacherSort.CREATED_AT}>Sort: Created</option>
                        </select>

                        <select
                            value={level}
                            onChange={(e) => {
                                setLevel(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">Level: All</option>
                            {Object.values(LanguageLevel).map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="lang (e.g. s)"
                            value={lang}
                            onChange={(e) => {
                                setLang(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
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
                                    onClick={() => openModal('details', t)}
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
                                <h2 className="text-xl font-bold text-gray-900">Teacher Actions</h2>
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

                            <div className="mt-4 space-y-3">
                                <div className="text-xs text-gray-600">
                                    <p className="font-semibold">Certificates</p>
                                    <p className="mt-1">{certificatesText}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled
                                        className="flex-1 px-4 py-2.5 bg-blue-300 text-white rounded text-sm font-medium cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                        title="Edit endpoint not provided"
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
                                    disabled
                                    onClick={() => message.info('Delete endpoint not provided yet')}
                                    className="w-full px-4 py-2.5 bg-red-300 text-white rounded text-sm font-medium cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showModal && selectedTeacher && modalType === 'details' && (
                    <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Teacher Details</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('info')}
                                    className={`px-4 py-2 rounded text-sm font-semibold border ${activeTab === 'info' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Info
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('certificates')}
                                    className={`px-4 py-2 rounded text-sm font-semibold border ${activeTab === 'certificates' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Certificates
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('lessons')}
                                    className={`px-4 py-2 rounded text-sm font-semibold border ${activeTab === 'lessons' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Lessons
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('students')}
                                    className={`px-4 py-2 rounded text-sm font-semibold border ${activeTab === 'students' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Students
                                </button>
                            </div>

                            {activeTab === 'info' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <p className="text-xs font-semibold text-gray-500">Fullname</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedTeacher.fullname}</p>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <p className="text-xs font-semibold text-gray-500">Email</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedTeacher.email}</p>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <p className="text-xs font-semibold text-gray-500">Phone</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedTeacher.phoneNumber}</p>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <p className="text-xs font-semibold text-gray-500">Rating</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedTeacher.rating ?? '-'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'certificates' && (
                                <div className="space-y-2">
                                    {(selectedTeacher.certificates || []).length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">No certificates</div>
                                    ) : (
                                        (selectedTeacher.certificates || []).map((c, i) => (
                                            <div key={i} className="p-4 border border-gray-200 rounded-lg">
                                                <p className="text-sm font-semibold text-gray-900">{c.specificationName || '-'}</p>
                                                <p className="text-xs text-gray-600 mt-1">Level: {c.level || '-'}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'lessons' && (
                                <div className="space-y-2">
                                    {lessonsQuery.isPending ? (
                                        <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Loading lessons...</div>
                                    ) : lessons.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">No lessons</div>
                                    ) : (
                                        lessons.map((l) => (
                                            <div key={l.id} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm font-semibold text-gray-900">{l.lessonName || 'Lesson'}</p>
                                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">{l.status}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">Weekday: {l.weekDays || '-'}</p>
                                                <p className="text-xs text-gray-600">Price: {l.price || '-'}</p>
                                                <p className="text-xs text-gray-600">Student: {l.student ? `${l.student.firstName || ''} ${l.student.lastName || ''}`.trim() || `ID:${l.student.id}` : '—'}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'students' && (
                                <div className="space-y-2">
                                    {lessonsQuery.isPending ? (
                                        <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Loading students...</div>
                                    ) : students.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">No students</div>
                                    ) : (
                                        students.map((s) => (
                                            <div key={s.id} className="p-4 border border-gray-200 rounded-lg">
                                                <p className="text-sm font-semibold text-gray-900">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || `Student ID:${s.id}`}</p>
                                                <p className="text-xs text-gray-600 mt-1">Phone: {s.phoneNumber || '-'}</p>
                                                <p className="text-xs text-gray-600">Username: {s.tgUsername || '-'}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
