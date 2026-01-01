import React from 'react';
import { Badge, Layout } from 'antd';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { Bell, LogOut, User } from 'lucide-react';
import Cookies from 'js-cookie'
import { TokenName } from '../../../config/enum';
import { jwtDecode } from "jwt-decode";

const { Header, Content, Footer } = Layout;
export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = Cookies.get(TokenName.TOKEN_NAME);
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  const decoded: any = jwtDecode(token);
  const role = decoded.role
  const handleLogout = () => {
    Cookies.remove(TokenName.TOKEN_NAME);
    navigate('/admin', { replace: true });
  };
  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <Sidebar />

      {/* --- O'NG TARAF: ASOSIY KONTENT --- */}
      <Layout className="bg-linear-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex flex-col h-screen overflow-hidden">

        {/* 1. HEADER */}
        <Header className="bg-[#0a0e27]/50 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between h-16 shrink-0">
          <div className="text-lg font-medium text-white/90">Admin Panel</div>
          <div className="flex items-center gap-10">
            <div className='flex gap-3 items-center justify-center'>
              <User size={25} className="text-cyan-200" />
              <div className="inline-flex cursor-pointer items-center justify-center p-2 rounded-md text-[12px] font-bold tracking-tighter uppercase border border-cyan-500/30 bg-cyan-500/20 text-cyan-200 leading-none">
                {role}
              </div>
            </div>
            <Badge count={5} dot >
              <Bell size={20} className="text-slate-400 hover:text-cyan-200 cursor-pointer transition-colors" />
            </Badge>
            <LogOut
              size={22}
              className="text-cyan-200 hover:text-cyan-400 cursor-pointer transition-colors active:scale-90"
              onClick={handleLogout}
            />
          </div>
        </Header>

        {/* 2. CONTENT */}
        <Content className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <Outlet />
        </Content>

        {/* 3. FOOTER */}
        <Footer className="bg-[#0a0e27]/50 backdrop-blur-md border-t border-white/10 py-3 text-center text-slate-400 shrink-0 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Online Full Stack Course
        </Footer>

      </Layout>
    </Layout>
  );
};