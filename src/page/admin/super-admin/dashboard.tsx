import React from 'react';
import { Badge, Layout } from 'antd';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { Bell } from 'lucide-react';
import Cookies from 'js-cookie'
import { TokenName } from '../../../config/enum';
const { Header, Content, Footer } = Layout;

export const SuperAdminDashboard: React.FC = () => {
  const token = Cookies.get(TokenName.TOKEN_NAME);

  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <Sidebar />

      {/* --- O'NG TARAF: ASOSIY KONTENT --- */}
      <Layout className="bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex flex-col h-screen overflow-hidden">

        {/* 1. HEADER */}
        <Header className="bg-[#0a0e27]/50 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between h-16 shrink-0">
          <div className="text-lg font-medium text-white/90">Dashboard Panel</div>
          <div className="flex items-center gap-4">
            <Badge count={5} dot color="#06b6d4">
              <Bell size={20} className="text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors" />
            </Badge>
          </div>
        </Header>

        {/* 2. CONTENT */}
        <Content className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="min-h-full rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md p-6 text-white shadow-xl">
            <Outlet />
          </div>
        </Content>

        {/* 3. FOOTER */}
        <Footer className="bg-[#0a0e27]/50 backdrop-blur-md border-t border-white/10 py-3 text-center text-slate-400 shrink-0 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Online Full Stack Course
        </Footer>

      </Layout>
    </Layout>
  );
};