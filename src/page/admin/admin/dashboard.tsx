import React from 'react';
import { Bell } from 'lucide-react';
import { Badge, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
const { Header, Content, Footer } = Layout;


export const AdminDashboard: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      {/* --- SIDEBAR QISMI --- */}
      <Sidebar />
      
      <Layout className="bg-[#f0f2f5] flex flex-col h-screen">

        {/* 1. HEADER SECTION */}
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="text-lg font-medium text-slate-800">
            Dashboard Panel
          </div>
          <div className="flex items-center gap-4">
            {/* Headerga kerakli elementlarni (masalan, qidiruv yoki til tanlash) shu yerga qo'ying */}
            <Badge count={5} dot>
              <Bell size={20} className="text-slate-500 cursor-pointer" />
            </Badge>
          </div>
        </Header>

        {/* 2. MAIN CONTENT (Outlet) */}
        <Content
          className="overflow-y-auto custom-scrollbar flex-1"
          style={{ padding: '24px' }}
        >
          {/* Sahifalar shu yerda almashadi */}
          <div className="min-h-full">
            <Outlet />
          </div>
        </Content>

        {/* 3. FOOTER SECTION */}
        <Footer className="bg-white border-t border-gray-100 py-4 text-center text-slate-500 shrink-0">
          © {new Date().getFullYear()} Online Full Stack Course. Barcha huquqlar himoyalangan.
        </Footer>
      </Layout>
    </Layout>
  );
};