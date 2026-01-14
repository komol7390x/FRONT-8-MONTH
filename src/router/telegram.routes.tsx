import { Route } from 'react-router-dom';
import { TelegramWebAppShell } from '../components/telegram-webapp-shell';
import { StudentSchedulePage } from '../page/student/schedule-page';
import { StudentLessonsPage } from '../page/student/lessons-page';
import { StudentBookConfirmPage } from '../page/student/book-confirm-page';
import { StudentPaymentsPage } from '../page/student/payments-page';
import { StudentProfilePage } from '../page/student/profile-page';

export const telegramRoutes = (
    <>
        <Route
            path="/telegram/schedule"
            element={(
                <TelegramWebAppShell>
                    <StudentSchedulePage />
                </TelegramWebAppShell>
            )}
        />
        <Route
            path="/telegram/student-lessons"
            element={(
                <TelegramWebAppShell>
                    <StudentLessonsPage />
                </TelegramWebAppShell>
            )}
        />
        <Route
            path="/telegram/student-book-confirm"
            element={(
                <TelegramWebAppShell>
                    <StudentBookConfirmPage />
                </TelegramWebAppShell>
            )}
        />
        <Route
            path="/telegram/student-payments"
            element={(
                <TelegramWebAppShell>
                    <StudentPaymentsPage />
                </TelegramWebAppShell>
            )}
        />
        <Route
            path="/telegram/student/:studentId"
            element={(
                <TelegramWebAppShell>
                    <StudentProfilePage />
                </TelegramWebAppShell>
            )}
        />
    </>
);