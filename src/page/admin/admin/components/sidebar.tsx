import { useEffect, useMemo, useState } from 'react';
import logo from '@/assets/img/logo.png'
import { items } from './menu';
import { Bell, ChevronLeft, ChevronRight, Settings, User } from 'lucide-react';
import { Avatar, ConfigProvider, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useGetMe } from '../../super-admin/admin/service/get-me';

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { data, isPending, isError } = useGetMe();
    const location = useLocation();

    const { selectedKeys, openKeys: openKeysByPath } = useMemo(() => {
        const p = location.pathname;

        if (p.startsWith('/admin/teacher/statistics')) return { selectedKeys: ['teacher-stats'], openKeys: ['sub2'] };
        if (p.startsWith('/admin/teacher/all')) return { selectedKeys: ['teacher-all'], openKeys: ['sub2'] };
        if (p.startsWith('/admin/teacher/blocked')) return { selectedKeys: ['teacher-blocked'], openKeys: ['sub2'] };
        if (p.startsWith('/admin/teacher')) return { selectedKeys: ['teacher-all'], openKeys: ['sub2'] };

        if (p.startsWith('/admin/student/statistics')) return { selectedKeys: ['student-stats'], openKeys: ['sub3'] };
        if (p.startsWith('/admin/student/all')) return { selectedKeys: ['student-all'], openKeys: ['sub3'] };
        if (p.startsWith('/admin/student/blocked')) return { selectedKeys: ['student-blocked'], openKeys: ['sub3'] };
        if (p.startsWith('/admin/student')) return { selectedKeys: ['student-all'], openKeys: ['sub3'] };

        if (p.startsWith('/admin/lesson')) return { selectedKeys: ['lesson-page'], openKeys: [] };
        if (p.startsWith('/admin/schedule')) return { selectedKeys: ['schedule-page'], openKeys: [] };
        if (p.startsWith('/admin/certificate')) return { selectedKeys: ['certificate-page'], openKeys: [] };
        if (p.startsWith('/admin/payment')) return { selectedKeys: ['payment-page'], openKeys: [] };

        return { selectedKeys: [], openKeys: [] };
    }, [location.pathname]);

    const [openKeys, setOpenKeys] = useState<string[]>(openKeysByPath);

    useEffect(() => {
        setOpenKeys(openKeysByPath);
    }, [openKeysByPath]);

    if (isPending) {
        return <div className="animate-pulse bg-white/10 h-10 w-full rounded-xl" />;
    }
    if (isError) {
        return <div className="text-rose-500 text-xs text-center">Ma'lumot yuklanmadi</div>;
    }

    const isNotificationActive = location.pathname.startsWith('/admin/notification');
    const isSettingsActive = location.pathname.startsWith('/admin/settings');

    return (
        <div>
            <div
                className={`h-screen bg-linear-to-b from-[#1b1035] via-[#2a1a4d] to-[#1b1035] flex flex-col shadow-2xl border-r border-white/10 relative transition-all duration-300 shrink-0 overflow-hidden ${collapsed ? 'w-20' : 'w-72'
                    }`}
            >
                {/* Collapse Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-10 right-0 z-50 bg-cyan-500 text-white p-1 rounded-l-md hover:bg-cyan-400 transition-colors shadow-lg"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                {/* Logo Section */}
                <Link to={'/admin/teacher/all'}>
                    <div className={`relative h-28 flex items-center shrink-0 transition-all duration-300 ${collapsed ? 'px-2 justify-center' : 'px-4'}`}>
                        <div className={`flex items-center gap-4 p-3 border cursor-pointer backdrop-blur-md hover:bg-white/10 rounded-xl transition-all w-full ${collapsed ? 'border-transparent justify-center' : 'border-white/10'}`}>
                            <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-linear-to-br from-cyan-500/20 to-blue-500/20 rounded-lg p-2">
                                <img src={logo} alt="logo" className="w-full h-full object-contain" />
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden shrink-0">
                                    <h1 className="text-white font-bold text-[12px] whitespace-nowrap">ONLINE FULL STACK</h1>
                                    <p className="text-cyan-400 font-semibold text-xs uppercase">Course</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Menu Section */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-2">
                    <ConfigProvider
                        theme={{
                            components: {
                                Menu: {
                                    itemBg: 'transparent',
                                    itemColor: '#94a3b8',
                                    itemHoverColor: '#ffffff',
                                    itemSelectedBg: 'rgba(8, 145, 178, 0.3)',
                                    itemSelectedColor: '#06b6d4',
                                    itemBorderRadius: 10,
                                    activeBarBorderWidth: 0,
                                },
                            },
                        }}
                    >
                        <Menu
                            mode="inline"
                            inlineCollapsed={collapsed}
                            items={items} // Bu yerda menyu itemlaringiz bo'lishi kerak
                            className="bg-transparent border-none"
                            selectedKeys={selectedKeys}
                            openKeys={openKeys}
                            onOpenChange={(keys) => {
                                const latestOpenKey = keys.find((k) => !openKeys.includes(k));
                                if (latestOpenKey) {
                                    setOpenKeys([latestOpenKey]);
                                } else {
                                    setOpenKeys(keys);
                                }
                            }}
                        />
                    </ConfigProvider>
                </div>

                {/* --- Notification SECTION --- */}
                <Link to={'/admin/notification'}>
                    <div
                        className={`mx-2 py-4 mb-2 cursor-pointer rounded-xl border transition-all shrink-0 
                              ${collapsed ? 'p-2 w-12 mx-auto' : 'px-6 py-4'}
                              ${isNotificationActive
                                ? 'bg-cyan-500/5 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                : 'border-cyan-500/5 hover:border-cyan-500/40'
                            }`}
                    >
                        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                            <Bell
                                size={18}
                                className={`shrink-0 transition-colors ${isNotificationActive ? 'text-cyan-400' : 'text-white'}`}
                            />
                            {!collapsed && (
                                <span className={`text-sm transition-colors ${isNotificationActive ? 'text-cyan-400 font-bold' : 'text-white'}`}>
                                    Notification
                                </span>
                            )}
                        </div>
                    </div>
                </Link>

                {/* --- Settings SECTION --- */}
                <Link to={'/admin/settings'}>
                    <div
                        className={`mx-2 py-4 mb-4 cursor-pointer rounded-xl border transition-all shrink-0 
                              ${collapsed ? 'p-2 w-12 mx-auto' : 'px-6 py-4'}
                              ${isSettingsActive
                                ? 'bg-cyan-500/5 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                : 'border-cyan-500/5 hover:border-cyan-500/40'
                            }`}
                    >
                        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                            <Settings
                                size={18}
                                className={`shrink-0 transition-colors ${isSettingsActive ? 'text-cyan-400' : 'text-white'}`}
                            />
                            {!collapsed && (
                                <span className={`text-sm transition-colors ${isSettingsActive ? 'text-cyan-400 font-bold' : 'text-white'}`}>
                                    Settings
                                </span>
                            )}
                        </div>
                    </div>
                </Link>

                <div className={`mt-auto mb-6 mx-2 p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 ${collapsed ? 'w-12 mx-auto px-0' : 'px-4'}`}>
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <Avatar
                            size={40}
                            className="shrink-0"
                            src={data?.avatarUrl?.length === 0 ? <User size={22} className='text-cyan-200' /> : data?.avatarUrl}
                        />
                        {!collapsed && <div className="text-white text-xs truncate">{data?.fullname}</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
