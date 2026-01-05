import type { MenuProps } from 'antd';
import { BarChart3, CreditCard, PlusCircle, Settings, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

export const items: MenuItem[] = [
    {
        key: 'teacher-stats',
        label: <Link to={'/teacher-panel/statistics'} className="font-semibold">Statistics</Link>,
        icon: <BarChart3 size={20} />,
    },
    {
        key: 'teacher-lessons',
        label: <Link to={'/teacher-panel/lessons'} className="font-semibold">Lessons</Link>,
        icon: <Video size={20} />,
    },
    {
        key: 'teacher-create-lesson',
        label: <Link to={'/teacher-panel/create-lesson'} className="font-semibold">Create Lesson</Link>,
        icon: <PlusCircle size={20} />,
    },
    {
        key: 'teacher-payment',
        label: <Link to={'/teacher-panel/payment'} className="font-semibold">Payment</Link>,
        icon: <CreditCard size={20} />,
    },
    {
        key: 'teacher-settings',
        label: <Link to={'/teacher-panel/settings'} className="font-semibold">Settings</Link>,
        icon: <Settings size={20} />,
    },
];
