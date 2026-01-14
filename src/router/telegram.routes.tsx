import { Route } from 'react-router-dom';
import { TelegramWebAppShell } from '../components/telegram-webapp-shell';
import { StudentSchedulePage } from '../page/student/schedule-page';
import { StudentLessonsPage } from '../page/student/lessons-page';
import { StudentBookConfirmPage } from '../page/student/book-confirm-page';
import { StudentPaymentsPage } from '../page/student/payments-page';
import { StudentProfilePage } from '../page/student/profile-page';

export const telegramRoutes = (
    <Route element={<TelegramWebAppShell />}>
        <Route path="/telegram/schedule" element={<StudentSchedulePage />} />
        <Route path="/telegram/student-lessons" element={<StudentLessonsPage />} />
        <Route path="/telegram/student-book-confirm" element={<StudentBookConfirmPage />} />
        <Route path="/telegram/student-payments" element={<StudentPaymentsPage />} />
        <Route path="/telegram/student/:studentId" element={<StudentProfilePage />} />
    </Route>
);