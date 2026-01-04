import { Badge, type MenuProps } from 'antd';
import { BarChart3, CreditCard, FileBadge2, Settings, ShieldUser, UserLock, UserRoundX, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
type MenuItem = Required<MenuProps>['items'][number];


export const items: MenuItem[] = [
    // ADMIN
    {
        key: 'sub1',
        label: <span className="font-semibold">Admin</span>,
        icon: <ShieldUser size={20} />,
        children: [
            {
                key: 'admin-stats',
                label: <Link to={'/super-admin/admin/statistics'} className="font-medium">Statistics</Link>,
                icon: <BarChart3 size={16} />
            },
            {
                key: 'admin-list',
                label: <Link to={'/super-admin/admin/list'} className="font-medium">List</Link>,
                icon: <Users size={16} />
            },
            {
                key: 'admin-blocked',
                label: <Link to={'/super-admin/admin/blocked'} className="font-medium">Blocked</Link>,
                icon: <UserLock size={16} />
            },
            {
                key: 'admin-delete',
                label: <Link to={'/super-admin/admin/delete'} className="font-medium">Delete</Link>,
                icon: <UserRoundX size={16} />
            },
        ],
    },

    // TEACHER
    {
        key: 'sub2',
        label: (
            <div className="flex items-center justify-between w-full">
                <span className="font-semibold">Teacher</span>
                <Badge />
            </div>
        ),
        icon: <Users size={20} />,
        children: [
            {
                key: 'teacher-stats',
                label: <Link to={'/super-admin/teacher/statistics'} className="font-medium">Statistics</Link>,
                icon: <BarChart3 size={16} />
            },
            {
                key: 'teacher-all',
                label: <Link to={'/super-admin/teacher/all'} className="font-medium">List</Link>,
                icon: <Users size={16} />
            },
            {
                key: 'teacher-blocked',
                label: <Link to={'/super-admin/teacher/blocked'} className="font-medium">Blocked</Link>,
                icon: <UserLock size={16} />
            },
            {
                key: 'teacher-delete',
                label: <Link to={'/super-admin/teacher/delete'} className="font-medium">Delete</Link>,
                icon: <UserRoundX size={16} />
            },
        ],
    },

    // STUDENT
    {
        key: 'sub3',
        label: <span className="font-semibold">Student</span>,
        icon: <Users size={20} />,
        children: [
            {
                key: 'student-stats',
                label: <Link to={'/super-admin/student/statistics'} className="font-medium">Statistics</Link>,
                icon: <BarChart3 size={16} />
            },
            {
                key: 'student-all',
                label: <Link to={'/super-admin/student/all'} className="font-medium">List</Link>,
                icon: <Users size={16} />
            },
            {
                key: 'student-blocked',
                label: <Link to={'/super-admin/student/blocked'} className="font-medium">Blocked</Link>,
                icon: <UserLock size={16} />
            },
            {
                key: 'student-delete',
                label: <Link to={'/super-admin/student/delete'} className="font-medium">Delete</Link>,
                icon: <UserRoundX size={16} />
            },
        ],
    },
    {
        key: 'lesson-page',
        label: <Link to={'/super-admin/lesson'} className="font-semibold">Lesson</Link>,
        icon: <Video size={20} />,
    },
    {
        key: 'certificate-page',
        label: <Link to={'/super-admin/certificate'} className="font-semibold">Certificate</Link>,
        icon: <FileBadge2 size={20} />,
    },
    {
        key: 'payment-page',
        label: <Link to={'/super-admin/payment'} className="font-semibold">Payment</Link>,
        icon: <CreditCard size={20} />,
    },
    {
        key: 'settings-key', // '7' o'rniga
        label: <Link to={'/super-admin/settings'} className="font-semibold">Settings</Link>,
        icon: <Settings size={20} />,
    },
];