import { Bell, ChevronLeft, ChevronRight, Settings, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import logo from '@/assets/img/logo.png';
import { Avatar, ConfigProvider, Menu } from 'antd';
import { items } from './menu';
import { Link, useLocation } from 'react-router-dom';
import { useTeacherDetails } from '../service/useTeacherDetails';

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { data, isPending, isError } = useTeacherDetails();
    const location = useLocation();

    const selectedKeys = useMemo(() => {
        const p = location.pathname;
        if (p.startsWith('/teacher-panel/statistics')) return ['teacher-stats'];
        if (p.startsWith('/teacher-panel/lessons')) return ['teacher-lessons'];
        if (p.startsWith('/teacher-panel/create-lesson')) return ['teacher-create-lesson'];
        if (p.startsWith('/teacher-panel/schedule')) return ['teacher-schedule'];
        if (p.startsWith('/teacher-panel/payment')) return ['teacher-payment'];
        if (p.startsWith('/teacher-panel/certificates')) return ['teacher-certificates'];
        return [];
    }, [location.pathname]);

    useEffect(() => {
        // keep hook stable on route changes
    }, [selectedKeys]);

    if (isPending) {
        return <div className="animate-pulse bg-white/10 h-10 w-full rounded-xl" />;
    }

    if (isError) {
        return <div className="text-rose-500 text-xs text-center">Ma'lumot yuklanmadi</div>;
    }

    const isNotificationActive = location.pathname.startsWith('/teacher-panel/notification');
    const isSettingsActive = location.pathname.startsWith('/teacher-panel/settings');

    return (
        <div>
            <div
                className={`h-screen bg-linear-to-b from-[#06122d] via-[#0b1b3d] to-[#06122d] flex flex-col shadow-2xl border-r border-white/10 relative transition-all duration-300 shrink-0 overflow-hidden ${collapsed ? 'w-20' : 'w-72'}`}
            >
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-10 right-0 z-50 bg-cyan-500 text-white p-1 rounded-l-md hover:bg-cyan-400 transition-colors shadow-lg"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                <Link to={'/teacher-panel/statistics'}>
                    <div className={`relative h-28 flex items-center shrink-0 transition-all duration-300 ${collapsed ? 'px-2 justify-center' : 'px-4'}`}>
                        <div className={`flex items-center gap-4 p-3 border cursor-pointer backdrop-blur-md hover:bg-white/10 rounded-xl transition-all w-full ${collapsed ? 'border-transparent justify-center' : 'border-white/10'}`}>
                            <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-linear-to-br from-cyan-500/20 to-blue-500/20 rounded-lg p-2">
                                <img src={logo} alt="logo" className="w-full h-full object-contain" />
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden shrink-0">
                                    <h1 className="text-white font-bold text-[12px] whitespace-nowrap">ONLINE FULL STACK</h1>
                                    <p className="text-cyan-400 font-semibold text-xs uppercase">Teacher</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

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
                            items={items}
                            className="bg-transparent border-none"
                            selectedKeys={selectedKeys}
                        />
                    </ConfigProvider>
                </div>

                <Link to={'/teacher-panel/notification'}>
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

                <Link to={'/teacher-panel/settings'}>
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
                        <Avatar size={40} className="shrink-0" src={<User size={22} className='text-cyan-200' />} />
                        {!collapsed && <div className="text-white text-xs truncate">{data?.fullname || 'Teacher'}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
