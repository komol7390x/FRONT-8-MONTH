import type React from 'react';
import { Badge, Layout } from 'antd';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/sidebar';
import { ArrowLeft, Bell, LogOut, User } from 'lucide-react';
import Cookies from 'js-cookie'
import { TokenName } from '../../../config/enum';
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from 'react';

const { Header, Content, Footer } = Layout;

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = Cookies.get(TokenName.TOKEN_NAME);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showFooter, setShowFooter] = useState(false);
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  const decoded: any = jwtDecode(token);
  const role = decoded.role
  const handleLogout = () => {
    Cookies.remove(TokenName.TOKEN_NAME);
    navigate('/admin/login', { replace: true });
  };

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
      setShowFooter(isAtBottom);
    };

    contentElement.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* --- O'NG TARAF: ASOSIY KONTENT --- */}
      <Layout className="bg-linear-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex flex-col min-h-screen md:h-screen overflow-hidden">

        {/* 1. HEADER */}
        <Header className="bg-[#0a0e27]/50 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 md:px-6 flex items-center justify-between h-14 md:h-16 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-8 md:h-9 px-2 md:px-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-1 md:gap-2"
            >
              <ArrowLeft size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="text-sm sm:text-base md:text-lg font-medium text-white/90">
              <span className="md:hidden">Admin</span>
              <span className="hidden md:inline">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
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
        <Content className="flex-1 overflow-hidden flex flex-col">
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 md:p-6"
          >
            <div className="min-h-full pb-20">
              <Outlet />
            </div>
          </div>
        </Content>

        {/* 3. FOOTER - Only visible when scrolled to bottom */}
        {showFooter && (
          <Footer className="bg-[#0a0e27]/50 backdrop-blur-md border-t border-white/10 py-3 text-center text-slate-400 shrink-0 text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} Online Full Stack Course
          </Footer>
        )}

      </Layout>
    </Layout>
  );
};