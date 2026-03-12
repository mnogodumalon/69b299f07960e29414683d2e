import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import TeilnehmerAnmeldungPage from '@/pages/TeilnehmerAnmeldungPage';
import KursVerwaltungPage from '@/pages/KursVerwaltungPage';
import YogaKursManagementPage from '@/pages/YogaKursManagementPage';
import KursleiterVerwaltungPage from '@/pages/KursleiterVerwaltungPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="teilnehmer-anmeldung" element={<TeilnehmerAnmeldungPage />} />
          <Route path="kurs-verwaltung" element={<KursVerwaltungPage />} />
          <Route path="yoga-kurs-management" element={<YogaKursManagementPage />} />
          <Route path="kursleiter-verwaltung" element={<KursleiterVerwaltungPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}