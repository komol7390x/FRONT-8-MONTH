import { Route, Routes } from 'react-router-dom';
import { MainPage } from './page/main/main';
import { PrivacyPolicy } from './page/main/privacy-policy/privacy-policy';
import { LoginTeacher } from './page/teacher/auth/login/login';
import { RegisterTeacher } from './page/teacher/auth/register/register';
import { LoginAdmin } from './page/admin/auth/login';
import { SuperAdminDashboard } from './page/admin/super-admin/dashboard';
import { AdminDashboard } from './page/admin/admin/dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/admin" element={<LoginAdmin />} />
      <Route path="/teacher" element={<LoginTeacher />} />
      <Route path="/teacher/register" element={<RegisterTeacher />} />

      <Route path="/super-admin" element={<SuperAdminDashboard />}>
        <Route path="dashboard" element={<div>Admin Dashboard Page</div>} />
        <Route path="statistics" element={<div>Statistics Page</div>} />
        <Route path="analytics" element={<div>Analytics Page</div>} />
        <Route path="users" element={<div>Users List Page</div>} />
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