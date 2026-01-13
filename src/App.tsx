import { Route, Routes } from 'react-router-dom';
import { MainPage } from './page/main/main';
import { PrivacyPolicy } from './page/main/privacy-policy/privacy-policy';
import { telegramRoutes } from './router/telegram.routes';
import { teacherRoutes } from './router/teacher.routes';
import { adminRoutes } from './router/admin.routes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {telegramRoutes}
      {teacherRoutes}
      {adminRoutes}
    </Routes>
  );
}

export default App;