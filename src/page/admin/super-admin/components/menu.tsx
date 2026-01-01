import { Badge, type MenuProps } from 'antd';
import { BarChart3, FileText, Settings, ShieldUser, UserLock, UserRoundX, Users } from 'lucide-react';
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
                label: <Link to={'/app/admin/statistics'} className="font-medium">Statistics</Link>,
                icon: <BarChart3 size={16} />
            },
            {
                key: 'admin-list', 
                label: <Link to={'/app/admin/analytics'} className="font-medium">List</Link>,
                icon: <Users size={16} />
            },
            {
                key: 'admin-inactive',
                label: <Link to={'/app/admin/analytics'} className="font-medium">Inactive</Link>,
                icon: <UserLock size={16} />
            },
            {
                key: 'admin-blocked',
                label: <Link to={'/app/admin/analytics'} className="font-medium">List</Link>,
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
                key: 'teacher-users', // '3' o'rniga yangi key
                label: <Link to={'/admin/users'} className="font-medium">All Users</Link>,
            },
            {
                key: 'teacher-roles', // '4' o'rniga yangi key
                label: <Link to={'/admin/roles'} className="font-medium">Roles & Permissions</Link>,
            },
        ],
    },

    // STUDENT
    {
        key: 'sub3',
        label: <span className="font-semibold">Content</span>,
        icon: <FileText size={20} />,
        children: [
            {
                key: 'content-posts', // '5' o'rniga yangi key
                label: <Link to={'/admin/posts'} className="font-medium">Posts</Link>,
            },
            {
                key: 'content-media', // '6' o'rniga yangi key
                label: <Link to={'/admin/media'} className="font-medium">Media Library</Link>,
            },
        ],
    },
    {
        key: 'settings-key', // '7' o'rniga
        label: <span className="font-semibold">Settings</span>,
        icon: <Settings size={20} />,
    },
];