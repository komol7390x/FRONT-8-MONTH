import { Route, Routes } from 'react-router-dom';
import { MainPage } from './page/main/main';
import { PrivacyPolicy } from './page/main/privacy-policy/privacy-policy';
import { LoginTeacher } from './page/teacher/auth/login/login';
import { RegisterTeacher } from './page/teacher/auth/register/register';
import { LoginAdmin } from './page/admin/auth/login';
import { SuperAdminDashboard } from './page/admin/super-admin/dashboard';
import { AdminDashboard } from './page/admin/admin/dashboard';
import { StatisticsAdmin } from './page/admin/super-admin/admin/statistics-admin';
import { ListAdmin } from './page/admin/super-admin/admin/list-admin';
import AdminPanel from './page/admin/super-admin/admin/blocked-admin';
import { DeleteAdmin } from './page/admin/super-admin/admin/delete-admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/admin" element={<LoginAdmin />} />
      <Route path="/teacher" element={<LoginTeacher />} />
      <Route path="/teacher/register" element={<RegisterTeacher />} />

      <Route path="/super-admin" element={<SuperAdminDashboard />}>
        <Route path='admin'>
          <Route path="statistics" element={<StatisticsAdmin />} />
          <Route path="list" element={<ListAdmin />} />
          <Route path="blocked" element={<AdminPanel />} />
          <Route path="delete" element={<DeleteAdmin />} />
        </Route>
      </Route>

      <Route path="/admin" element={<AdminDashboard />}>
        <Route path="dashboard" element={<div>Admin Dashboard Page</div>} />
        <Route path="statistics" element={<div>Statistics Page</div>} />
        <Route path="analytics" element={<div>Analytics Page</div>} />
        <Route path="users" element={<div>Users List Page</div>} />
      </Route>
    </Routes>
  );
}

export default App;
  