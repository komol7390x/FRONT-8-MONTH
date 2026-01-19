import type React from 'react';
import { Badge, Drawer, Layout } from 'antd';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { ArrowLeft, Bell, LogOut, Menu as MenuIcon, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { TokenName } from '../../../config/enum';
import { jwtDecode } from 'jwt-decode';
import { Roles } from '../../../config/roles';
import { useEffect, useRef, useState } from 'react';

const { Header, Content, Footer } = Layout;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = Cookies.get(TokenName.TOKEN_NAME);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showFooter, setShowFooter] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowFooter(isAtBottom);
    };

    contentElement.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>

      {/* --- SIDEBAR QISMI --- */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <Drawer
        placement="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        width={288}
        styles={{ body: { padding: 0 } }}
        className="md:hidden"
      >
        <div onClickCapture={() => setMobileSidebarOpen(false)}>
          <Sidebar />
        </div>
      </Drawer>

      <Layout className="bg-linear-to-b from-[#1b1035] via-[#2a1a4d] to-[#1b1035] flex flex-col min-h-screen md:h-screen overflow-hidden">

        {/* 1. HEADER SECTION */}
        <Header className="bg-[#0a0e27]/50 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 md:px-6 flex items-center justify-between h-14 md:h-16 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <MenuIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-8 md:h-9 px-2 md:px-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-1 md:gap-2"
            >
              <ArrowLeft size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="text-sm sm:text-base md:text-lg font-medium text-white/90">
              <span className="md:hidden">Panel</span>
              <span className="hidden md:inline">Dashboard Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
            
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
        <Content className="flex-1 overflow-hidden flex flex-col">
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 md:p-6"
          >
            {/* Sahifalar shu yerda almashadi */}
            <div className="min-h-full pb-20">
              <Outlet />
            </div>
          </div>
        </Content>

        {/* 3. FOOTER SECTION - Only visible when scrolled to bottom */}
        {showFooter && (
          <Footer className="bg-[#0a0e27]/50 backdrop-blur-md border-t border-white/10 py-3 text-center text-slate-400 shrink-0 text-[10px] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Online Full Stack Course. Barcha huquqlar himoyalangan.
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};