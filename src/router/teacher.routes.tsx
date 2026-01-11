import { Route } from 'react-router-dom';
import { LoginTeacher } from '../page/teacher/auth/login/login';
import { Navigate } from 'react-router-dom';
import { RegisterTeacher } from '../page/teacher/auth/register/register';
import { RegisterTeacherStep2 } from '../page/teacher/auth/register/register-step-2';
import { RegisterTeacherStep3 } from '../page/teacher/auth/register/register-step-3';
import { GoogleRegisterTeacherStep2 } from '../page/teacher/auth/register/google-step-2';
import { GoogleRegisterTeacherStep3 } from '../page/teacher/auth/register/google-step-3';
import { TeacherDashboard } from '../page/teacher/panel/dashboard';
import { TeacherStatisticsPage } from '../page/teacher/panel/pages/statistics-page';
import { TeacherLessonsPage } from '../page/teacher/panel/pages/lessons-page';
import { TeacherCreateLessonPage } from '../page/teacher/panel/pages/create-lesson-page';
import { TeacherPaymentPage } from '../page/teacher/panel/pages/payment-page';
import { TeacherSettingsPage } from '../page/teacher/panel/pages/settings-page';
import { TeacherNotificationPage } from '../page/teacher/panel/pages/notification-page';
import { TeacherCertificatesPage } from '../page/teacher/panel/pages/certificates-page';
import { TeacherSchedulePage } from '../page/teacher/panel/pages/schedule-page';

export const teacherRoutes = (
    <>
        <Route path="/teacher/login" element={<LoginTeacher />} />

        <Route path="/teacher/register" element={<RegisterTeacher />} />
        <Route path="/teacher/register/step-2" element={<RegisterTeacherStep2 />} />
        <Route path="/teacher/register/step-3" element={<RegisterTeacherStep3 />} />
        <Route path="/teacher/google/step-2" element={<GoogleRegisterTeacherStep2 />} />
        <Route path="/teacher/google/step-3" element={<GoogleRegisterTeacherStep3 />} />

        <Route path="/teacher-panel" element={<TeacherDashboard />}>
            <Route index element={<Navigate to="statistics" replace />} />
            <Route path="statistics" element={<TeacherStatisticsPage />} />
            <Route path="lessons" element={<TeacherLessonsPage />} />
            <Route path="create-lesson" element={<TeacherCreateLessonPage />} />
            <Route path="schedule" element={<TeacherSchedulePage />} />
            <Route path="payment" element={<TeacherPaymentPage />} />
            <Route path="certificates" element={<TeacherCertificatesPage />} />
            <Route path="notification" element={<TeacherNotificationPage />} />
            <Route path="settings" element={<TeacherSettingsPage />} />
        </Route>
    </>
);
