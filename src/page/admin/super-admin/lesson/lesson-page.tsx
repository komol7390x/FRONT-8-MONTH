import { Alert, Card, InputNumber, Select, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, Hash, Plus, Search, Trash2, Unlock, User, UserRound, X } from 'lucide-react';
import { Pagination } from '../admin/components/pagantion';
import { useLessonTemplates } from './service/useLessonTemplates';
import { StudentMoreModal } from '../student/components/student-more-modal';
import { TeacherMoreModal } from '../teacher/components/teacher-more-modal';
import { LessonTemplateCreateModal } from '../teacher/components/lesson-template-create-modal';
import type { Student } from '../student/service/useGetStudents';
import type { Teacher } from '../teacher/service/useGetTeachers';
import { useGetStudentById } from '../student/service/useGetStudentById';
import { useGetTeacherById } from '../teacher/service/useGetTeacherById';
import { PageLoader } from '../../../../components/page-loader';
import { request } from '../../../../config/request';
import { ConfirmModal } from '../../../../components/confirm-modal';
import { useLocation } from 'react-router-dom';

export const LessonPage: React.FC = () => {
    const location = useLocation();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 700);
        return () => clearTimeout(t);
    }, [searchInput]);

    const [status, setStatus] = useState<string | undefined>(undefined);
    const [weekday, setWeekday] = useState<string | undefined>(undefined);
    const [teacherId, setTeacherId] = useState<number | undefined>(undefined);
    const [studentId, setStudentId] = useState<number | undefined>(undefined);
    const [active, setActive] = useState<boolean | undefined>(undefined);

    const rollingWeek = useMemo(() => {
        const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayIdx = new Date().getDay();
        const res: Array<{ day: string; dateStr: string }> = [];
        for (let i = 0; i < 7; i++) {
            const idx = (todayIdx + i) % 7;
            const day = order[idx];
            const d = new Date();
            d.setDate(d.getDate() + i);
            res.push({
                day,
                dateStr: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            });
        }
        return res;
    }, []);

    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [chooserOpen, setChooserOpen] = useState<boolean>(false);

    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [createForm, setCreateForm] = useState({
        teacherId: 0,
        studentId: 0,
        lessonName: '',
        lessonPrice: 0,
        startTime: '',
        finishTime: '',
    });

    const [studentModalOpen, setStudentModalOpen] = useState<boolean>(false);
    const [teacherModalOpen, setTeacherModalOpen] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const [teacherFocusTab, setTeacherFocusTab] = useState<'info' | 'certificates' | 'lessons' | undefined>(undefined);
    const [teacherFocusLessonId, setTeacherFocusLessonId] = useState<number | undefined>(undefined);

    const studentByIdQuery = useGetStudentById(selectedRow?.studentId ? Number(selectedRow.studentId) : undefined);
    const teacherByIdQuery = useGetTeacherById(selectedRow?.teacherId ? Number(selectedRow.teacherId) : undefined);
    const createTeacherByIdQuery = useGetTeacherById(isCreateOpen && createForm.teacherId ? Number(createForm.teacherId) : undefined);

    useEffect(() => {
        if (!teacherModalOpen) return;
        const t = teacherByIdQuery.data;
        if (!t) return;
        setSelectedTeacher(t as any);
    }, [teacherByIdQuery.data, teacherModalOpen]);

    const query = useLessonTemplates({
        status,
        weekday,
        teacherId,
        studentId,
        active,
        search,
        page,
        limit,
    });

    const statsQuery = useLessonTemplates({
        status,
        teacherId,
        studentId,
        active,
        search,
        page: 1,
        limit: 1000,
    });

    const weekdayCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        const rows = (statsQuery.data?.data || []) as any[];
        for (const row of rows) {
            const d = String((row as any)?.weekDays ?? (row as any)?.weekday ?? '').trim();
            if (!d) continue;
            counts[d] = (counts[d] || 0) + 1;
        }
        return counts;
    }, [statsQuery.data?.data]);

    useEffect(() => {
        if (weekday) return;
        const today = rollingWeek[0]?.day;
        if (today && (weekdayCounts[today] || 0) > 0) {
            setWeekday(today);
            setPage(1);
            return;
        }
        const first = rollingWeek.find((x) => (weekdayCounts[x.day] || 0) > 0)?.day;
        if (first) {
            setWeekday(first);
            setPage(1);
        }
    }, [rollingWeek, weekday, weekdayCounts]);

    const dataSource = (query.data?.data || []).map((row: any) => ({
        key: row?.id ?? `${row?.teacherId}-${row?.studentId}-${Math.random()}`,
        ...row,
        active: Boolean(row?.active ?? row?.isActive ?? true),
    }));

    const totalCount = query.data?.meta?.totalItems || dataSource.length;
    const totalPages = query.data?.meta?.totalPages || 0;

    const qc = useQueryClient();
    const isSuperAdminRoute = location.pathname.startsWith('/super-admin');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmVariant, setConfirmVariant] = useState<'block' | 'unblock' | 'delete' | 'restore' | 'hard_delete'>('delete');
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmNote, setConfirmNote] = useState<string | undefined>(undefined);
    const [confirmRow, setConfirmRow] = useState<any | null>(null);
    const [confirmAction, setConfirmAction] = useState<null | 'toggle_active' | 'soft_delete' | 'hard_delete'>(null);
    const [confirmActionValue, setConfirmActionValue] = useState<boolean | null>(null);

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
            const res = await request.patch(`/lesson-template/is-active/${id}`, undefined, {
                params: { active },
            });
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Lesson status updated');
            qc.invalidateQueries({ queryKey: ['lesson-template'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update lesson status';
            message.error(errorMessage);
        },
    });

    const softDeleteMutation = useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            const res = await request.delete(`/lesson-template/soft-delete/${id}`);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Lesson updated');
            qc.invalidateQueries({ queryKey: ['lesson-template'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to soft delete lesson';
            message.error(errorMessage);
        },
    });

    const hardDeleteMutation = useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            const res = await request.delete(`/lesson-template/delete/${id}`);
            return res.data;
        },
        onSuccess: (data: any) => {
            message.success(data?.message || 'Lesson deleted');
            qc.invalidateQueries({ queryKey: ['lesson-template'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete lesson';
            message.error(errorMessage);
        },
    });

    const confirmLoading = toggleActiveMutation.isPending || softDeleteMutation.isPending || hardDeleteMutation.isPending;

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const createTeacherCertificates = (createTeacherByIdQuery.data as any)?.certificates || [];

    const lessonNameOptions: string[] = useMemo(() => {
        const names = (createTeacherCertificates || [])
            .map((c: any) => String(c?.specificationName || '').trim())
            .filter(Boolean);
        return Array.from(new Set(names));
    }, [createTeacherCertificates]);

    const getHourPriceByName = (name: string) => {
        const found = (createTeacherCertificates || []).find((c: any) => String(c?.specificationName || '').trim() === name);
        const price = Number(found?.hourPrice);
        return Number.isFinite(price) ? price : 0;
    };

    useEffect(() => {
        if (!isCreateOpen) return;
        if (!createForm.teacherId) return;
        if (createTeacherByIdQuery.isPending) return;
        if (createForm.lessonName.trim()) return;
        if (!lessonNameOptions.length) return;

        const first: string = lessonNameOptions[0];
        setCreateForm((p) => ({
            ...p,
            lessonName: first,
            lessonPrice: getHourPriceByName(first) || p.lessonPrice,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createTeacherByIdQuery.isPending, isCreateOpen, lessonNameOptions]);

    const formatStartEnd = (v: any) => {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        const day = d.toLocaleDateString('en-GB', { weekday: 'short' });
        const date = d.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
        return (
            <div className="leading-tight">
                <div className="text-xs font-semibold text-gray-800">{day} {date}</div>
                <div className="text-[11px] text-gray-500">{time}</div>
            </div>
        );
    };

    const columns: ColumnsType<any> = useMemo(
        () => [
            {
                title: '№',
                key: 'sn',
                width: 50,
                render: (_: any, __: any, idx: number) => (
                    <span className="text-sm font-semibold text-gray-700">{(page - 1) * limit + idx + 1}</span>
                ),
            },
            {
                title: <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} />Active</span>,
                dataIndex: 'active',
                key: 'active',
                width: 95,
                render: (v) => (
                    <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium text-white min-w-22 text-center ${v ? 'bg-green-600' : 'bg-red-600'}`}>
                        {v ? "Active" : "Blocked"}
                    </span>
                ),
            },
            { title: <span className="inline-flex items-center gap-1"><Hash size={14} />ID</span>, dataIndex: 'id', key: 'id', width: 70, responsive: ['sm'] },
            { title: 'Status', dataIndex: 'status', key: 'status', width: 110, responsive: ['md'] },
            { title: 'Name', dataIndex: 'lessonName', key: 'lessonName', width: 170 },
            { title: 'Start time', dataIndex: 'startTime', key: 'startTime', width: 170, responsive: ['md'], render: (v) => formatStartEnd(v) },
            { title: 'End time', dataIndex: 'endTime', key: 'endTime', width: 170, responsive: ['md'], render: (v) => formatStartEnd(v) },
            { title: <span className="inline-flex items-center gap-1"><User size={14} />TeacherId</span>, dataIndex: 'teacherId', key: 'teacherId', width: 95, responsive: ['lg'] },
            { title: <span className="inline-flex items-center gap-1"><UserRound size={14} />StudentId</span>, dataIndex: 'studentId', key: 'studentId', width: 95, responsive: ['lg'] },
            {
                title: 'Action',
                key: 'action',
                width: 260,
                fixed: 'right',
                render: (_: any, record: any) => {
                    const id = Number(record?.id);
                    const isActive = Boolean(record?.active ?? record?.isActive);
                    const isDeleted = Boolean(record?.isDeleted || record?.deleted || record?.deletedAt);

                    const openConfirm = (opts: {
                        variant: 'block' | 'unblock' | 'delete' | 'restore' | 'hard_delete';
                        title: string;
                        message: string;
                        note?: string;
                        action: 'toggle_active' | 'soft_delete' | 'hard_delete';
                        actionValue?: boolean;
                    }) => {
                        setConfirmVariant(opts.variant);
                        setConfirmTitle(opts.title);
                        setConfirmMessage(opts.message);
                        setConfirmNote(opts.note);
                        setConfirmRow(record);
                        setConfirmAction(opts.action);
                        setConfirmActionValue(typeof opts.actionValue === 'boolean' ? opts.actionValue : null);
                        setConfirmOpen(true);
                    };

                    return (
                        <div className="flex justify-end items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!Number.isFinite(id) || id <= 0) return;
                                    openConfirm({
                                        variant: isActive ? 'block' : 'unblock',
                                        title: isActive ? 'Block lesson' : 'Unblock lesson',
                                        message: isActive ? 'Do you want to block this lesson?' : 'Do you want to unblock this lesson?',
                                        action: 'toggle_active',
                                        actionValue: !isActive,
                                    });
                                }}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {isActive ? <Ban size={12} /> : <Unlock size={12} />}
                                {isActive ? 'Block' : 'Unblock'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!Number.isFinite(id) || id <= 0) return;
                                    openConfirm({
                                        variant: isDeleted ? 'restore' : 'delete',
                                        title: isDeleted ? 'Restore lesson' : 'Soft delete lesson',
                                        message: isDeleted ? 'Do you want to restore this lesson?' : 'Do you want to soft delete this lesson?',
                                        note: 'This action can be reversed.',
                                        action: 'soft_delete',
                                    });
                                }}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isDeleted ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                            >
                                {isDeleted ? <Unlock size={12} /> : <Trash2 size={12} />}
                                {isDeleted ? 'Restore' : 'Delete'}
                            </button>

                            {isSuperAdminRoute && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!Number.isFinite(id) || id <= 0) return;
                                        openConfirm({
                                            variant: 'hard_delete',
                                            title: 'Delete lesson',
                                            message: 'Do you want to permanently delete this lesson?',
                                            note: 'This action cannot be undone.',
                                            action: 'hard_delete',
                                        });
                                    }}
                                    className="px-3 py-1.5 bg-red-800 text-white rounded text-sm font-medium hover:bg-red-900 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={12} />
                                    Delete
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [isSuperAdminRoute, limit, page]
    );

    if (query.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    if (query.isError) {
        return (
            <Alert
                type="error"
                showIcon
                message="Failed to load lessons"
                description={(query.error as Error)?.message}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6 overflow-x-hidden">
            <div className="max-w-screen-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        Lesson
                    </Typography.Title>

                    <button
                        type="button"
                        onClick={() => {
                            setCreateForm({ teacherId: 0, studentId: 0, lessonName: '', lessonPrice: 0, startTime: '', finishTime: '' });
                            setIsCreateOpen(true);
                        }}
                        className="h-11 px-5 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Add Lesson
                    </button>
                </div>

                {/* Week Day Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {rollingWeek.map(({ day, dateStr }) => {
                        const count = weekdayCounts[day] || 0;
                        const isActiveDay = count > 0;
                        const isSelected = weekday === day;
                        return (
                            <button
                                key={day}
                                onClick={() => {
                                    if (!isActiveDay) return;
                                    setWeekday(isSelected ? undefined : day);
                                    setPage(1);
                                }}
                                disabled={!isActiveDay}
                                className={`py-3 px-2 rounded-xl text-sm font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-1
                                    ${isSelected
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 transform scale-105'
                                        : isActiveDay
                                            ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                                            : 'bg-white text-gray-400 border border-gray-200 opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                <span>{day.slice(0, 3)}</span>
                                <span className="text-xs font-normal opacity-80">{dateStr}</span>
                                {isActiveDay && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs leading-none ${isSelected ? 'bg-white/30' : 'bg-blue-100 text-blue-700'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by lesson/teacher/student id"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearch(searchInput);
                                        setPage(1);
                                    }
                                }}
                                className="w-full h-11 pl-11 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm shadow-sm"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch(searchInput);
                                    setPage(1);
                                }}
                                className="h-11 px-5 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <Search size={16} />
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput('');
                                    setSearch('');
                                    setActive(undefined);
                                    setWeekday(undefined);
                                    setStatus(undefined);
                                    setTeacherId(undefined);
                                    setStudentId(undefined);
                                    setPage(1);
                                    setLimit(10);
                                }}
                                className="h-11 px-5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <Select
                            allowClear
                            value={status || undefined}
                            onChange={(v) => {
                                setStatus((v as any) ?? undefined);
                                setPage(1);
                            }}
                            placeholder="Status"
                            style={{ width: '100%' }}
                            options={[
                                { value: 'available', label: 'Available' },
                                { value: 'booked', label: 'Booked' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' },
                                { value: 'expired', label: 'Expired' },
                            ]}
                        />

                        <Select
                            allowClear
                            value={active === undefined ? undefined : active ? 'true' : 'false'}
                            onChange={(v) => {
                                setActive(v === undefined ? undefined : v === 'true');
                                setPage(1);
                            }}
                            placeholder="Active"
                            style={{ width: '100%' }}
                            options={[
                                { value: 'true', label: 'Active' },
                                { value: 'false', label: 'Inactive' },
                            ]}
                        />

                        <InputNumber
                            value={teacherId}
                            onChange={(v) => {
                                setTeacherId(v === null ? undefined : Number(v));
                                setPage(1);
                            }}
                            placeholder="Teacher ID"
                            style={{ width: '100%' }}
                            min={1}
                            controls={false}
                        />

                        <InputNumber
                            value={studentId}
                            onChange={(v) => {
                                setStudentId(v === null ? undefined : Number(v));
                                setPage(1);
                            }}
                            placeholder="Student ID"
                            style={{ width: '100%' }}
                            min={1}
                            controls={false}
                        />
                    </div>
                </div>

                <Card>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        rowKey={(record: any) => String(record?.id ?? record?.key ?? '')}
                        size="small"
                        tableLayout="fixed"
                        rowClassName={() => 'h-12'}
                        onRow={(record) => {
                            return {
                                onClick: () => {
                                    setSelectedRow(record);
                                    setChooserOpen(true);
                                },
                            };
                        }}
                        pagination={false}
                        scroll={{ x: 1200 }}
                        locale={{ emptyText: 'No lessons found' }}
                    />
                </Card>

                <Pagination
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    admins={dataSource as any}
                    setPage={setPage}
                    handleLimitChange={handleLimitChange}
                />

                {chooserOpen && selectedRow && (
                    <div
                        className="fixed inset-0 bg-emerald-600/20 flex items-center justify-center z-50 p-4"
                        onClick={() => setChooserOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Open details</h3>
                                <button onClick={() => setChooserOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setChooserOpen(false);
                                        setTeacherFocusTab('lessons');
                                        setTeacherFocusLessonId(selectedRow?.id ? Number(selectedRow.id) : undefined);
                                        setTeacherModalOpen(true);
                                    }}
                                    className="h-11 px-4 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm"
                                >
                                    Teacher details
                                </button>

                                {!!selectedRow?.studentId ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setChooserOpen(false);
                                            const s = studentByIdQuery.data;
                                            if (!s) {
                                                message.warning('Student not loaded');
                                                return;
                                            }
                                            setSelectedStudent(s as any);
                                            setStudentModalOpen(true);
                                        }}
                                        className="h-11 px-4 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 transition-colors shadow-sm"
                                    >
                                        Student details
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="h-11 px-4 bg-gray-100 text-gray-400 rounded-xl text-sm font-semibold cursor-not-allowed"
                                    >
                                        Student details
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <LessonTemplateCreateModal
                    open={isCreateOpen}
                    teacherId={Number(createForm.teacherId) || 0}
                    studentId={Number(createForm.studentId) || 0}
                    certificates={createTeacherCertificates}
                    existingLessons={(createTeacherByIdQuery.data as any)?.lessons || []}
                    showTeacherIdInput={true}
                    showStudentIdInput={true}
                    onTeacherIdChange={(id: number) => {
                        setCreateForm((p) => ({
                            ...p,
                            teacherId: id,
                            studentId: p.studentId,
                            lessonName: '',
                            lessonPrice: 0,
                            startTime: '',
                            finishTime: '',
                        }));
                    }}
                    onStudentIdChange={(id: number) => {
                        setCreateForm((p) => ({
                            ...p,
                            studentId: id,
                        }));
                    }}
                    onClose={() => setIsCreateOpen(false)}
                    onCreated={() => {
                        setIsCreateOpen(false);
                        query.refetch();
                    }}
                />

                <TeacherMoreModal
                    open={teacherModalOpen}
                    teacher={selectedTeacher}
                    onClose={() => {
                        setTeacherModalOpen(false);
                        setTeacherFocusTab(undefined);
                        setTeacherFocusLessonId(undefined);
                        setSelectedTeacher(null);
                    }}
                    onEdit={() => { }}
                    onRefetch={() => teacherByIdQuery.refetch()}
                    focusTab={teacherFocusTab}
                    focusLessonId={teacherFocusLessonId}
                />

                <StudentMoreModal
                    open={studentModalOpen}
                    student={selectedStudent}
                    onClose={() => setStudentModalOpen(false)}
                    onRefetch={() => studentByIdQuery.refetch()}
                />

                <ConfirmModal
                    open={confirmOpen}
                    variant={confirmVariant}
                    title={confirmTitle}
                    message={confirmMessage}
                    note={confirmNote}
                    loading={confirmLoading}
                    onCancel={() => {
                        if (confirmLoading) return;
                        setConfirmOpen(false);
                        setConfirmRow(null);
                        setConfirmAction(null);
                        setConfirmActionValue(null);
                        setConfirmNote(undefined);
                    }}
                    onConfirm={async () => {
                        if (confirmLoading) return;
                        const id = Number(confirmRow?.id);
                        if (!Number.isFinite(id) || id <= 0 || !confirmAction) {
                            setConfirmOpen(false);
                            return;
                        }
                        try {
                            if (confirmAction === 'toggle_active') {
                                await toggleActiveMutation.mutateAsync({ id, active: Boolean(confirmActionValue) });
                            }
                            if (confirmAction === 'soft_delete') {
                                await softDeleteMutation.mutateAsync({ id });
                            }
                            if (confirmAction === 'hard_delete') {
                                await hardDeleteMutation.mutateAsync({ id });
                            }
                            await query.refetch();
                            setConfirmOpen(false);
                            setConfirmRow(null);
                            setConfirmAction(null);
                            setConfirmActionValue(null);
                            setConfirmNote(undefined);
                        } catch {
                            // handled in mutations
                        }
                    }}
                />
            </div>
        </div>
    );
};
