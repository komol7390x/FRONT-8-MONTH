import { Alert, Button, Card, InputNumber, Select, Spin, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Copy, Hash, Search, User, X } from 'lucide-react';
import { CertificateUpsertModal } from '../../teacher/components/certificate-upsert-modal';
import { Pagination } from '../admin/components/pagantion';
import { useCertificates } from './service/useCertificates';
import { TeacherMoreModal } from '../../teacher/components/teacher-more-modal';
import { StudentMoreModal } from '../../student/components/student-more-modal';
import type { Teacher } from '../../teacher/service/useGetTeachers';
import type { Student } from '../../student/service/useGetStudents';
import { useGetTeacherById } from '../../teacher/service/useGetTeacherById';
import { useGetStudentById } from '../../student/service/useGetStudentById';

export const CertificatePage: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');

    const [status, setStatus] = useState<boolean | undefined>(undefined);
    const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);

    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
    const [upsertOpen, setUpsertOpen] = useState<boolean>(false);
    const [modalCertificate, setModalCertificate] = useState<any | null>(null);
    const [newTeacherId, setNewTeacherId] = useState<number | undefined>(undefined);

    const [teacherModalOpen, setTeacherModalOpen] = useState(false);
    const [studentModalOpen, setStudentModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const teacherByIdQuery = useGetTeacherById(selectedRow?.teacherId ? Number(selectedRow.teacherId) : undefined);
    const studentByIdQuery = useGetStudentById(selectedRow?.studentId ? Number(selectedRow.studentId) : undefined);

    const query = useCertificates({ page, limit, search, status, isDeleted });

    const dataSource = (query.data?.data || []).map((row: any, idx: number) => ({
        key: row?.id ?? idx,
        ...row,
    }));

    const totalCount = query.data?.meta?.totalItems || dataSource.length;
    const totalPages = query.data?.meta?.totalPages || 0;

    const handleLimitChange = (newLimit: string | number) => {
        setLimit(Number(newLimit));
        setPage(1);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success('Copied');
        } catch {
            message.error('Copy failed');
        }
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
            { title: <span className="inline-flex items-center gap-1"><Hash size={14} />ID</span>, dataIndex: 'id', key: 'id', width: 90 },
            { title: <span className="inline-flex items-center gap-1"><Award size={14} />Specification</span>, dataIndex: 'specificationName', key: 'specificationName', width: 220 },
            {
                title: 'Level',
                dataIndex: 'level',
                key: 'level',
                width: 120,
                render: (v) => {
                    const s = String(v || '').toUpperCase();
                    const color = s.startsWith('A') ? 'green' : s.startsWith('B') ? 'gold' : s.startsWith('C') ? 'red' : 'blue';
                    return <Tag color={color} className="m-0">{s || '-'}</Tag>;
                },
            },
            { title: 'Price', dataIndex: 'hourPrice', key: 'hourPrice', width: 140, render: (v) => <Tag color="gold" className="m-0">{v ?? '-'}</Tag> },
            { title: <span className="inline-flex items-center gap-1"><User size={14} />T</span>, dataIndex: 'teacherId', key: 'teacherId', width: 90 },
            {
                title: <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} />Active</span>,
                dataIndex: 'isActive',
                key: 'isActive',
                width: 110,
                render: (v) => <Tag color={v ? 'green' : 'red'} className="m-0">{v ? 'Active' : 'Inactive'}</Tag>,
            },
        ],
        [limit, page]
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
                message="Certificate yuklashda xatolik"
                description={(query.error as Error)?.message}
            />
        );
    }

    return (
        <div className="space-y-4">
            <Typography.Title level={3} style={{ margin: 0 }}>
                Certificate
            </Typography.Title>

            <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-gray-50 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by specification/level/teacher id"
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
                                setStatus(undefined);
                                setIsDeleted(undefined);
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
                        value={status === undefined ? undefined : status ? 'true' : 'false'}
                        onChange={(v) => {
                            setStatus(v === undefined ? undefined : v === 'true');
                            setPage(1);
                        }}
                        placeholder="Status"
                        style={{ width: '100%' }}
                        options={[
                            { value: 'true', label: 'Active' },
                            { value: 'false', label: 'Inactive' },
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
                            { value: 'false', label: 'Not deleted' },
                        ]}
                    />

                    <InputNumber
                        value={newTeacherId}
                        onChange={(v) => setNewTeacherId(v === null ? undefined : Number(v))}
                        placeholder="Teacher ID"
                        style={{ width: '100%' }}
                        min={1}
                        controls={false}
                    />

                    <Button
                        className="w-full"
                        onClick={() => {
                            setModalCertificate(null);
                            setUpsertOpen(true);
                        }}
                    >
                        Add Certificate
                    </Button>
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
                                setDetailsOpen(true);
                            },
                            onDoubleClick: () => {
                                setModalCertificate(record);
                                setUpsertOpen(true);
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

            {detailsOpen && selectedRow && (
                <div
                    className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setDetailsOpen(false);
                        setSelectedRow(null);
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Certificate Details</h2>
                            <button
                                onClick={() => {
                                    setDetailsOpen(false);
                                    setSelectedRow(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{selectedRow?.specificationName || 'Certificate'}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">ID:{selectedRow?.id}</span>
                                        {!!selectedRow?.level && (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{String(selectedRow.level)}</span>
                                        )}
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">T:{selectedRow?.teacherId ?? '-'}</span>
                                    </div>
                                </div>
                                <Tag color={selectedRow?.isActive ? 'green' : 'red'} className="m-0">
                                    {selectedRow?.isActive ? 'Active' : 'Inactive'}
                                </Tag>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            {(
                                [
                                    { label: 'ID', value: selectedRow?.id },
                                    { label: 'TeacherId', value: selectedRow?.teacherId },
                                    { label: 'Specification', value: selectedRow?.specificationName },
                                    { label: 'Level', value: selectedRow?.level },
                                    { label: 'Description', value: selectedRow?.description },
                                    { label: 'Price', value: selectedRow?.hourPrice },
                                ] as Array<{ label: string; value: any }>
                            ).map((item) => (
                                <div
                                    key={item.label}
                                    className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 mb-0.5">{item.label}</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{item.value ?? '-'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(String(item.value ?? ''))}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                        title={`Copy ${item.label}`}
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {!!selectedRow?.teacher && (
                            <div className="pt-4">
                                <h3 className="text-sm font-bold text-gray-900">Teacher</h3>
                                <div className="mt-2 space-y-2">
                                    {(
                                        [
                                            { label: 'ID', value: selectedRow.teacher?.id },
                                            { label: 'Name', value: selectedRow.teacher?.fullname ?? selectedRow.teacher?.name },
                                            { label: 'Phone', value: selectedRow.teacher?.phoneNumber },
                                            { label: 'TG', value: selectedRow.teacher?.tgUsername },
                                        ] as Array<{ label: string; value: any }>
                                    ).map((item) => (
                                        <div
                                            key={`t_${item.label}`}
                                            className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-500 mb-0.5">{item.label}</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.value ?? '-'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(String(item.value ?? ''))}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                                title={`Copy ${item.label}`}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!!selectedRow?.student && (
                            <div className="pt-4">
                                <h3 className="text-sm font-bold text-gray-900">Student</h3>
                                <div className="mt-2 space-y-2">
                                    {(
                                        [
                                            { label: 'ID', value: selectedRow.student?.id },
                                            {
                                                label: 'Name',
                                                value:
                                                    (selectedRow.student?.fullname ??
                                                        `${selectedRow.student?.firstName || ''} ${selectedRow.student?.lastName || ''}`.trim()) ||
                                                    undefined,
                                            },
                                            { label: 'Phone', value: selectedRow.student?.phoneNumber },
                                            { label: 'TG', value: selectedRow.student?.tgUsername },
                                        ] as Array<{ label: string; value: any }>
                                    ).map((item) => (
                                        <div
                                            key={`s_${item.label}`}
                                            className="group flex items-center justify-between p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-500 mb-0.5">{item.label}</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.value ?? '-'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(String(item.value ?? ''))}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                                                title={`Copy ${item.label}`}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex gap-2">
                            <Button
                                className="w-full"
                                onClick={() => {
                                    setModalCertificate(selectedRow);
                                    setUpsertOpen(true);
                                }}
                            >
                                Edit
                            </Button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Button
                                className="w-full"
                                onClick={() => {
                                    const t = teacherByIdQuery.data;
                                    if (!t) return;
                                    setSelectedTeacher(t as any);
                                    setTeacherModalOpen(true);
                                }}
                            >
                                Teacher details
                            </Button>
                            {!!selectedRow?.studentId && (
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        const s = studentByIdQuery.data;
                                        if (!s) return;
                                        setSelectedStudent(s as any);
                                        setStudentModalOpen(true);
                                    }}
                                >
                                    Student details
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <CertificateUpsertModal
                open={upsertOpen}
                certificate={modalCertificate}
                teacherId={modalCertificate?.teacherId || newTeacherId}
                onClose={() => {
                    setUpsertOpen(false);
                    setModalCertificate(null);
                }}
                onSaved={() => {
                    setUpsertOpen(false);
                    setModalCertificate(null);
                    query.refetch();
                }}
            />

            <TeacherMoreModal
                open={teacherModalOpen}
                teacher={selectedTeacher}
                onClose={() => setTeacherModalOpen(false)}
                onEdit={() => { }}
                onRefetch={() => teacherByIdQuery.refetch()}
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
