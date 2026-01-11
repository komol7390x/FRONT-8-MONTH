import { Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LoginAdmin } from '../page/admin/auth/login';
import { AdminDashboard } from '../page/admin/admin/dashboard';
import { SuperAdminDashboard } from '../page/admin/super-admin/dashboard';
import { StatisticsAdmin } from '../page/admin/super-admin/admin/statistics-admin';
import AdminPanel from '../page/admin/super-admin/admin/blocked-admin';
import { DeleteAdmin } from '../page/admin/super-admin/admin/delete-admin';
import { ListAdmin } from '../page/admin/super-admin/admin/list-admin';
import { TeacherList } from '../page/admin/super-admin/teacher/teacher-list';
import { TeacherBlocked } from '../page/admin/super-admin/teacher/teacher-blocked';
import { TeacherDelete } from '../page/admin/super-admin/teacher/teacher-delete';
import { TeacherConfirm } from '../page/admin/super-admin/teacher/teacher-confirm';
import { TeacherStatistics } from '../page/admin/super-admin/teacher/teacher-statistics';
import { StudentList } from '../page/admin/super-admin/student/student-list';
import { StudentBlocked } from '../page/admin/super-admin/student/student-blocked';
import { StudentDelete } from '../page/admin/super-admin/student/student-delete';
import { StudentStatistics } from '../page/admin/super-admin/student/student-statistics';
import { LessonPage } from '../page/admin/super-admin/lesson/lesson-page';
import { SchedulePage } from '../page/admin/super-admin/schedule/schedule-page';
import { CertificatePage } from '../page/admin/super-admin/certificate/certificate-page';
import { PaymentPage } from '../page/admin/super-admin/payment/payment-page';
import { SettingsPage } from '../page/admin/super-admin/settings/settings-page';
import { NotificationPage } from '../page/admin/super-admin/notification/notification-page';
import { AddBalancePage } from '../page/admin/super-admin/student/add-balance-page';

export const adminRoutes = (
    <>
        <Route path="/admin/login" element={<LoginAdmin />} />

        <Route path="/super-admin" element={<SuperAdminDashboard />}>
            <Route path="admin">
                <Route path="statistics" element={<StatisticsAdmin />} />
                <Route path="list" element={<ListAdmin />} />
                <Route path="blocked" element={<AdminPanel />} />
                <Route path="delete" element={<DeleteAdmin />} />
            </Route>

            <Route path="teacher">
                <Route path="statistics" element={<TeacherStatistics />} />
                <Route path="all" element={<TeacherList />} />
                <Route path="blocked" element={<TeacherBlocked />} />
                <Route path="delete" element={<TeacherDelete />} />
                <Route path="confirm" element={<TeacherConfirm />} />
            </Route>

            <Route path="student">
                <Route path="statistics" element={<StudentStatistics />} />
                <Route path="all" element={<StudentList />} />
                <Route path="blocked" element={<StudentBlocked />} />
                <Route path="delete" element={<StudentDelete />} />
                <Route path="add-balance/:studentId" element={<AddBalancePage />} />
            </Route>

            <Route path="lesson" element={<LessonPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="certificate" element={<CertificatePage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="notification" element={<NotificationPage />} />
            <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Navigate to="teacher/all" replace />} />

            <Route path="teacher">
                <Route path="statistics" element={<TeacherStatistics />} />
                <Route path="all" element={<TeacherList />} />
                <Route path="blocked" element={<TeacherBlocked />} />
            </Route>

            <Route path="student">
                <Route path="statistics" element={<StudentStatistics />} />
                <Route path="all" element={<StudentList />} />
                <Route path="blocked" element={<StudentBlocked />} />
            </Route>

            <Route path="lesson" element={<LessonPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="certificate" element={<CertificatePage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="notification" element={<NotificationPage />} />
            <Route path="settings" element={<SettingsPage />} />
        </Route>
    </>
);
