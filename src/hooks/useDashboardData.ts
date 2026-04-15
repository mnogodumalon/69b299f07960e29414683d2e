import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TeilnehmerAnmeldung, KursleiterVerwaltung, KursVerwaltung } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [teilnehmerAnmeldung, setTeilnehmerAnmeldung] = useState<TeilnehmerAnmeldung[]>([]);
  const [kursleiterVerwaltung, setKursleiterVerwaltung] = useState<KursleiterVerwaltung[]>([]);
  const [kursVerwaltung, setKursVerwaltung] = useState<KursVerwaltung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [teilnehmerAnmeldungData, kursleiterVerwaltungData, kursVerwaltungData] = await Promise.all([
        LivingAppsService.getTeilnehmerAnmeldung(),
        LivingAppsService.getKursleiterVerwaltung(),
        LivingAppsService.getKursVerwaltung(),
      ]);
      setTeilnehmerAnmeldung(teilnehmerAnmeldungData);
      setKursleiterVerwaltung(kursleiterVerwaltungData);
      setKursVerwaltung(kursVerwaltungData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [teilnehmerAnmeldungData, kursleiterVerwaltungData, kursVerwaltungData] = await Promise.all([
          LivingAppsService.getTeilnehmerAnmeldung(),
          LivingAppsService.getKursleiterVerwaltung(),
          LivingAppsService.getKursVerwaltung(),
        ]);
        setTeilnehmerAnmeldung(teilnehmerAnmeldungData);
        setKursleiterVerwaltung(kursleiterVerwaltungData);
        setKursVerwaltung(kursVerwaltungData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const kursleiterVerwaltungMap = useMemo(() => {
    const m = new Map<string, KursleiterVerwaltung>();
    kursleiterVerwaltung.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kursleiterVerwaltung]);

  const kursVerwaltungMap = useMemo(() => {
    const m = new Map<string, KursVerwaltung>();
    kursVerwaltung.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kursVerwaltung]);

  return { teilnehmerAnmeldung, setTeilnehmerAnmeldung, kursleiterVerwaltung, setKursleiterVerwaltung, kursVerwaltung, setKursVerwaltung, loading, error, fetchAll, kursleiterVerwaltungMap, kursVerwaltungMap };
}