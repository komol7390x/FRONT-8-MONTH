import { Alert, Card, InputNumber, Select, Spin, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Hash, Search, User, UserRound, X } from 'lucide-react';
import { Pagination } from '../admin/components/pagantion';
import { useLessonTemplates } from './service/useLessonTemplates';
import { useCreateLessonTemplate } from '../../teacher/service/useCreateLessonTemplate';
import { StudentMoreModal } from '../student/components/student-more-modal';
import { TeacherMoreModal } from '../../teacher/components/teacher-more-modal';
import type { Student } from '../student/service/useGetStudents';
import type { Teacher } from '../../teacher/service/useGetTeachers';
import { useGetStudentById } from '../student/service/useGetStudentById';
import { useGetTeacherById } from '../../teacher/service/useGetTeacherById';

export const LessonPage: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');

    const [status, setStatus] = useState<string | undefined>(undefined);
    const [weekday, setWeekday] = useState<string | undefined>(undefined);
    const [teacherId, setTeacherId] = useState<number | undefined>(undefined);
    const [studentId, setStudentId] = useState<number | undefined>(undefined);
    const [active, setActive] = useState<boolean | undefined>(undefined);

    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [chooserOpen, setChooserOpen] = useState<boolean>(false);

    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [createForm, setCreateForm] = useState({
        teacherId: 0,
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

    const { mutateAsync: createLesson } = useCreateLessonTemplate() as any;

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

    const dataSource = (query.data?.data || []).map((row: any) => ({
        key: row?.id ?? `${row?.teacherId}-${row?.studentId}-${Math.random()}`,
        ...row,
    }));

    const totalCount = query.data?.meta?.totalItems || dataSource.length;
    const totalPages = query.data?.meta?.totalPages || 0;

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

    const toUnixSeconds = (v: string) => {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return null;
        return Math.floor(d.getTime() / 1000);
    };

    const formatStartEnd = (v: any) => {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        const day = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
        const date = d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
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
                width: 60,
                render: (_: any, __: any, idx: number) => (
                    <span className="text-sm font-semibold text-gray-700">{(page - 1) * limit + idx + 1}</span>
                ),
            },
            {
                title: <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} />Active</span>,
                dataIndex: 'active',
                key: 'active',
                width: 100,
                render: (v) => (
                    <Tag color={v ? 'green' : 'red'} className="m-0">
                        {v ? 'Active' : 'Blocked'}
                    </Tag>
                ),
            },
            { title: <span className="inline-flex items-center gap-1"><Hash size={14} />ID</span>, dataIndex: 'id', key: 'id', width: 90 },
            { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
            { title: 'Name', dataIndex: 'lessonName', key: 'lessonName', width: 200 },
            {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
                width: 120,
                render: (v) => (
                    <Tag color="gold" className="m-0">
                        {v ?? '-'}
                    </Tag>
                ),
            },
            { title: 'Start', dataIndex: 'startTime', key: 'startTime', width: 190, render: (v) => formatStartEnd(v) },
            { title: 'End', dataIndex: 'endTime', key: 'endTime', width: 190, render: (v) => formatStartEnd(v) },
            { title: <span className="inline-flex items-center gap-1"><User size={14} />TeacherId</span>, dataIndex: 'teacherId', key: 'teacherId', width: 110 },
            { title: <span className="inline-flex items-center gap-1"><UserRound size={14} />StudentId</span>, dataIndex: 'studentId', key: 'studentId', width: 110 },
        ],
        [formatStartEnd, limit, page]
    );

    if (query.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (query.isError) {
        return (
            <Alert
                type="error"
                showIcon
                message="Lesson-template yuklashda xatolik"
                description={(query.error as Error)?.message}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Lesson
                </Typography.Title>

                <button
                    type="button"
                    onClick={() => {
                        setCreateForm({ teacherId: 0, lessonName: '', lessonPrice: 0, startTime: '', finishTime: '' });
                        setIsCreateOpen(true);
                    }}
                    className="h-11 px-5 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm"
                >
                    Add Lesson
                </button>
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

                    <Select
                        allowClear
                        value={weekday || undefined}
                        onChange={(v) => {
                            setWeekday((v as any) ?? undefined);
                            setPage(1);
                        }}
                        placeholder="Weekday"
                        style={{ width: '100%' }}
                        options={[
                            { value: 'Monday', label: 'Monday' },
                            { value: 'Tuesday', label: 'Tuesday' },
                            { value: 'Wednesday', label: 'Wednesday' },
                            { value: 'Thursday', label: 'Thursday' },
                            { value: 'Friday', label: 'Friday' },
                            { value: 'Saturday', label: 'Saturday' },
                            { value: 'Sunday', label: 'Sunday' },
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
                    size="small"
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
                    scroll={{ x: 1200, y: 520 }}
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

            {isCreateOpen && (
                <div
                    className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsCreateOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add Lesson</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <InputNumber
                                value={createForm.teacherId}
                                onChange={(v) => {
                                    const nextTeacherId = v === null ? 0 : Number(v);
                                    setCreateForm((p) => ({
                                        ...p,
                                        teacherId: nextTeacherId,
                                        lessonName: '',
                                        lessonPrice: 0,
                                    }));
                                }}
                                placeholder="Teacher ID"
                                style={{ width: '100%' }}
                                min={1}
                            />

                            <Select
                                showSearch
                                value={createForm.lessonName || undefined}
                                onChange={(v) => {
                                    const name = String(v || '');
                                    setCreateForm((p) => ({
                                        ...p,
                                        lessonName: name,
                                        lessonPrice: getHourPriceByName(name) || p.lessonPrice,
                                    }));
                                }}
                                placeholder={
                                    createForm.teacherId
                                        ? createTeacherByIdQuery.isPending
                                            ? 'Loading certificates...'
                                            : lessonNameOptions.length
                                                ? 'Select lesson name'
                                                : 'No certificates found'
                                        : 'Enter teacherId first'
                                }
                                disabled={!createForm.teacherId || createTeacherByIdQuery.isPending}
                                options={lessonNameOptions.map((n) => ({ value: n, label: n }))}
                                style={{ width: '100%' }}
                            />

                            <InputNumber
                                value={createForm.lessonPrice}
                                onChange={(v) => setCreateForm((p) => ({ ...p, lessonPrice: v === null ? 0 : Number(v) }))}
                                placeholder="Price"
                                style={{ width: '100%' }}
                                min={0}
                            />
                            <input
                                type="datetime-local"
                                value={createForm.startTime}
                                onChange={(e) => setCreateForm((p) => ({ ...p, startTime: e.target.value }))}
                                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm shadow-sm"
                            />
                            <input
                                type="datetime-local"
                                value={createForm.finishTime}
                                onChange={(e) => setCreateForm((p) => ({ ...p, finishTime: e.target.value }))}
                                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm shadow-sm"
                            />

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex-1 h-11 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!createForm.teacherId) {
                                            message.warning('Teacher ID is required');
                                            return;
                                        }
                                        if (!createForm.lessonName.trim()) {
                                            message.warning('Lesson name is required');
                                            return;
                                        }
                                        const st = toUnixSeconds(createForm.startTime);
                                        const ft = toUnixSeconds(createForm.finishTime);
                                        if (!st || !ft) {
                                            message.warning('Start/Finish time is required');
                                            return;
                                        }
                                        await createLesson({
                                            teacherId: Number(createForm.teacherId),
                                            lessonName: createForm.lessonName,
                                            lessonPrice: Number(createForm.lessonPrice) || 0,
                                            startTime: st,
                                            finishTime: ft,
                                        });
                                        setIsCreateOpen(false);
                                        query.refetch();
                                    }}
                                    className="flex-1 h-11 px-4 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-colors shadow-sm"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};
