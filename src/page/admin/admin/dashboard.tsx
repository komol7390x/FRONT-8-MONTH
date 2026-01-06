import React from 'react';
import { Badge, Layout } from 'antd';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { ArrowLeft, Bell, LogOut, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { TokenName } from '../../../config/enum';
import { jwtDecode } from 'jwt-decode';
import { Roles } from '../../../config/roles';

const { Header, Content, Footer } = Layout;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = Cookies.get(TokenName.TOKEN_NAME);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const decoded: any = jwtDecode(token);
  const role = decoded?.role;

  if (role === Roles.SUPER_ADMIN) {
    return <Navigate to="/super-admin/admin/statistics" replace />;
  }

  const handleLogout = () => {
    Cookies.remove(TokenName.TOKEN_NAME);
    navigate('/admin/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      {/* --- SIDEBAR QISMI --- */}
      <Sidebar />

      <Layout className="bg-linear-to-b from-[#1b1035] via-[#2a1a4d] to-[#1b1035] flex flex-col h-screen overflow-hidden">

        {/* 1. HEADER SECTION */}
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
            <div className="text-lg font-medium text-white/90">
              Dashboard Panel
            </div>
          </div>
          <div className="flex items-center gap-10">
            {/* Headerga kerakli elementlarni (masalan, qidiruv yoki til tanlash) shu yerga qo'ying */}
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

        {/* 2. MAIN CONTENT (Outlet) */}
        <Content className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Sahifalar shu yerda almashadi */}
          <div className="min-h-full">
            <Outlet />
          </div>
        </Content>

        {/* 3. FOOTER SECTION */}
        <Footer className="bg-[#0a0e27]/50 backdrop-blur-md border-t border-white/10 py-3 text-center text-slate-400 shrink-0 text-[10px] uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Online Full Stack Course. Barcha huquqlar himoyalangan.
        </Footer>
      </Layout>
    </Layout>
  );
};