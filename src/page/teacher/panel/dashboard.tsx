import React from 'react';
import { Badge, Layout } from 'antd';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { ArrowLeft, Bell, LogOut, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { TokenName } from '../../../config/enum';
import { jwtDecode } from 'jwt-decode';
import { Roles } from '../../../config/roles';

const { Header, Content, Footer } = Layout;

export const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = Cookies.get(TokenName.TOKEN_NAME);

    if (!token) {
        return <Navigate to="/teacher/login" replace />;
    }

    let role: string | undefined;
    let isActive: boolean | undefined;
    try {
        const decoded: any = jwtDecode<any>(token) as any;
        role = decoded?.role;
        isActive = decoded?.isActive;
    } catch {
        role = undefined;
        isActive = undefined;
    }

    if (String(role || '').toUpperCase() !== String(Roles.TEACHER).toUpperCase()) {
        return <Navigate to="/teacher/login" replace />;
    }

    if (isActive === false && location.pathname !== '/teacher-panel/settings') {
        return <Navigate to="/teacher-panel/settings" replace />;
    }

    const handleLogout = () => {
        Cookies.remove(TokenName.TOKEN_NAME);
        navigate('/teacher/login', { replace: true });
    };

    return (
        <Layout style={{ minHeight: '100vh' }} hasSider>
            <Sidebar />

            <Layout className="bg-linear-to-b from-[#052e2b] via-[#0f3d3a] to-[#052e2b] flex flex-col h-screen overflow-hidden">
                <Header className="bg-[#0a0e27]/50 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between h-16 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <div className="text-lg font-medium text-white/90">Teacher Panel</div>
                    </div>
                    <div className="flex items-center gap-10">
                        <div className='flex gap-3 items-center justify-center'>
                            <User size={25} className="text-cyan-200" />
                            <div className="inline-flex cursor-pointer items-center justify-center p-2 rounded-md text-[12px] font-bold tracking-tighter uppercase border border-cyan-500/30 bg-cyan-500/20 text-cyan-200 leading-none">
                                {String(role || '').toUpperCase()}
                            </div>
                        </div>
                        <Badge count={5} dot>
                            <Bell size={20} className="text-slate-400 hover:text-cyan-200 cursor-pointer transition-colors" />
                        </Badge>
                        <LogOut
                            size={22}
                            className="text-cyan-200 hover:text-cyan-400 cursor-pointer transition-colors active:scale-90"
                            onClick={handleLogout}
                        />
                    </div>
                </Header>

                <Content className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <Outlet />
                </Content>

                <Footer className="bg-[#0a0e27]/50 backdrop-blur-md border-t border-white/10 py-3 text-center text-slate-400 shrink-0 text-[10px] uppercase tracking-widest">
                    © {new Date().getFullYear()} Online Full Stack Course
                </Footer>
            </Layout>
        </Layout>
    );
};
