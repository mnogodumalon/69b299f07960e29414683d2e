import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import TeilnehmerAnmeldungPage from '@/pages/TeilnehmerAnmeldungPage';
import KursleiterVerwaltungPage from '@/pages/KursleiterVerwaltungPage';
import KursVerwaltungPage from '@/pages/KursVerwaltungPage';
// <custom:imports>
// </custom:imports>

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ActionsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="teilnehmer-anmeldung" element={<TeilnehmerAnmeldungPage />} />
              <Route path="kursleiter-verwaltung" element={<KursleiterVerwaltungPage />} />
              <Route path="kurs-verwaltung" element={<KursVerwaltungPage />} />
              <Route path="admin" element={<AdminPage />} />
              {/* <custom:routes> */}
              {/* </custom:routes> */}
            </Route>
          </Routes>
        </ActionsProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
