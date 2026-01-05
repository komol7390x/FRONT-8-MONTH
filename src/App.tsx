import { Route, Routes } from 'react-router-dom';
import { MainPage } from './page/main/main';
import { PrivacyPolicy } from './page/main/privacy-policy/privacy-policy';
import { LoginTeacher } from './page/teacher/auth/login/login';
import { RegisterTeacher } from './page/teacher/auth/register/register';
import { LoginAdmin } from './page/admin/auth/login';
import { SuperAdminDashboard } from './page/admin/super-admin/dashboard';
import { AdminDashboard } from './page/admin/admin/dashboard';
import { StatisticsAdmin } from './page/admin/super-admin/admin/statistics-admin';
import AdminPanel from './page/admin/super-admin/admin/blocked-admin';
import { DeleteAdmin } from './page/admin/super-admin/admin/delete-admin';
import { ListAdmin } from './page/admin/super-admin/admin/list-admin';
import { TeacherList } from './page/admin/super-admin/teacher/teacher-list';
import { TeacherBlocked } from './page/admin/super-admin/teacher/teacher-blocked';
import { TeacherDelete } from './page/admin/super-admin/teacher/teacher-delete';
import { TeacherConfirm } from './page/admin/super-admin/teacher/teacher-confirm';
import { TeacherStatistics } from './page/admin/super-admin/teacher/teacher-statistics';
import { StudentList } from './page/admin/super-admin/student/student-list';
import { StudentBlocked } from './page/admin/super-admin/student/student-blocked';
import { StudentDelete } from './page/admin/super-admin/student/student-delete';
import { StudentStatistics } from './page/admin/super-admin/student/student-statistics';
import { LessonPage } from './page/admin/super-admin/lesson/lesson-page';
import { CertificatePage } from './page/admin/super-admin/certificate/certificate-page';
import { PaymentPage } from './page/admin/super-admin/payment/payment-page';
import { SettingsPage } from './page/admin/super-admin/settings/settings-page';
import { NotificationPage } from './page/admin/super-admin/notification/notification-page';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/admin/login" element={<LoginAdmin />} />
      <Route path="/teacher" element={<LoginTeacher />} />
      <Route path="/teacher/register" element={<RegisterTeacher />} />

      <Route path="/super-admin" element={<SuperAdminDashboard />}>
        <Route path='admin'>
          <Route path="statistics" element={<StatisticsAdmin />} />
          <Route path="list" element={<ListAdmin />} />
          <Route path="blocked" element={<AdminPanel />} />
          <Route path="delete" element={<DeleteAdmin />} />
        </Route>

        <Route path='teacher'>
          <Route path='statistics' element={<TeacherStatistics />} />
          <Route path="all" element={<TeacherList />} />
          <Route path="blocked" element={<TeacherBlocked />} />
          <Route path="delete" element={<TeacherDelete />} />
          <Route path="confirm" element={<TeacherConfirm />} />
        </Route>

        <Route path='student'>
          <Route path="statistics" element={<StudentStatistics />} />
          <Route path="all" element={<StudentList />} />
          <Route path="blocked" element={<StudentBlocked />} />
          <Route path="delete" element={<StudentDelete />} />
        </Route>

        <Route path='lesson' element={<LessonPage />} />
        <Route path='certificate' element={<CertificatePage />} />
        <Route path='payment' element={<PaymentPage />} />
        <Route path='notification' element={<NotificationPage />} />
        <Route path='settings' element={<SettingsPage />} />
      </Route>

      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<Navigate to="teacher/all" replace />} />
        <Route path='teacher'>
          <Route path='statistics' element={<TeacherStatistics />} />
          <Route path="all" element={<TeacherList />} />
          <Route path="blocked" element={<TeacherBlocked />} />
        </Route>

        <Route path='student'>
          <Route path='statistics' element={<StudentStatistics />} />
          <Route path="all" element={<StudentList />} />
          <Route path="blocked" element={<StudentBlocked />} />
        </Route>

        <Route path='lesson' element={<LessonPage />} />
        <Route path='certificate' element={<CertificatePage />} />
        <Route path='payment' element={<PaymentPage />} />
        <Route path='notification' element={<NotificationPage />} />
        <Route path='settings' element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
