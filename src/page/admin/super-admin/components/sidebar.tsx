import { Bell, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useState } from 'react'
import logo from '@/assets/img/logo.png'
import { Avatar, ConfigProvider, Menu } from 'antd';
import { items } from './menu';
import { Link } from 'react-router-dom';
import { useGetMe } from '../admin/service/get-me';

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { data, isPending, isError } = useGetMe()
    const [activeTab, setActiveTab] = useState<string>('');
    if (isPending) {
        return <div className="animate-pulse bg-white/10 h-10 w-full rounded-xl" />;
    }
    if (isError) {
        return <div className="text-rose-500 text-xs text-center">Ma'lumot yuklanmadi</div>;
    }
    return (
        <div>
            {/* --- SIDEBAR QISMI --- */}
            <div
                className={`h-screen bg-linear-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex flex-col shadow-2xl border-r border-white/10 relative transition-all duration-300 shrink-0 overflow-hidden ${collapsed ? 'w-20' : 'w-72'
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
                <Link to={'/super-admin/statistics'}>
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
                            defaultSelectedKeys={['1']}
                        />
                    </ConfigProvider>
                </div>

                {/* --- Notification SECTION --- */}
                <div
                    onClick={() => setActiveTab('notifications')}
                    className={`mx-2 py-4 mb-4 cursor-pointer rounded-xl border transition-all shrink-0 
                            ${collapsed ? 'p-2 w-12 mx-auto' : 'px-6 py-4'}
                            ${activeTab === 'notifications'
                            ? 'bg-cyan-500/5 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]' // Bosilgandagi holat
                            : 'border-cyan-500/5 hover:border-cyan-500/40' // Oddiy holat
                        }`}
                >
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <Bell
                            size={18}
                            className={`shrink-0 transition-colors ${activeTab === 'notifications' ? 'text-cyan-400' : 'text-white'}`}
                        />
                        {!collapsed && (
                            <span className={`text-sm transition-colors ${activeTab === 'notifications' ? 'text-cyan-400 font-bold' : 'text-white'}`}>
                                Updates
                            </span>
                        )}
                    </div>
                </div>

                {/* --- User Profile SECTION --- */}
                <div
                    onClick={() => setActiveTab('profile')}
                    className={`mt-auto mb-6 mx-2 p-3 rounded-xl cursor-pointer border transition-all shrink-0 
                            ${collapsed ? 'w-12 mx-auto px-0' : 'px-4'}
                            ${activeTab === 'profile'
                            ? 'bg-cyan-500/5 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]' // Bosilgandagi holat
                            : 'border-cyan-500/5 hover:border-cyan-500/40' // Oddiy holat
                        }`}
                >
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <Avatar
                            size={40}
                            className={`shrink-0 border transition-all ${activeTab === 'profile' ? 'border-cyan-400' : 'border-transparent'}`}
                            src={data?.avatarUrl?.length === 0 ? <User size={22} className='text-cyan-200' /> : data?.avatarUrl}
                        />
                        {!collapsed && (
                            <div className={`text-[16px] truncate transition-colors ${activeTab === 'profile' ? 'text-cyan-400 font-bold' : 'text-cyan-200'}`}>
                                {data?.fullname}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
