import { Badge, type MenuProps } from 'antd';
import { FileText, Settings, Users } from 'lucide-react';
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
                key: '3',
                label: <Link to={'/admin/users'} className="font-medium">All Users</Link>,
            },
            {
                key: '4',
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
                key: '5',
                label: <Link to={'/admin/posts'} className="font-medium">Posts</Link>,
            },
            {
                key: '6',
                label: <Link to={'/admin/media'} className="font-medium">Media Library</Link>,
            },
        ],
    },
    {
        key: '7',
        label: <span className="font-semibold">Settings</span>,
        icon: <Settings size={20} />,
    },
];