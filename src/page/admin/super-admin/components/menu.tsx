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
                key: 'teacher-users',
                label: <Link to={'/super-admin/users'} className="font-medium">All Users</Link>,
            },
            {
                key: 'teacher-roles',
                label: <Link to={'/super-admin/roles'} className="font-medium">Roles & Permissions</Link>,
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
                key: 'content-posts',
                label: <Link to={'/super-admin/posts'} className="font-medium">Posts</Link>,
            },
            {
                key: 'content-media',
                label: <Link to={'/super-admin/media'} className="font-medium">Media Library</Link>,
            },
        ],
    },
    {
        key: 'settings-key', // '7' o'rniga
        label: <span className="font-semibold">Settings</span>,
        icon: <Settings size={20} />,
    },
];