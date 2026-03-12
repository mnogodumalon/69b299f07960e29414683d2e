import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TeilnehmerAnmeldung, KursVerwaltung, YogaKursManagement, KursleiterVerwaltung } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [teilnehmerAnmeldung, setTeilnehmerAnmeldung] = useState<TeilnehmerAnmeldung[]>([]);
  const [kursVerwaltung, setKursVerwaltung] = useState<KursVerwaltung[]>([]);
  const [yogaKursManagement, setYogaKursManagement] = useState<YogaKursManagement[]>([]);
  const [kursleiterVerwaltung, setKursleiterVerwaltung] = useState<KursleiterVerwaltung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [teilnehmerAnmeldungData, kursVerwaltungData, yogaKursManagementData, kursleiterVerwaltungData] = await Promise.all([
        LivingAppsService.getTeilnehmerAnmeldung(),
        LivingAppsService.getKursVerwaltung(),
        LivingAppsService.getYogaKursManagement(),
        LivingAppsService.getKursleiterVerwaltung(),
      ]);
      setTeilnehmerAnmeldung(teilnehmerAnmeldungData);
      setKursVerwaltung(kursVerwaltungData);
      setYogaKursManagement(yogaKursManagementData);
      setKursleiterVerwaltung(kursleiterVerwaltungData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const kursVerwaltungMap = useMemo(() => {
    const m = new Map<string, KursVerwaltung>();
    kursVerwaltung.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kursVerwaltung]);

  const yogaKursManagementMap = useMemo(() => {
    const m = new Map<string, YogaKursManagement>();
    yogaKursManagement.forEach(r => m.set(r.record_id, r));
    return m;
  }, [yogaKursManagement]);

  const kursleiterVerwaltungMap = useMemo(() => {
    const m = new Map<string, KursleiterVerwaltung>();
    kursleiterVerwaltung.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kursleiterVerwaltung]);

  return { teilnehmerAnmeldung, setTeilnehmerAnmeldung, kursVerwaltung, setKursVerwaltung, yogaKursManagement, setYogaKursManagement, kursleiterVerwaltung, setKursleiterVerwaltung, loading, error, fetchAll, kursVerwaltungMap, yogaKursManagementMap, kursleiterVerwaltungMap };
}