import { Badge, type MenuProps } from 'antd';
import { BarChart3, CalendarDays, CreditCard, UserLock, Users, Video, FileBadge2 } from 'lucide-react';
import { Link } from 'react-router-dom';


type MenuItem = Required<MenuProps>['items'][number];


export const items: MenuItem[] = [

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
                label: <Link to={'/admin/teacher/statistics'} className="font-medium">Statistics</Link>,
                icon: <BarChart3 size={16} />,
            },
            {
                key: 'teacher-all',
                label: <Link to={'/admin/teacher/all'} className="font-medium">List</Link>,
                icon: <Users size={16} />
            },
            {
                key: 'teacher-blocked',
                label: <Link to={'/admin/teacher/blocked'} className="font-medium">Blocked</Link>,
                icon: <UserLock size={16} />
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
                label: <Link to={'/admin/student/statistics'} className="font-medium">Statistics</Link>,
                icon: <BarChart3 size={16} />,
            },
            {
                key: 'student-all',
                label: <Link to={'/admin/student/all'} className="font-medium">List</Link>,
                icon: <Users size={16} />
            },
            {
                key: 'student-blocked',
                label: <Link to={'/admin/student/blocked'} className="font-medium">Blocked</Link>,
                icon: <UserLock size={16} />
            },
        ],
    },

    {
        key: 'lesson-page',
        label: <Link to={'/admin/lesson'} className="font-semibold">Lesson</Link>,
        icon: <Video size={20} />,
    },
    {
        key: 'schedule-page',
        label: <Link to={'/admin/schedule'} className="font-semibold">Schedule</Link>,
        icon: <CalendarDays size={20} />,
    },
    {
        key: 'certificate-page',
        label: <Link to={'/admin/certificate'} className="font-semibold">Certificate</Link>,
        icon: <FileBadge2 size={20} />,
    },
    {
        key: 'payment-page',
        label: <Link to={'/admin/payment'} className="font-semibold">Payment</Link>,
        icon: <CreditCard size={20} />,
    },
];